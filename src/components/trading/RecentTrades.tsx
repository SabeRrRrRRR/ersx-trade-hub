const generateRecentTrades = () => {
  const trades = [];
  let price = 1.25;
  
  for (let i = 0; i < 20; i++) {
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const change = (Math.random() - 0.5) * 0.01;
    price = Math.max(1.2, Math.min(1.3, price + change));
    
    trades.push({
      id: i,
      price: price.toFixed(4),
      amount: (Math.random() * 10000 + 1000).toFixed(2),
      time: new Date(Date.now() - i * 30000).toLocaleTimeString(),
      side,
    });
  }
  
  return trades;
};

export const RecentTrades = () => {
  const trades = generateRecentTrades();

  return (
    <div className="glass-card p-4 h-full">
      <h3 className="font-semibold mb-4">Recent Trades</h3>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2 px-2">
        <span>Price (USD)</span>
        <span className="text-right">Amount (ERSX)</span>
        <span className="text-right">Time</span>
      </div>

      {/* Trades */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-3 gap-2 text-xs px-2 py-1 hover:bg-secondary/30 transition-colors"
          >
            <span className={`font-mono ${trade.side === 'buy' ? 'text-success' : 'text-destructive'}`}>
              {trade.price}
            </span>
            <span className="text-right font-mono">{trade.amount}</span>
            <span className="text-right text-muted-foreground">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
