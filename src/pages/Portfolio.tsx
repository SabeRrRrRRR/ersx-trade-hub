import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface PortfolioData {
  balance: number;
  totalValue: number;
  change24h: number;
  changePercent: number;
}

const Portfolio = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    balance: 0,
    totalValue: 0,
    change24h: 0,
    changePercent: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .eq('currency', 'ERSX')
        .maybeSingle();
      
      if (data) {
        const balance = parseFloat(data.balance?.toString() || '0');
        const totalValue = balance * 1.25;
        const change24h = totalValue * 0.0524;
        
        setPortfolio({
          balance,
          totalValue,
          change24h,
          changePercent: 5.24,
        });
      }
    };

    fetchPortfolio();
  }, [user]);

  const chartData = [
    { name: 'ERSX', value: portfolio.totalValue, color: 'hsl(174, 72%, 46%)' },
  ];

  const isPositive = portfolio.changePercent >= 0;

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
          <h1 className="text-2xl font-bold mb-6">Portfolio</h1>

          {/* Portfolio Overview */}
          <div className="glass-card p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                <p className="text-4xl font-bold mb-2">
                  ${portfolio.totalValue.toFixed(2)}
                </p>
                <div className={`flex items-center gap-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">
                    {isPositive ? '+' : ''}${portfolio.change24h.toFixed(2)} ({isPositive ? '+' : ''}{portfolio.changePercent.toFixed(2)}%)
                  </span>
                  <span className="text-muted-foreground text-sm">24h</span>
                </div>
              </div>
              
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ payload }) => {
                        if (payload && payload.length) {
                          return (
                            <div className="glass-card p-2 text-sm">
                              <p>{payload[0].name}: ${payload[0].value?.toLocaleString()}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Holdings */}
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4">Your Holdings</h2>
            
            <div className="space-y-4">
              {/* ERSX Holdings */}
              <div className="flex items-center justify-between p-4 glass-panel rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">E</span>
                  </div>
                  <div>
                    <p className="font-semibold">ERSX</p>
                    <p className="text-sm text-muted-foreground">ERSX Token</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-mono font-semibold">{portfolio.balance.toFixed(4)}</p>
                  <p className="text-sm text-muted-foreground">${portfolio.totalValue.toFixed(2)}</p>
                </div>
                
                <div className={`text-right ${isPositive ? 'text-success' : 'text-destructive'}`}>
                  <p className="font-semibold">{isPositive ? '+' : ''}{portfolio.changePercent.toFixed(2)}%</p>
                  <p className="text-sm">24h</p>
                </div>
              </div>

              {/* Empty State for other coins */}
              <div className="flex items-center justify-center p-8 border border-dashed border-border rounded-lg">
                <div className="text-center">
                  <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No other holdings</p>
                  <p className="text-sm text-muted-foreground">Start trading to diversify your portfolio</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">All-Time High</p>
              <p className="text-xl font-bold text-success">$1.45</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">All-Time Low</p>
              <p className="text-xl font-bold text-destructive">$0.85</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Avg. Buy Price</p>
              <p className="text-xl font-bold">$1.10</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <p className="text-xl font-bold text-success">+13.6%</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
