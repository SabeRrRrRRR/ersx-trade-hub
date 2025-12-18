import { useState, useMemo, useRef, useEffect } from 'react';
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
import { 
  calculateSMA, 
  calculateEMA, 
  calculateBB, 
  calculateSAR, 
  calculateRSI, 
  calculateMACD, 
  calculateStoch, 
  calculateATR,
  OHLCData 
} from '@/lib/chart-indicators';
import { CandlestickChart } from './CandlestickChart';
import { OHLCBarChart } from './BarChart';
import { IndicatorPane } from './IndicatorPane';
import { TrendingUp, TrendingDown, Activity, BarChart3, CandlestickChartIcon, LineChartIcon, AreaChartIcon } from 'lucide-react';

type ChartType = 'line' | 'area' | 'candlestick' | 'bar';
type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
type OverlayIndicator = 'MA' | 'EMA' | 'BB' | 'SAR';
type PaneIndicator = 'RSI' | 'MACD' | 'STOCH' | 'ATR' | 'VOL';

interface TradingChartProps {
  className?: string;
}

const timeFrames: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

const chartTypeConfig: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: 'candlestick', label: 'Candle', icon: <CandlestickChartIcon className="w-3.5 h-3.5" /> },
  { type: 'bar', label: 'Bar', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { type: 'line', label: 'Line', icon: <LineChartIcon className="w-3.5 h-3.5" /> },
  { type: 'area', label: 'Area', icon: <AreaChartIcon className="w-3.5 h-3.5" /> },
];

const overlayIndicators: { id: OverlayIndicator; label: string; color: string }[] = [
  { id: 'MA', label: 'MA(20)', color: 'hsl(38 92% 50%)' },
  { id: 'EMA', label: 'EMA(20)', color: 'hsl(280 70% 60%)' },
  { id: 'BB', label: 'BB(20,2)', color: 'hsl(200 90% 60%)' },
  { id: 'SAR', label: 'SAR', color: 'hsl(340 82% 60%)' },
];

const paneIndicators: { id: PaneIndicator; label: string }[] = [
  { id: 'RSI', label: 'RSI' },
  { id: 'MACD', label: 'MACD' },
  { id: 'STOCH', label: 'STOCH' },
  { id: 'ATR', label: 'ATR' },
  { id: 'VOL', label: 'VOL' },
];

