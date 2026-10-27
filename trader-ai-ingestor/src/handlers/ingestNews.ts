import type { ScheduledEvent } from "aws-lambda";
import { config } from "../config";
import { withClient } from "../db/client";
import { upsertHeadlines } from "../db/headlines";
import { finishRun, startRun } from "../db/runs";
import { logger } from "../logger";
import { fetchNewsHeadlines } from "../providers/newsApi";

export async function handler(_event: ScheduledEvent): Promise<{ rows: number }> {
  return withClient(async (client) => {
    const runId = await startRun(client, "ingest-news");
    try {
      const headlines = await fetchNewsHeadlines(
        config.newsApiKey(),
        config.newsQuery(),
        config.newsLookbackHours()
      );
      const rows = await upsertHeadlines(client, headlines);
      await finishRun(client, runId, "ok", rows);
      logger.info("ingest-news complete", { rows });
      return { rows };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await finishRun(client, runId, "error", 0, message);
      logger.error("ingest-news failed", message);
      throw err;
    }
  });
}
