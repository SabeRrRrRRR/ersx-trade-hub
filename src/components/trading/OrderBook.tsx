import { generateOrderBookData } from '@/lib/supabase-helpers';

export const OrderBook = () => {
  const { bids, asks } = generateOrderBookData();
  const maxTotal = Math.max(
    bids[bids.length - 1]?.total || 0,
    asks[asks.length - 1]?.total || 0
  );

  return (
    <div className="glass-card p-4 h-full">
      <h3 className="font-semibold mb-4">Order Book</h3>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2 px-2">
        <span>Price (USD)</span>
        <span className="text-right">Amount (ERSX)</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sell orders) */}
      <div className="space-y-1 mb-4">
        {asks.slice().reverse().map((ask, i) => (
          <div key={`ask-${i}`} className="relative">
            <div
              className="absolute right-0 top-0 bottom-0 bg-destructive/10"
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <div className="grid grid-cols-3 gap-2 text-xs px-2 py-1 relative z-10">
              <span className="text-destructive font-mono">{ask.price.toFixed(4)}</span>
              <span className="text-right font-mono">{ask.amount.toLocaleString()}</span>
              <span className="text-right font-mono text-muted-foreground">
                {ask.total.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="flex items-center justify-center py-2 border-y border-border/50 my-2">
        <span className="text-lg font-bold text-primary font-mono">$1.2500</span>
        <span className="text-xs text-muted-foreground ml-2">Spread: 0.80%</span>
      </div>

      {/* Bids (Buy orders) */}
      <div className="space-y-1">
        {bids.map((bid, i) => (
          <div key={`bid-${i}`} className="relative">
            <div
              className="absolute left-0 top-0 bottom-0 bg-success/10"
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <div className="grid grid-cols-3 gap-2 text-xs px-2 py-1 relative z-10">
              <span className="text-success font-mono">{bid.price.toFixed(4)}</span>
              <span className="text-right font-mono">{bid.amount.toLocaleString()}</span>
              <span className="text-right font-mono text-muted-foreground">
                {bid.total.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
