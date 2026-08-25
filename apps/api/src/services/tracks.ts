import { pool } from "../db.js";
import type { CreateTrackInput, Track, TrackWithSplits } from "@release-ready/shared";
import { listTrackContributorsByTrack } from "./trackContributors.js";

export async function createTrack(
  releaseId: number,
  { title, track_number, isrc }: CreateTrackInput,
) {
  const result = await pool.query<Track>(
    "INSERT INTO tracks (release_id, title, track_number, isrc) VALUES ($1, $2, $3, $4) RETURNING *",
    [releaseId, title, track_number, isrc ?? null],
  );
  return result.rows[0];
}

export async function listTracksByRelease(releaseId: number) {
  const result = await pool.query<Track>(
    "SELECT * from tracks WHERE release_id = $1 ORDER by track_number",
    [releaseId],
  );
  return result.rows;
}

export async function updateTrack(
  trackId: number,
  { title, track_number, isrc }: CreateTrackInput,
) {
  const result = await pool.query<Track>(
    `UPDATE tracks 
    SET title = $1, track_number = $2, isrc = $3
    WHERE id = $4
    RETURNING *`,
    [title, track_number, isrc ?? null, trackId]
  );
  if (result.rows.length === 0) return undefined;
  return result.rows[0];
}

export async function getTrackById(id: number) {
  const result = await pool.query<Track>(
    "SELECT * FROM tracks WHERE id = $1",
    [id],
  );
  if (result.rows.length === 0) return undefined;
  return result.rows[0];
}

export async function moveTrack(trackId: number, newPosition: number) {
  const track = await getTrackById(trackId);
  if (!track) return undefined;

  const oldPosition = track.track_number;
  if (newPosition === oldPosition) return [track];

  const movingUp = newPosition < oldPosition;
  const shiftAmount = movingUp ? 1 : -1;
  const rangeStart = movingUp ? newPosition : oldPosition + 1;
  const rangeEnd = movingUp ? oldPosition - 1 : newPosition;

  const result = await pool.query<Track>(
    `UPDATE tracks
     SET track_number = CASE
       WHEN id = $1 THEN $2
       ELSE track_number + $3
     END
     WHERE release_id = $4
       AND (id = $1 OR (track_number >= $5 AND track_number <= $6))
     RETURNING *`,
    [trackId, newPosition, shiftAmount, track.release_id, rangeStart, rangeEnd],
  );

  return result.rows;
}

export async function getTracksWithSplits(releaseId: number): Promise<TrackWithSplits[]> {
  const tracks = await listTracksByRelease(releaseId);
  return Promise.all(
    tracks.map(async (track) => {
      const contributors = await listTrackContributorsByTrack(track.id);
      const splitsTotal = contributors.reduce((sum, c) => sum + c.split_percent, 0);
      return { ...track, splitsTotal };
    }),
  );
}
