import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatCurrency } from '@/lib/supabase-helpers';
import { Users, Ban, Check, X, Search, DollarSign, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Database } from '@/integrations/supabase/types';

type UserStatus = Database['public']['Enums']['user_status'];

const Admin = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      navigate('/dashboard');
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
      fetchWithdrawals();
    }
  }, [role]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select(`*, wallets(*)`);
    if (data) setUsers(data);
  };

  const fetchWithdrawals = async () => {
    const { data } = await supabase.from('withdrawals').select(`*, profiles(username, email)`).order('created_at', { ascending: false });
    if (data) setWithdrawals(data);
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
    if (!error) {
      toast({ title: 'Success', description: `User ${status}` });
      fetchUsers();
    }
  };

  const handleWithdrawal = async (id: string, status: 'approved' | 'denied') => {
    const { error } = await supabase.from('withdrawals').update({ status, processed_by: user?.id, processed_at: new Date().toISOString() }).eq('id', id);
    if (!error) {
      toast({ title: 'Success', description: `Withdrawal ${status}` });
      fetchWithdrawals();
    }
  };

  const handleTransfer = async () => {
    if (!transferFrom || !transferTo || !transferAmount || parseFloat(transferAmount) <= 0) {
      toast({ title: 'Error', description: 'Please fill all fields correctly', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(transferAmount);
    const fromUser = users.find(u => u.id === transferFrom);
    const fromBalance = parseFloat(fromUser?.wallets?.[0]?.balance || 0);

    if (fromBalance < amount) {
      toast({ title: 'Error', description: 'Insufficient balance', variant: 'destructive' });
      return;
    }

    // Deduct from sender
    const { error: deductError } = await supabase
      .from('wallets')
      .update({ balance: fromBalance - amount })
      .eq('user_id', transferFrom)
      .eq('currency', 'ERSX');

    if (deductError) {
      toast({ title: 'Error', description: 'Transfer failed', variant: 'destructive' });
      return;
    }

    // Add to receiver
    const toUser = users.find(u => u.id === transferTo);
    const toBalance = parseFloat(toUser?.wallets?.[0]?.balance || 0);

    const { error: addError } = await supabase
      .from('wallets')
      .update({ balance: toBalance + amount })
      .eq('user_id', transferTo)
      .eq('currency', 'ERSX');

    if (addError) {
      // Rollback
      await supabase.from('wallets').update({ balance: fromBalance }).eq('user_id', transferFrom).eq('currency', 'ERSX');
      toast({ title: 'Error', description: 'Transfer failed', variant: 'destructive' });
      return;
    }

    // Record transactions
    await supabase.from('transactions').insert([
      { user_id: transferFrom, type: 'transfer', amount: -amount, description: `Transfer to ${toUser?.username}` },
      { user_id: transferTo, type: 'transfer', amount, description: `Transfer from ${fromUser?.username}` }
    ]);

    toast({ title: 'Success', description: `Transferred ${amount} ERSX` });
    setTransferOpen(false);
    setTransferFrom('');
    setTransferTo('');
    setTransferAmount('');
    fetchUsers();
  };

  const filteredUsers = users.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading || role !== 'admin') return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-warning">Admin Panel</h1>
            <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Send className="w-4 h-4 mr-2" />Transfer Funds</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Transfer Funds Between Users</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>From User</Label>
                    <Select value={transferFrom} onValueChange={setTransferFrom}>
                      <SelectTrigger><SelectValue placeholder="Select sender" /></SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.username} ({formatCurrency(parseFloat(u.wallets?.[0]?.balance || 0), 2)} ERSX)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>To User</Label>
                    <Select value={transferTo} onValueChange={setTransferTo}>
                      <SelectTrigger><SelectValue placeholder="Select receiver" /></SelectTrigger>
                      <SelectContent>
                        {users.filter(u => u.id !== transferFrom).map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.username} ({formatCurrency(parseFloat(u.wallets?.[0]?.balance || 0), 2)} ERSX)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (ERSX)</Label>
                    <Input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="0.00" />
                  </div>
                  <Button onClick={handleTransfer} className="w-full">Transfer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="users">
            <TabsList className="mb-6">
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
              <TabsTrigger value="withdrawals"><DollarSign className="w-4 h-4 mr-2" />Withdrawals</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="glass-card p-4 mb-4">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" /></div>
              </div>
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-border"><th className="text-left p-4 text-sm text-muted-foreground">User</th><th className="text-left p-4 text-sm text-muted-foreground">Balance</th><th className="text-left p-4 text-sm text-muted-foreground">Status</th><th className="text-left p-4 text-sm text-muted-foreground">Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-border/50">
                        <td className="p-4"><p className="font-medium">{u.username}</p><p className="text-sm text-muted-foreground">{u.email}</p></td>
                        <td className="p-4 font-mono">{formatCurrency(parseFloat(u.wallets?.[0]?.balance || 0), 4)} ERSX</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${u.status === 'active' ? 'bg-success/20 text-success' : u.status === 'frozen' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'}`}>{u.status}</span></td>
                        <td className="p-4 flex gap-2">
                          {u.status !== 'frozen' && <Button size="sm" variant="outline" onClick={() => updateUserStatus(u.id, 'frozen')}>Freeze</Button>}
                          {u.status !== 'banned' && <Button size="sm" variant="destructive" onClick={() => updateUserStatus(u.id, 'banned')}><Ban className="w-4 h-4" /></Button>}
                          {u.status !== 'active' && <Button size="sm" variant="success" onClick={() => updateUserStatus(u.id, 'active')}><Check className="w-4 h-4" /></Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="withdrawals">
              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-border"><th className="text-left p-4 text-sm text-muted-foreground">User</th><th className="text-left p-4 text-sm text-muted-foreground">Amount</th><th className="text-left p-4 text-sm text-muted-foreground">Address</th><th className="text-left p-4 text-sm text-muted-foreground">Status</th><th className="text-left p-4 text-sm text-muted-foreground">Date</th><th className="text-left p-4 text-sm text-muted-foreground">Actions</th></tr></thead>
                  <tbody>
                    {withdrawals.map(w => (
                      <tr key={w.id} className="border-b border-border/50">
                        <td className="p-4"><p className="font-medium">{w.profiles?.username}</p></td>
                        <td className="p-4 font-mono">{formatCurrency(parseFloat(w.amount), 4)} {w.currency}</td>
                        <td className="p-4 font-mono text-xs max-w-[150px] truncate">{w.wallet_address}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${w.status === 'approved' ? 'bg-success/20 text-success' : w.status === 'pending' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'}`}>{w.status}</span></td>
                        <td className="p-4 text-sm text-muted-foreground">{formatDate(w.created_at)}</td>
                        <td className="p-4">{w.status === 'pending' && <div className="flex gap-2"><Button size="sm" variant="success" onClick={() => handleWithdrawal(w.id, 'approved')}><Check className="w-4 h-4" /></Button><Button size="sm" variant="destructive" onClick={() => handleWithdrawal(w.id, 'denied')}><X className="w-4 h-4" /></Button></div>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
