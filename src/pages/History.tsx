import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatCurrency } from '@/lib/supabase-helpers';
import { ArrowUpRight, ArrowDownRight, Gift, RefreshCw, Send } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  price: number | null;
  fee: number;
  status: string;
  description: string | null;
  created_at: string;
}

const History = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data && !error) {
        setTransactions(data.map(t => ({
          ...t,
          amount: parseFloat(t.amount?.toString() || '0'),
          price: t.price ? parseFloat(t.price.toString()) : null,
          fee: parseFloat(t.fee?.toString() || '0'),
        })));
      }
      setLoadingData(false);
    };

    fetchTransactions();
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowDownRight className="w-4 h-4 text-success" />;
      case 'sell':
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case 'deposit':
        return <ArrowDownRight className="w-4 h-4 text-success" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case 'transfer':
        return <Send className="w-4 h-4 text-primary" />;
      case 'referral_bonus':
        return <Gift className="w-4 h-4 text-warning" />;
      default:
        return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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
          <h1 className="text-2xl font-bold mb-6">Transaction History</h1>

          <div className="glass-card overflow-hidden">
            {loadingData ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Start trading to see your history</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm text-muted-foreground font-medium">Type</th>
                      <th className="text-left p-4 text-sm text-muted-foreground font-medium">Amount</th>
                      <th className="text-left p-4 text-sm text-muted-foreground font-medium">Price</th>
                      <th className="text-left p-4 text-sm text-muted-foreground font-medium">Fee</th>
                      <th className="text-left p-4 text-sm text-muted-foreground font-medium">Status</th>
                      <th className="text-left p-4 text-sm text-muted-foreground font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50 table-row-hover">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                              {getIcon(tx.type)}
                            </div>
                            <div>
                              <p className="font-medium">{getTypeLabel(tx.type)}</p>
                              {tx.description && (
                                <p className="text-xs text-muted-foreground">{tx.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono">
                          <span className={tx.type === 'buy' || tx.type === 'deposit' || tx.type === 'referral_bonus' ? 'text-success' : 'text-destructive'}>
                            {tx.type === 'buy' || tx.type === 'deposit' || tx.type === 'referral_bonus' ? '+' : '-'}
                            {formatCurrency(tx.amount, 4)} {tx.currency}
                          </span>
                        </td>
                        <td className="p-4 font-mono">
                          {tx.price ? `$${formatCurrency(tx.price, 4)}` : '-'}
                        </td>
                        <td className="p-4 font-mono text-muted-foreground">
                          {tx.fee > 0 ? `${formatCurrency(tx.fee, 4)} ${tx.currency}` : '-'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tx.status === 'completed' ? 'bg-success/20 text-success' :
                            tx.status === 'pending' ? 'bg-warning/20 text-warning' :
                            'bg-destructive/20 text-destructive'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {formatDate(tx.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
