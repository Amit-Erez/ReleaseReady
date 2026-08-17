import { pool } from "../db.js";
import type {
  CreateTrackContributorInput,
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
'SELECT * FROM track_contributors tc WHERE tc.track_id = $1', [trackId]
);
return result.rows
}
