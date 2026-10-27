import type { ScheduledEvent } from "aws-lambda";
import { config } from "../config";
import { withClient } from "../db/client";
import { upsertBars } from "../db/bars";
import { finishRun, startRun } from "../db/runs";
import { logger } from "../logger";
import { fetchAlphaVantageDaily } from "../providers/alphaVantage";
import { fetchYahooDaily } from "../providers/yahooFinance";

export async function handler(_event: ScheduledEvent): Promise<{ rows: number }> {
  return withClient(async (client) => {
    const runId = await startRun(client, "ingest-prices");
    try {
      const symbols = config.symbols();
      const provider = config.priceProvider();

      const bars =
        provider === "alphavantage"
          ? await fetchAlphaVantageDaily(symbols, config.alphaVantageApiKey())
          : await fetchYahooDaily(symbols, config.priceLookbackDays());

      const rows = await upsertBars(client, bars);
      await finishRun(client, runId, "ok", rows);
      logger.info("ingest-prices complete", { provider, symbols, rows });
      return { rows };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await finishRun(client, runId, "error", 0, message);
      logger.error("ingest-prices failed", message);
      throw err;
    }
  });
}
