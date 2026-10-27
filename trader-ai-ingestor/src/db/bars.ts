import type { PoolClient } from "pg";
import type { OhlcvBar } from "../types";

export async function upsertBars(client: PoolClient, bars: OhlcvBar[]): Promise<number> {
  if (bars.length === 0) return 0;

  const text = `
    INSERT INTO market_bars (symbol, timeframe, ts, open, high, low, close, volume, source)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (symbol, timeframe, ts, source) DO UPDATE SET
      open = EXCLUDED.open,
      high = EXCLUDED.high,
      low = EXCLUDED.low,
      close = EXCLUDED.close,
      volume = EXCLUDED.volume,
      ingested_at = NOW()
  `;

  let written = 0;
  for (const bar of bars) {
    await client.query(text, [
      bar.symbol,
      bar.timeframe,
      bar.ts,
      bar.open,
      bar.high,
      bar.low,
      bar.close,
      bar.volume,
      bar.source,
    ]);
    written += 1;
  }
  return written;
}
