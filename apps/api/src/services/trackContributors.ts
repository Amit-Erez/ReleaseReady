import { pool } from "../db.js";
import type {
  CreateTrackContributorInput,
  ReplaceTrackContributorsInput,
  TrackContributor,
} from "@release-ready/shared";

export async function createTrackContributor(
  trackId: number,
  { contributor_id, role, split_percent }: CreateTrackContributorInput,
) {
  const result = await pool.query<TrackContributor>(
    "INSERT INTO track_contributors (track_id, contributor_id, role, split_percent) VALUES ($1, $2, $3, $4) RETURNING *",
    [trackId, contributor_id, role, split_percent],
  );
  return result.rows[0];
}

export async function listTrackContributorsByTrack(trackId: number) {
  const result = await pool.query<TrackContributor>(
    "SELECT * FROM track_contributors tc WHERE tc.track_id = $1",
    [trackId],
  );
  return result.rows;
}

export async function replaceTrackContributors(
  trackId: number,
  contributors: ReplaceTrackContributorsInput,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM track_contributors WHERE track_id = $1", [
      trackId,
    ]);
    const newCredits: TrackContributor[] = [];
    for (const contributor of contributors) {
      const result = await client.query<TrackContributor>(
        "INSERT INTO track_contributors (track_id, contributor_id, role, split_percent) VALUES ($1, $2, $3, $4) RETURNING *",
        [
          trackId,
          contributor.contributor_id,
          contributor.role,
          contributor.split_percent,
        ],
      );
      newCredits.push(result.rows[0]);
    }

    await client.query("COMMIT");
    return newCredits
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
