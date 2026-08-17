import { pool } from "../db.js";
import type { CreateTrackInput, Track } from "@release-ready/shared";

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
    'SELECT * from tracks WHERE release_id = $1 ORDER by track_number', [releaseId]
  );
  return result.rows
}

