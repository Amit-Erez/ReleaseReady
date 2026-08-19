import { pool } from "../src/db.js";

export async function resetDb() {
  await pool.query(
    "TRUNCATE releases, tracks, contributors, track_contributors, submissions RESTART IDENTITY CASCADE",
  );
}