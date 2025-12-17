import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { generateMockChartData } from '@/lib/supabase-helpers';

type ChartType = 'line' | 'area' | 'baseline' | 'step';
type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

interface TradingChartProps {
  className?: string;
}

const timeFrames: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
const chartTypes: { type: ChartType; label: string }[] = [
  { type: 'line', label: 'Line' },
  { type: 'area', label: 'Area' },
  { type: 'baseline', label: 'Baseline' },
  { type: 'step', label: 'Step' },
];

export const TradingChart = ({ className }: TradingChartProps) => {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1d');
  const [showMA, setShowMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  
  const data = generateMockChartData(30);
  const currentPrice = data[data.length - 1]?.price || 0;
  const previousPrice = data[data.length - 2]?.price || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  // Calculate moving average
  const dataWithMA = data.map((item, index) => {
    if (index < 6) return { ...item, ma7: null };
    const sum = data.slice(index - 6, index + 1).reduce((acc, d) => acc + d.price, 0);
    return { ...item, ma7: parseFloat((sum / 7).toFixed(4)) };
  });

  const baselineValue = data.length > 0 ? data[0].price : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-border/50">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">
            ${payload[0].value.toFixed(4)}
          </p>
          {payload[1] && (
            <p className="text-sm text-primary">
              MA(7): ${payload[1].value?.toFixed(4) || 'N/A'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: dataWithMA,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" opacity={0.3} />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--chart-line))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--chart-line))' }}
            />
            {showMA && (
              <Line
                type="monotone"
                dataKey="ma7"
                stroke="hsl(var(--warning))"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-line))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-line))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" opacity={0.3} />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--chart-line))"
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
            {showMA && (
              <Line
                type="monotone"
                dataKey="ma7"
                stroke="hsl(var(--warning))"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </AreaChart>
        );

      case 'baseline':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-positive))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-positive))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNegative" x1="0" y1="1" x2="0" y2="0">
                <stop offset="5%" stopColor="hsl(var(--chart-negative))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-negative))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" opacity={0.3} />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={baselineValue} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--chart-line))"
              strokeWidth={2}
              fill="url(#colorPositive)"
              baseValue={baselineValue}
            />
          </AreaChart>
        );

      case 'step':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" opacity={0.3} />
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="stepAfter"
              dataKey="price"
              stroke="hsl(var(--chart-line))"
              strokeWidth={2}
              dot={false}
            />
            {showMA && (
              <Line
                type="monotone"
                dataKey="ma7"
                stroke="hsl(var(--warning))"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`glass-card p-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">ERSX/USD</h2>
            <span className={`text-sm px-2 py-1 rounded ${isPositive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
              {isPositive ? '+' : ''}{priceChangePercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold font-mono">${currentPrice.toFixed(4)}</span>
            <span className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{priceChange.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Chart Type */}
          <div className="flex bg-secondary/50 rounded-lg p-1">
            {chartTypes.map(({ type, label }) => (
              <Button
                key={type}
                variant={chartType === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType(type)}
                className="h-7 px-3 text-xs"
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Indicators */}
          <div className="flex gap-1">
            <Button
              variant={showMA ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMA(!showMA)}
              className="h-7 px-3 text-xs"
            >
              MA(7)
            </Button>
            <Button
              variant={showVolume ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowVolume(!showVolume)}
              className="h-7 px-3 text-xs"
            >
              Vol
            </Button>
          </div>
        </div>
      </div>

      {/* Time Frame Selector */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {timeFrames.map((tf) => (
          <Button
            key={tf}
            variant={timeFrame === tf ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeFrame(tf)}
            className="h-7 px-3 text-xs"
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      {showVolume && (
        <div className="h-[100px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card p-2 text-xs">
                        <p>Vol: {payload[0].value?.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                fill="url(#colorVolume)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
