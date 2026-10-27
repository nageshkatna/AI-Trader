import type { PoolClient } from "pg";

export async function startRun(client: PoolClient, job: string): Promise<number> {
  const res = await client.query(
    `INSERT INTO ingest_runs (job) VALUES ($1) RETURNING id`,
    [job]
  );
  return Number(res.rows[0].id);
}

export async function finishRun(
  client: PoolClient,
  id: number,
  status: "ok" | "error",
  rowsWritten: number,
  error?: string
): Promise<void> {
  await client.query(
    `UPDATE ingest_runs
     SET finished_at = NOW(), status = $2, rows_written = $3, error = $4
     WHERE id = $1`,
    [id, status, rowsWritten, error ?? null]
  );
}
