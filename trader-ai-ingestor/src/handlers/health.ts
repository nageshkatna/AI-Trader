import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { withClient } from "../db/client";

export async function handler(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    await withClient(async (client) => {
      await client.query("SELECT 1");
    });
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "ok", service: "trader-ai-ingestor" }),
    };
  } catch (err) {
    return {
      statusCode: 503,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: "degraded",
        error: err instanceof Error ? err.message : String(err),
      }),
    };
  }
}
