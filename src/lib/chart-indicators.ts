// Technical indicators calculation utilities

export interface OHLCData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Simple Moving Average
export const calculateSMA = (data: number[], period: number): (number | null)[] => {
  return data.map((_, index) => {
    if (index < period - 1) return null;
    const sum = data.slice(index - period + 1, index + 1).reduce((a, b) => a + b, 0);
    return parseFloat((sum / period).toFixed(4));
  });
};

// Exponential Moving Average
export const calculateEMA = (data: number[], period: number): (number | null)[] => {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
      result.push(parseFloat((sum / period).toFixed(4)));
    } else {
      const prevEMA = result[i - 1] as number;
      const ema = (data[i] - prevEMA) * multiplier + prevEMA;
      result.push(parseFloat(ema.toFixed(4)));
    }
  }
  return result;
};

// Bollinger Bands
export const calculateBB = (data: number[], period: number = 20, stdDev: number = 2): { upper: (number | null)[], middle: (number | null)[], lower: (number | null)[] } => {
  const middle = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = middle[i] as number;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / period;
      const std = Math.sqrt(variance);
      upper.push(parseFloat((avg + stdDev * std).toFixed(4)));
      lower.push(parseFloat((avg - stdDev * std).toFixed(4)));
    }
  }

  return { upper, middle, lower };
};

// Parabolic SAR
export const calculateSAR = (data: OHLCData[], af: number = 0.02, maxAf: number = 0.2): (number | null)[] => {
  const result: (number | null)[] = [];
  if (data.length < 2) return result;

  let isUpTrend = data[1].close > data[0].close;
  let sar = isUpTrend ? data[0].low : data[0].high;
  let ep = isUpTrend ? data[0].high : data[0].low;
  let currentAf = af;

  result.push(null);

  for (let i = 1; i < data.length; i++) {
    const prevSar = sar;
    sar = prevSar + currentAf * (ep - prevSar);

    if (isUpTrend) {
      sar = Math.min(sar, data[i - 1].low, i > 1 ? data[i - 2].low : data[i - 1].low);
      if (data[i].low < sar) {
        isUpTrend = false;
        sar = ep;
        ep = data[i].low;
        currentAf = af;
      } else {
        if (data[i].high > ep) {
          ep = data[i].high;
          currentAf = Math.min(currentAf + af, maxAf);
        }
      }
    } else {
      sar = Math.max(sar, data[i - 1].high, i > 1 ? data[i - 2].high : data[i - 1].high);
      if (data[i].high > sar) {
        isUpTrend = true;
        sar = ep;
        ep = data[i].high;
        currentAf = af;
      } else {
        if (data[i].low < ep) {
          ep = data[i].low;
          currentAf = Math.min(currentAf + af, maxAf);
        }
      }
    }
    result.push(parseFloat(sar.toFixed(4)));
  }

  return result;
};

// RSI (Relative Strength Index)
export const calculateRSI = (data: number[], period: number = 14): (number | null)[] => {
  const result: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(null);
      continue;
    }

    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);

    if (i < period) {
      result.push(null);
    } else {
      const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        result.push(parseFloat(rsi.toFixed(2)));
      }
    }
  }

  return result;
};

// MACD
export const calculateMACD = (data: number[], fast: number = 12, slow: number = 26, signal: number = 9): { macd: (number | null)[], signal: (number | null)[], histogram: (number | null)[] } => {
  const fastEMA = calculateEMA(data, fast);
  const slowEMA = calculateEMA(data, slow);
  
  const macdLine: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(parseFloat(((fastEMA[i] as number) - (slowEMA[i] as number)).toFixed(4)));
    }
  }

  const validMacd = macdLine.filter(v => v !== null) as number[];
  const signalEMA = calculateEMA(validMacd, signal);
  
  const signalLine: (number | null)[] = [];
  const histogram: (number | null)[] = [];
  let signalIndex = 0;

  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null) {
      signalLine.push(null);
      histogram.push(null);
    } else {
      const sig = signalEMA[signalIndex] || null;
      signalLine.push(sig);
      histogram.push(macdLine[i] !== null && sig !== null ? parseFloat(((macdLine[i] as number) - (sig as number)).toFixed(4)) : null);
      signalIndex++;
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
};

// Stochastic Oscillator
export const calculateStoch = (data: OHLCData[], kPeriod: number = 14, dPeriod: number = 3): { k: (number | null)[], d: (number | null)[] } => {
  const k: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < kPeriod - 1) {
      k.push(null);
    } else {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...slice.map(d => d.high));
      const lowestLow = Math.min(...slice.map(d => d.low));
      const currentClose = data[i].close;
      
      if (highestHigh === lowestLow) {
        k.push(50);
      } else {
        const stochK = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
        k.push(parseFloat(stochK.toFixed(2)));
      }
    }
  }

  const validK = k.filter(v => v !== null) as number[];
  const dSMA = calculateSMA(validK, dPeriod);
  
  const d: (number | null)[] = [];
  let dIndex = 0;
  for (let i = 0; i < k.length; i++) {
    if (k[i] === null) {
      d.push(null);
    } else {
      d.push(dSMA[dIndex] || null);
      dIndex++;
    }
  }

  return { k, d };
};

// ATR (Average True Range)
export const calculateATR = (data: OHLCData[], period: number = 14): (number | null)[] => {
  const trueRanges: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      trueRanges.push(data[i].high - data[i].low);
    } else {
      const tr = Math.max(
        data[i].high - data[i].low,
        Math.abs(data[i].high - data[i - 1].close),
        Math.abs(data[i].low - data[i - 1].close)
      );
      trueRanges.push(tr);
    }
  }

  const result: (number | null)[] = [];
  for (let i = 0; i < trueRanges.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      const sum = trueRanges.slice(0, period).reduce((a, b) => a + b, 0);
      result.push(parseFloat((sum / period).toFixed(4)));
    } else {
      const prevATR = result[i - 1] as number;
      const atr = ((prevATR * (period - 1)) + trueRanges[i]) / period;
      result.push(parseFloat(atr.toFixed(4)));
    }
  }

  return result;
};
