import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { TradingChart } from '@/components/charts/TradingChart';
import { OrderBook } from '@/components/trading/OrderBook';
import { TradePanel } from '@/components/trading/TradePanel';
import { RecentTrades } from '@/components/trading/RecentTrades';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .eq('currency', 'ERSX')
        .maybeSingle();
      
      if (data) {
        setBalance(parseFloat(data.balance?.toString() || '0'));
      }
    };

    fetchBalance();
  }, [user]);

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
        <div className="container mx-auto">
          {/* Market Overview */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">ERSX Trading</h1>
              <p className="text-muted-foreground">Live market data and trading</p>
            </div>
            <div className="glass-card px-4 py-2">
              <p className="text-xs text-muted-foreground">Your Balance</p>
              <p className="text-lg font-bold font-mono text-primary">{balance.toFixed(4)} ERSX</p>
            </div>
          </div>

          {/* Trading Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Chart - Main Area */}
            <div className="lg:col-span-8">
              <TradingChart />
            </div>

            {/* Trade Panel */}
            <div className="lg:col-span-4">
              <TradePanel balance={balance} />
            </div>

            {/* Order Book */}
            <div className="lg:col-span-4">
              <OrderBook />
            </div>

            {/* Recent Trades */}
            <div className="lg:col-span-4">
              <RecentTrades />
            </div>

            {/* Market Stats */}
            <div className="lg:col-span-4">
              <div className="glass-card p-4 h-full">
                <h3 className="font-semibold mb-4">Market Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h High</span>
                    <span className="font-mono text-success">$1.2850</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Low</span>
                    <span className="font-mono text-destructive">$1.1920</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="font-mono">24,521,840 ERSX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Trades</span>
                    <span className="font-mono">12,453</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Cap</span>
                    <span className="font-mono">$125.4M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Circulating Supply</span>
                    <span className="font-mono">100M ERSX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
