import { memo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

interface IndicatorPaneProps {
  type: 'RSI' | 'MACD' | 'STOCH' | 'ATR' | 'VOL';
  data: any[];
  height?: number;
}

export const IndicatorPane = memo(({ type, data, height = 100 }: IndicatorPaneProps) => {
  const renderIndicator = () => {
    switch (type) {
      case 'RSI':
        return (
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <ReferenceLine y={70} stroke="hsl(0 84% 60%)" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={30} stroke="hsl(142 76% 45%)" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={50} stroke="hsl(215 20% 55%)" strokeDasharray="3 3" opacity={0.3} />
            <Line
              type="monotone"
              dataKey="rsi"
              stroke="hsl(280 70% 60%)"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        );

      case 'MACD':
        return (
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <ReferenceLine y={0} stroke="hsl(215 20% 55%)" strokeDasharray="3 3" opacity={0.3} />
            <Bar dataKey="histogram" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.histogram >= 0 ? 'hsl(142 76% 45%)' : 'hsl(0 84% 60%)'}
                  fillOpacity={0.6}
                />
              ))}
            </Bar>
            <Line type="monotone" dataKey="macd" stroke="hsl(200 90% 60%)" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="macdSignal" stroke="hsl(38 92% 50%)" strokeWidth={1.5} dot={false} />
          </BarChart>
        );

      case 'STOCH':
        return (
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <ReferenceLine y={80} stroke="hsl(0 84% 60%)" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={20} stroke="hsl(142 76% 45%)" strokeDasharray="3 3" opacity={0.5} />
            <Line
              type="monotone"
              dataKey="stochK"
              stroke="hsl(200 90% 60%)"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="stochD"
              stroke="hsl(38 92% 50%)"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        );

      case 'ATR':
        return (
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="atrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(280 70% 60%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(280 70% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Area
              type="monotone"
              dataKey="atr"
              stroke="hsl(280 70% 60%)"
              strokeWidth={1.5}
              fill="url(#atrGradient)"
            />
          </AreaChart>
        );

      case 'VOL':
        return (
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.close >= entry.open ? 'hsl(142 76% 45%)' : 'hsl(0 84% 60%)'}
                  fillOpacity={0.5}
                />
              ))}
            </Bar>
          </BarChart>
        );

      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'RSI': return 'RSI(14)';
      case 'MACD': return 'MACD(12,26,9)';
      case 'STOCH': return 'STOCH(14,3)';
      case 'ATR': return 'ATR(14)';
      case 'VOL': return 'Volume';
      default: return type;
    }
  };

  return (
    <div className="relative border-t border-border/30">
      <div className="absolute top-1 left-2 z-10">
        <span className="text-[10px] font-mono text-muted-foreground bg-background/80 px-1 rounded">
          {getLabel()}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {renderIndicator()}
      </ResponsiveContainer>
    </div>
  );
});

IndicatorPane.displayName = 'IndicatorPane';
