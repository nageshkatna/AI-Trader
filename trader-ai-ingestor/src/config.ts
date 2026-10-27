export type PriceProviderName = "yahoo" | "alphavantage";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const config = {
  databaseUrl: () => required("DATABASE_URL", "postgres://trader:trader@localhost:5432/ai_trader"),
  priceProvider: (): PriceProviderName =>
    (optional("PRICE_PROVIDER", "yahoo") as PriceProviderName),
  alphaVantageApiKey: () => optional("ALPHA_VANTAGE_API_KEY"),
  newsApiKey: () => optional("NEWS_API_KEY"),
  newsQuery: () => optional("NEWS_QUERY", "stock market OR equities"),
  symbols: (): string[] =>
    optional("SYMBOLS", "AAPL,MSFT,GOOGL,AMZN,NVDA")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
  ingestApiKey: () => optional("INGEST_API_KEY", "change-me"),
  priceLookbackDays: () => Number(optional("PRICE_LOOKBACK_DAYS", "7")),
  newsLookbackHours: () => Number(optional("NEWS_LOOKBACK_HOURS", "24")),
};
