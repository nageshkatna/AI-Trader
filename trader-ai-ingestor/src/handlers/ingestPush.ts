import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { config } from "../config";
import { upsertBars } from "../db/bars";
import { withClient } from "../db/client";
import { upsertHeadlines } from "../db/headlines";
import { finishRun, startRun } from "../db/runs";
import { logger } from "../logger";
import type { PushPayload } from "../types";

function json(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const key = event.headers["x-ingest-key"] ?? event.headers["X-Ingest-Key"];
  if (!key || key !== config.ingestApiKey()) {
    return json(401, { error: "unauthorized" });
  }

  if (!event.body) {
    return json(400, { error: "empty body" });
  }

  let payload: PushPayload;
  try {
    payload = JSON.parse(event.body) as PushPayload;
  } catch {
    return json(400, { error: "invalid json" });
  }

  return withClient(async (client) => {
    const runId = await startRun(client, "ingest-push");
    try {
      let rows = 0;
      if (payload.kind === "bars") {
        rows = await upsertBars(client, payload.bars);
      } else if (payload.kind === "headlines") {
        rows = await upsertHeadlines(client, payload.headlines);
      } else {
        await finishRun(client, runId, "error", 0, "unknown kind");
        return json(400, { error: "kind must be bars or headlines" });
      }

      await finishRun(client, runId, "ok", rows);
      logger.info("ingest-push complete", { kind: payload.kind, rows });
      return json(200, { ok: true, rows });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await finishRun(client, runId, "error", 0, message);
      logger.error("ingest-push failed", message);
      return json(500, { error: message });
    }
  });
}
