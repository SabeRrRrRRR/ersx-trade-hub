import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Send, Download, RefreshCw, Plus } from 'lucide-react';

interface Wallet {
  id: string;
  currency: string;
  balance: number;
  address: string;
}

const Wallet = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency', 'ERSX')
        .maybeSingle();
      
      if (data && !error) {
        setWallet({
          ...data,
          balance: parseFloat(data.balance?.toString() || '0'),
        });
      }
    };

    fetchWallet();
  }, [user]);

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: 'Copied!',
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const handleWithdraw = async () => {
    if (!user || !wallet) return;
    
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (amount > wallet.balance) {
      toast({
        title: 'Insufficient balance',
        description: 'You do not have enough ERSX',
        variant: 'destructive',
      });
      return;
    }

    if (!withdrawAddress) {
      toast({
        title: 'Invalid address',
        description: 'Please enter a valid wallet address',
        variant: 'destructive',
      });
      return;
    }

    setIsWithdrawing(true);
    
    try {
      const { error } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount,
        currency: 'ERSX',
        wallet_address: withdrawAddress,
      });

      if (error) throw error;

      toast({
        title: 'Withdrawal requested',
        description: 'Your withdrawal is pending approval',
      });

      setWithdrawAmount('');
      setWithdrawAddress('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold mb-6">Wallet</h1>

          {/* Balance Card */}
          <div className="glass-card p-6 mb-6 gradient-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-4xl font-bold font-mono">
                  {wallet?.balance.toFixed(4) || '0.0000'} <span className="text-primary">ERSX</span>
                </p>
                <p className="text-muted-foreground mt-1">
                  ≈ ${((wallet?.balance || 0) * 1.25).toFixed(2)} USD
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-2xl">E</span>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="glass-card p-6 mb-6">
            <h2 className="font-semibold mb-4">Your Wallet Address</h2>
            <div className="flex gap-2">
              <Input
                value={wallet?.address || ''}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyAddress}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use this address to receive ERSX tokens
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Download className="w-5 h-5" />
              <span>Deposit</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Send className="w-5 h-5" />
              <span>Send</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <RefreshCw className="w-5 h-5" />
              <span>Convert</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Plus className="w-5 h-5" />
              <span>Buy ERSX</span>
            </Button>
          </div>

          {/* Withdraw Section */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4">Withdraw ERSX</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Amount</label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="pr-20"
                  />
                  <button
                    onClick={() => setWithdrawAmount(wallet?.balance.toString() || '0')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Destination Address</label>
                <Input
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder="0x..."
                  className="mt-1 font-mono"
                />
              </div>
              <div className="glass-panel p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span>0.001 ERSX</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">You will receive</span>
                  <span className="font-mono">
                    {Math.max(0, parseFloat(withdrawAmount || '0') - 0.001).toFixed(4)} ERSX
                  </span>
                </div>
              </div>
              <Button
                variant="hero"
                className="w-full"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? 'Processing...' : 'Request Withdrawal'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Withdrawals require admin approval and may take up to 24 hours
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wallet;
