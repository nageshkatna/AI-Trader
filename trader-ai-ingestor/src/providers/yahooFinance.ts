import type { OhlcvBar } from "../types";

interface ChartQuote {
  date?: Date;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
}

/**
 * Yahoo Finance via yahoo-finance2 (TypeScript-native stand-in for Python yfinance).
 */
export async function fetchYahooDaily(
  symbols: string[],
  lookbackDays: number
): Promise<OhlcvBar[]> {
  const yf = (await import("yahoo-finance2")).default;
  yf.suppressNotices(["yahooSurvey"]);

  const period1 = new Date();
  period1.setUTCDate(period1.getUTCDate() - lookbackDays);

  const bars: OhlcvBar[] = [];

  for (const symbol of symbols) {
    const chart = await yf.chart(symbol, {
      period1,
      interval: "1d",
    });

    const quotes: ChartQuote[] = chart.quotes ?? [];
    for (const q of quotes) {
      if (!q.date || q.open == null || q.close == null) continue;
      bars.push({
        symbol,
        timeframe: "1d",
        ts: new Date(q.date).toISOString(),
        open: q.open,
        high: q.high ?? q.open,
        low: q.low ?? q.open,
        close: q.close,
        volume: q.volume ?? 0,
        source: "yahoo",
      });
    }
  }

  return bars;
}
