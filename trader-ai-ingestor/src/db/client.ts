import { Pool } from "pg";
import { config } from "../config";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl(),
      max: 4,
      idleTimeoutMillis: 10_000,
    });
  }
  return pool;
}

export async function withClient<T>(fn: (client: import("pg").PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
