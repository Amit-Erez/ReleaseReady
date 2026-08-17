import { pool } from "../db.js";
import type {
  CreateContributorInput,
  Contributor,
} from "@release-ready/shared";

export async function createContributor({
  name,
  default_role,
}: CreateContributorInput) {
  const result = await pool.query<Contributor>(
    "INSERT INTO contributors (name, default_role) VALUES ($1, $2) RETURNING *",
    [name, default_role],
  );
  return result.rows[0];
}

export async function listContributorsByRelease(releaseId: number) {
  const result = await pool.query<Contributor>(
    "SELECT DISTINCT c.* FROM contributors c JOIN track_contributors tc ON tc.contributor_id = c.id JOIN tracks t ON t.id = tc.track_id WHERE t.release_id = $1",
    [releaseId],
  );
  return result.rows;
}
