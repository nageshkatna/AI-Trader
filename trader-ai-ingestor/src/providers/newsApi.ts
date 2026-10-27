import type { NewsHeadline } from "../types";

interface NewsApiArticle {
  title?: string;
  url?: string;
  source?: { name?: string };
  publishedAt?: string;
  description?: string;
}

/**
 * NewsAPI.org /everything. Swap for any news HTTP API with the same return shape.
 */
export async function fetchNewsHeadlines(
  apiKey: string,
  query: string,
  lookbackHours: number
): Promise<NewsHeadline[]> {
  if (!apiKey) {
    throw new Error("NEWS_API_KEY is required for scheduled news ingestion");
  }

  const from = new Date(Date.now() - lookbackHours * 60 * 60 * 1000).toISOString();
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", query);
  url.searchParams.set("from", from);
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "50");
  url.searchParams.set("apiKey", apiKey);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`News API HTTP ${res.status}`);
  }

  const json = (await res.json()) as { articles?: NewsApiArticle[] };
  return (json.articles ?? [])
    .filter((a) => a.title)
    .map((a) => ({
      headline: a.title as string,
      url: a.url,
      source: a.source?.name ?? "newsapi",
      publishedAt: a.publishedAt,
      raw: a as Record<string, unknown>,
    }));
}
