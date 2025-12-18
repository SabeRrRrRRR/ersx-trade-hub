import { memo } from 'react';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: CandleData[];
  width: number;
  height: number;
}

export const CandlestickChart = memo(({ data, width, height }: CandlestickChartProps) => {
  if (data.length === 0) return null;

  const padding = { top: 20, right: 60, bottom: 30, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const prices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const pricePadding = priceRange * 0.05;

  const candleWidth = Math.max(3, (chartWidth / data.length) * 0.7);
  const gap = (chartWidth - candleWidth * data.length) / (data.length + 1);

  const scaleY = (price: number) => {
    return padding.top + chartHeight - ((price - (minPrice - pricePadding)) / (priceRange + 2 * pricePadding)) * chartHeight;
  };

  const scaleX = (index: number) => {
    return padding.left + gap + index * (candleWidth + gap) + candleWidth / 2;
  };

  // Grid lines
  const gridLines = 5;
  const priceStep = (maxPrice - minPrice + 2 * pricePadding) / gridLines;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="bullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(142 76% 55%)" />
          <stop offset="100%" stopColor="hsl(142 76% 35%)" />
        </linearGradient>
        <linearGradient id="bearGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(0 84% 70%)" />
          <stop offset="100%" stopColor="hsl(0 84% 50%)" />
        </linearGradient>
        <filter id="candleGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const price = minPrice - pricePadding + i * priceStep;
        const y = scaleY(price);
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="hsl(222 47% 20%)"
              strokeDasharray="2 4"
              opacity={0.5}
            />
            <text
              x={width - padding.right + 5}
              y={y + 4}
              fill="hsl(215 20% 55%)"
              fontSize={10}
              fontFamily="JetBrains Mono"
            >
              {price.toFixed(4)}
            </text>
          </g>
        );
      })}

      {/* Candles */}
      {data.map((candle, index) => {
        const x = scaleX(index);
        const isBullish = candle.close >= candle.open;
        const bodyTop = scaleY(Math.max(candle.open, candle.close));
        const bodyBottom = scaleY(Math.min(candle.open, candle.close));
        const bodyHeight = Math.max(1, bodyBottom - bodyTop);

        return (
          <g key={index} filter="url(#candleGlow)">
            {/* Wick */}
            <line
              x1={x}
              y1={scaleY(candle.high)}
              x2={x}
              y2={scaleY(candle.low)}
              stroke={isBullish ? 'hsl(142 76% 45%)' : 'hsl(0 84% 60%)'}
              strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={x - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={isBullish ? 'url(#bullGradient)' : 'url(#bearGradient)'}
              rx={1}
            />
          </g>
        );
      })}

      {/* X-axis labels */}
      {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((candle, i, arr) => {
        const originalIndex = data.indexOf(candle);
        return (
          <text
            key={i}
            x={scaleX(originalIndex)}
            y={height - 10}
            fill="hsl(215 20% 55%)"
            fontSize={10}
            textAnchor="middle"
            fontFamily="JetBrains Mono"
          >
            {candle.time.slice(5)}
          </text>
        );
      })}
    </svg>
  );
});

CandlestickChart.displayName = 'CandlestickChart';