export const TradingChart = ({ className }: TradingChartProps) => {
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1d');
  const [activeOverlays, setActiveOverlays] = useState<Set<OverlayIndicator>>(new Set(['MA']));
  const [activePanes, setActivePanes] = useState<Set<PaneIndicator>>(new Set(['VOL']));
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        setChartDimensions({
          width: chartContainerRef.current.offsetWidth,
          height: 400,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const rawData = useMemo(() => generateMockChartData(50), []);
  
  const currentPrice = rawData[rawData.length - 1]?.close || 0;
  const previousPrice = rawData[rawData.length - 2]?.close || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  const dataWithIndicators = useMemo(() => {
    const closes = rawData.map(d => d.close);
    const ma20 = calculateSMA(closes, 20);
    const ema20 = calculateEMA(closes, 20);
    const bb = calculateBB(closes, 20, 2);
    const sar = calculateSAR(rawData as OHLCData[]);
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);
    const stoch = calculateStoch(rawData as OHLCData[], 14, 3);
    const atr = calculateATR(rawData as OHLCData[], 14);

    return rawData.map((item, index) => ({
      ...item,
      ma20: ma20[index],
      ema20: ema20[index],
      bbUpper: bb.upper[index],
      bbMiddle: bb.middle[index],
      bbLower: bb.lower[index],
      sar: sar[index],
      rsi: rsi[index],
      macd: macd.macd[index],
      macdSignal: macd.signal[index],
      histogram: macd.histogram[index],
      stochK: stoch.k[index],
      stochD: stoch.d[index],
      atr: atr[index],
    }));
  }, [rawData]);

  const toggleOverlay = (indicator: OverlayIndicator) => {
    setActiveOverlays(prev => {
      const next = new Set(prev);
      if (next.has(indicator)) {
        next.delete(indicator);
      } else {
        next.add(indicator);
      }
      return next;
    });
  };

  const togglePane = (indicator: PaneIndicator) => {
    setActivePanes(prev => {
      const next = new Set(prev);
      if (next.has(indicator)) {
        next.delete(indicator);
      } else {
        next.add(indicator);
      }
      return next;
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="glass-card p-3 border border-primary/30 shadow-lg shadow-primary/10">
          <p className="text-xs text-muted-foreground mb-2 font-mono">{label}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">O:</span>
            <span className="font-mono text-foreground">{data?.open?.toFixed(4)}</span>
            <span className="text-muted-foreground">H:</span>
            <span className="font-mono text-success">{data?.high?.toFixed(4)}</span>
            <span className="text-muted-foreground">L:</span>
            <span className="font-mono text-destructive">{data?.low?.toFixed(4)}</span>
            <span className="text-muted-foreground">C:</span>
            <span className="font-mono text-foreground">{data?.close?.toFixed(4)}</span>
            <span className="text-muted-foreground">Vol:</span>
            <span className="font-mono text-primary">{data?.volume?.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderOverlayIndicators = () => (
    <>
      {activeOverlays.has('MA') && (
        <Line type="monotone" dataKey="ma20" stroke="hsl(38 92% 50%)" strokeWidth={1.5} dot={false} />
      )}
      {activeOverlays.has('EMA') && (
        <Line type="monotone" dataKey="ema20" stroke="hsl(280 70% 60%)" strokeWidth={1.5} dot={false} />
      )}
      {activeOverlays.has('BB') && (
        <>
          <Line type="monotone" dataKey="bbUpper" stroke="hsl(200 90% 60%)" strokeWidth={1} strokeDasharray="4 2" dot={false} />
          <Line type="monotone" dataKey="bbMiddle" stroke="hsl(200 90% 60%)" strokeWidth={1} dot={false} />
          <Line type="monotone" dataKey="bbLower" stroke="hsl(200 90% 60%)" strokeWidth={1} strokeDasharray="4 2" dot={false} />
        </>
      )}
      {activeOverlays.has('SAR') && (
        <Line type="monotone" dataKey="sar" stroke="hsl(340 82% 60%)" strokeWidth={0} dot={{ r: 2, fill: 'hsl(340 82% 60%)' }} />
      )}
    </>
  );

  const renderLineAreaChart = () => {
    const commonProps = {
      data: dataWithIndicators,
      margin: { top: 10, right: 60, left: 0, bottom: 0 },
    };

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 15%)" opacity={0.5} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(215 20% 45%)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => value.slice(5)}
            />
            <YAxis 
              stroke="hsl(215 20% 45%)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(2)}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="close"
              stroke="hsl(174 72% 50%)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(174 72% 50%)', stroke: 'hsl(174 72% 70%)', strokeWidth: 2 }}
            />
            {renderOverlayIndicators()}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(174 72% 50%)" stopOpacity={0.4} />
              <stop offset="50%" stopColor="hsl(174 72% 50%)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="hsl(174 72% 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 15%)" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(215 20% 45%)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => value.slice(5)}
          />
          <YAxis 
            stroke="hsl(215 20% 45%)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            domain={['auto', 'auto']}
            tickFormatter={(value) => value.toFixed(2)}
            orientation="right"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke="hsl(174 72% 50%)"
            strokeWidth={2}
            fill="url(#areaGradient)"
          />
          {renderOverlayIndicators()}
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderMainChart = () => {
    if (chartType === 'candlestick') {
      return (
        <div ref={chartContainerRef} className="h-[400px] relative">
          <CandlestickChart 
            data={dataWithIndicators} 
            width={chartDimensions.width} 
            height={chartDimensions.height} 
          />
          {/* Overlay indicators for candlestick */}
          {(activeOverlays.size > 0) && (
            <div className="absolute inset-0 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataWithIndicators} margin={{ top: 20, right: 60, left: 10, bottom: 30 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  {renderOverlayIndicators()}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <div ref={chartContainerRef} className="h-[400px] relative">
          <OHLCBarChart 
            data={dataWithIndicators} 
            width={chartDimensions.width} 
            height={chartDimensions.height} 
          />
          {(activeOverlays.size > 0) && (
            <div className="absolute inset-0 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataWithIndicators} margin={{ top: 20, right: 60, left: 10, bottom: 30 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  {renderOverlayIndicators()}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      );
    }

    return <div ref={chartContainerRef}>{renderLineAreaChart()}</div>;
  };

  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight">ERSX/USD</h2>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isPositive 
                    ? 'bg-success/20 text-success border border-success/30' 
                    : 'bg-destructive/20 text-destructive border border-destructive/30'
                }`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{priceChangePercent}%
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono">${currentPrice.toFixed(4)}</span>
                <span className={`text-sm font-mono ${isPositive ? 'text-success' : 'text-destructive'}`}>
                  {isPositive ? '+' : ''}{priceChange.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Chart Type Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-secondary/30 rounded-lg p-0.5 border border-border/30">
              {chartTypeConfig.map(({ type, label, icon }) => (
                <Button
                  key={type}
                  variant={chartType === type ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType(type)}
                  className={`h-7 px-2.5 text-xs gap-1.5 ${
                    chartType === type ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'hover:bg-secondary/50'
                  }`}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {/* Overlay Indicators */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Overlays:</span>
            {overlayIndicators.map(({ id, label, color }) => (
              <Button
                key={id}
                variant={activeOverlays.has(id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleOverlay(id)}
                className={`h-6 px-2 text-[10px] ${
                  activeOverlays.has(id) 
                    ? 'shadow-sm' 
                    : 'border-border/50 hover:border-primary/50'
                }`}
                style={activeOverlays.has(id) ? { backgroundColor: color, borderColor: color } : {}}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Pane Indicators */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Panes:</span>
            {paneIndicators.map(({ id, label }) => (
              <Button
                key={id}
                variant={activePanes.has(id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePane(id)}
                className={`h-6 px-2 text-[10px] ${
                  activePanes.has(id) 
                    ? 'bg-secondary text-foreground' 
                    : 'border-border/50 hover:border-primary/50'
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Frame Selector */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1">
          {timeFrames.map((tf) => (
            <Button
              key={tf}
              variant={timeFrame === tf ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeFrame(tf)}
              className={`h-6 px-3 text-xs font-mono ${
                timeFrame === tf 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gradient-to-b from-background/50 to-background">
        {renderMainChart()}
      </div>

      {/* Indicator Panes */}
      <div className="border-t border-border/30">
        {activePanes.has('VOL') && (
          <IndicatorPane type="VOL" data={dataWithIndicators} height={80} />
        )}
        {activePanes.has('RSI') && (
          <IndicatorPane type="RSI" data={dataWithIndicators} height={80} />
        )}
        {activePanes.has('MACD') && (
          <IndicatorPane type="MACD" data={dataWithIndicators} height={100} />
        )}
        {activePanes.has('STOCH') && (
          <IndicatorPane type="STOCH" data={dataWithIndicators} height={80} />
        )}
        {activePanes.has('ATR') && (
          <IndicatorPane type="ATR" data={dataWithIndicators} height={60} />
        )}
      </div>
    </div>
  );
};
