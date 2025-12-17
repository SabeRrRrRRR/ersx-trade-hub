import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'user';

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error || !data) return null;
  return data.role as UserRole;
};

export const isAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRole(userId);
  return role === 'admin';
};

export const formatCurrency = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateMockChartData = (days: number = 30) => {
  const data = [];
  let price = 1.25;
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.48) * 0.1;
    price = Math.max(0.5, price + change);
    
    data.push({
      time: new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: parseFloat(price.toFixed(4)),
      volume: Math.floor(Math.random() * 1000000) + 500000,
      open: parseFloat((price - Math.random() * 0.05).toFixed(4)),
      high: parseFloat((price + Math.random() * 0.05).toFixed(4)),
      low: parseFloat((price - Math.random() * 0.05).toFixed(4)),
      close: parseFloat(price.toFixed(4)),
    });
  }
  
  return data;
};

export const generateOrderBookData = () => {
  const bids = [];
  const asks = [];
  let bidPrice = 1.245;
  let askPrice = 1.255;
  
  for (let i = 0; i < 10; i++) {
    bids.push({
      price: parseFloat(bidPrice.toFixed(4)),
      amount: Math.floor(Math.random() * 50000) + 10000,
      total: 0,
    });
    asks.push({
      price: parseFloat(askPrice.toFixed(4)),
      amount: Math.floor(Math.random() * 50000) + 10000,
      total: 0,
    });
    bidPrice -= 0.001 + Math.random() * 0.002;
    askPrice += 0.001 + Math.random() * 0.002;
  }
  
  // Calculate totals
  let bidTotal = 0;
  let askTotal = 0;
  bids.forEach(bid => {
    bidTotal += bid.amount;
    bid.total = bidTotal;
  });
  asks.forEach(ask => {
    askTotal += ask.amount;
    ask.total = askTotal;
  });
  
  return { bids, asks };
};
