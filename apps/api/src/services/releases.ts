import { pool } from "../db.js";
import type { CreateReleaseInput, Release, ReleaseWithReadiness } from "@release-ready/shared";
import { getReadinessSummaryForRelease } from "./readiness.js";

export async function listReleases(): Promise<ReleaseWithReadiness[]> {
  const result = await pool.query<Release>(
    "SELECT * FROM releases ORDER BY id",
  );
  return Promise.all(
    result.rows.map(async (release) => ({
      ...release,
      readinessSummary: await getReadinessSummaryForRelease(release),
    })),
  );
}

export async function getReleaseById(id: number) {
  const result = await pool.query<Release>(
    "SELECT * FROM releases WHERE id = $1",
    [id],
  );
  if (result.rows.length === 0) return undefined;
  return result.rows[0];
}

export async function createRelease({
  artist_name,
  title,
  upc,
  release_date,
}: CreateReleaseInput) {
  const result = await pool.query<Release>(
    "INSERT INTO releases (title, artist_name, upc, release_date, status) VALUES ($1, $2, $3, $4, 'draft') RETURNING *",
    [title ?? null, artist_name, upc ?? null, release_date],
  );
  return result.rows[0];
}

export async function updateRelease(
  id: number,
  { artist_name, title, upc, release_date }: CreateReleaseInput,
) {
  const result = await pool.query<Release>(
    `UPDATE releases
     SET title = $1, artist_name = $2, upc = $3, release_date = $4, updated_at = now()
     WHERE id = $5
     RETURNING *`,
    [title ?? null, artist_name, upc ?? null, release_date, id],
  );
  if (result.rows.length === 0) return undefined;
  return result.rows[0];
}
