export type Timeframe = "1m" | "5m" | "15m" | "1h" | "H1" | "D1" | "1d";

export interface OhlcvBar {
  symbol: string;
  timeframe: string;
  ts: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  source: string;
}

export interface NewsHeadline {
  headline: string;
  url?: string;
  source: string;
  category?: string;
  publishedAt?: string;
  symbols?: string[];
  raw?: Record<string, unknown>;
}

export type PushPayload =
  | { kind: "bars"; source: string; bars: OhlcvBar[] }
  | { kind: "headlines"; source: string; headlines: NewsHeadline[] };
