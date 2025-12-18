import { memo } from 'react';

interface BarData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface OHLCBarChartProps {
  data: BarData[];
  width: number;
  height: number;
}

export const OHLCBarChart = memo(({ data, width, height }: OHLCBarChartProps) => {
  if (data.length === 0) return null;

  const padding = { top: 20, right: 60, bottom: 30, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const prices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  const pricePadding = priceRange * 0.05;

  const barGap = chartWidth / data.length;
  const tickWidth = Math.min(6, barGap * 0.3);

  const scaleY = (price: number) => {
    return padding.top + chartHeight - ((price - (minPrice - pricePadding)) / (priceRange + 2 * pricePadding)) * chartHeight;
  };

  const scaleX = (index: number) => {
    return padding.left + barGap * (index + 0.5);
  };

  // Grid lines
  const gridLines = 5;
  const priceStep = (maxPrice - minPrice + 2 * pricePadding) / gridLines;

  return (
    <svg width={width} height={height} className="overflow-visible">
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

      {/* OHLC Bars */}
      {data.map((bar, index) => {
        const x = scaleX(index);
        const isBullish = bar.close >= bar.open;
        const color = isBullish ? 'hsl(142 76% 45%)' : 'hsl(0 84% 60%)';

        return (
          <g key={index}>
            {/* Vertical line (High-Low) */}
            <line
              x1={x}
              y1={scaleY(bar.high)}
              x2={x}
              y2={scaleY(bar.low)}
              stroke={color}
              strokeWidth={1.5}
            />
            {/* Open tick (left) */}
            <line
              x1={x - tickWidth}
              y1={scaleY(bar.open)}
              x2={x}
              y2={scaleY(bar.open)}
              stroke={color}
              strokeWidth={1.5}
            />
            {/* Close tick (right) */}
            <line
              x1={x}
              y1={scaleY(bar.close)}
              x2={x + tickWidth}
              y2={scaleY(bar.close)}
              stroke={color}
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      {/* X-axis labels */}
      {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((bar, i) => {
        const originalIndex = data.indexOf(bar);
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
            {bar.time.slice(5)}
          </text>
        );
      })}
    </svg>
  );
});

OHLCBarChart.displayName = 'OHLCBarChart';
