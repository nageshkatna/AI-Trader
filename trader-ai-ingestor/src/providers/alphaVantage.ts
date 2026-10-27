import type { OhlcvBar } from "../types";

/**
 * Alpha Vantage TIME_SERIES_DAILY as an alternative to Yahoo.
 * Free tier is rate-limited — keep SYMBOLS small.
 */
export async function fetchAlphaVantageDaily(
  symbols: string[],
  apiKey: string
): Promise<OhlcvBar[]> {
  if (!apiKey) {
    throw new Error("ALPHA_VANTAGE_API_KEY is required when PRICE_PROVIDER=alphavantage");
  }

  const bars: OhlcvBar[] = [];

  for (const symbol of symbols) {
    const url = new URL("https://www.alphavantage.co/query");
    url.searchParams.set("function", "TIME_SERIES_DAILY");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("outputsize", "compact");
    url.searchParams.set("apikey", apiKey);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Alpha Vantage HTTP ${res.status} for ${symbol}`);
    }

    const json = (await res.json()) as {
      "Time Series (Daily)"?: Record<
        string,
        {
          "1. open": string;
          "2. high": string;
          "3. low": string;
          "4. close": string;
          "5. volume": string;
        }
      >;
      Note?: string;
      Information?: string;
    };

    if (json.Note || json.Information) {
      throw new Error(json.Note ?? json.Information ?? "Alpha Vantage limit");
    }

    const series = json["Time Series (Daily)"] ?? {};
    for (const [day, row] of Object.entries(series)) {
      bars.push({
        symbol,
        timeframe: "1d",
        ts: new Date(`${day}T00:00:00Z`).toISOString(),
        open: Number(row["1. open"]),
        high: Number(row["2. high"]),
        low: Number(row["3. low"]),
        close: Number(row["4. close"]),
        volume: Number(row["5. volume"]),
        source: "alphavantage",
      });
    }
  }

  return bars;
}
