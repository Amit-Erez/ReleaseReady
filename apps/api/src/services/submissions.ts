import type { Submission } from "@release-ready/shared";
import { pool } from "../db.js";

export async function submitRelease(releaseId: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<Submission>(
      "INSERT INTO submissions (release_id) VALUES ($1) RETURNING *",
      [releaseId],
    );
    await client.query(
      "UPDATE releases SET status = 'submitted', updated_at = now() WHERE id = $1",
      [releaseId],
    );
    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
