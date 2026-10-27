import type { PoolClient } from "pg";
import type { NewsHeadline } from "../types";

export async function upsertHeadlines(
  client: PoolClient,
  headlines: NewsHeadline[]
): Promise<number> {
  if (headlines.length === 0) return 0;

  const text = `
    INSERT INTO news_headlines (headline, url, source, category, published_at, symbols, raw)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (source, headline, published_at) DO UPDATE SET
      url = EXCLUDED.url,
      category = EXCLUDED.category,
      symbols = EXCLUDED.symbols,
      raw = EXCLUDED.raw,
      ingested_at = NOW()
  `;

  let written = 0;
  for (const h of headlines) {
    await client.query(text, [
      h.headline,
      h.url ?? null,
      h.source,
      h.category ?? null,
      h.publishedAt ?? null,
      h.symbols ?? [],
      h.raw ? JSON.stringify(h.raw) : null,
    ]);
    written += 1;
  }
  return written;
}
