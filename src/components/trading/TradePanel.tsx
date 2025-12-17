import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface TradePanelProps {
  balance?: number;
}

export const TradePanel = ({ balance = 100 }: TradePanelProps) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('1.2500');
  const [percentage, setPercentage] = useState([0]);
  const { toast } = useToast();

  const currentPrice = 1.25;
  const total = parseFloat(amount || '0') * (orderType === 'limit' ? parseFloat(price) : currentPrice);

  const handlePercentageChange = (value: number[]) => {
    setPercentage(value);
    const calculatedAmount = (balance * value[0] / 100).toFixed(4);
    setAmount(calculatedAmount);
  };

  const handleTrade = (side: 'buy' | 'sell') => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: `${side === 'buy' ? 'Buy' : 'Sell'} Order Placed`,
      description: `${side === 'buy' ? 'Bought' : 'Sold'} ${amount} ERSX at $${orderType === 'limit' ? price : currentPrice.toFixed(4)}`,
    });

    setAmount('');
    setPercentage([0]);
  };

  return (
    <div className="glass-card p-4 h-full">
      <Tabs defaultValue="buy" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="buy" className="data-[state=active]:bg-success data-[state=active]:text-success-foreground">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
            Sell
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="flex-1 flex flex-col">
          {/* Order Type */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={orderType === 'market' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderType('market')}
              className="flex-1"
            >
              Market
            </Button>
            <Button
              variant={orderType === 'limit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderType('limit')}
              className="flex-1"
            >
              Limit
            </Button>
          </div>

          {/* Price Input (Limit only) */}
          {orderType === 'limit' && (
            <div className="mb-4">
              <Label className="text-xs text-muted-foreground mb-1">Price (USD)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="font-mono"
              />
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground mb-1">Amount (ERSX)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="font-mono"
            />
          </div>

          {/* Percentage Slider */}
          <div className="mb-4">
            <Slider
              value={percentage}
              onValueChange={handlePercentageChange}
              max={100}
              step={25}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Total */}
          <div className="glass-panel p-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-semibold">${total.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">Available</span>
              <span className="font-mono">{balance.toFixed(4)} ERSX</span>
            </div>
          </div>

          <Button
            variant="success"
            className="w-full mt-auto"
            onClick={() => handleTrade('buy')}
          >
            Buy ERSX
          </Button>
        </TabsContent>

        <TabsContent value="sell" className="flex-1 flex flex-col">
          {/* Order Type */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={orderType === 'market' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderType('market')}
              className="flex-1"
            >
              Market
            </Button>
            <Button
              variant={orderType === 'limit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderType('limit')}
              className="flex-1"
            >
              Limit
            </Button>
          </div>

          {/* Price Input (Limit only) */}
          {orderType === 'limit' && (
            <div className="mb-4">
              <Label className="text-xs text-muted-foreground mb-1">Price (USD)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="font-mono"
              />
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground mb-1">Amount (ERSX)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="font-mono"
            />
          </div>

          {/* Percentage Slider */}
          <div className="mb-4">
            <Slider
              value={percentage}
              onValueChange={handlePercentageChange}
              max={100}
              step={25}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Total */}
          <div className="glass-panel p-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-semibold">${total.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">Available</span>
              <span className="font-mono">{balance.toFixed(4)} ERSX</span>
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full mt-auto"
            onClick={() => handleTrade('sell')}
          >
            Sell ERSX
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};
