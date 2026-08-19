import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { pool } from "../src/db.js";
import { resetDb } from "./helpers.js";

describe("POST /api/releases/:id/submit", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("submits a ready release", async () => {
    const release = await pool.query(
      `INSERT INTO releases (title, artist_name, upc, release_date)
       VALUES ('Test Release', 'Test Artist', '123456789012', '2026-01-01')
       RETURNING id`,
    );
    const releaseId = release.rows[0].id;

    const track = await pool.query(
      `INSERT INTO tracks (release_id, title, track_number, isrc)
       VALUES ($1, 'Track One', 1, 'USRC17654321')
       RETURNING id`,
      [releaseId],
    );
    const trackId = track.rows[0].id;

    const contributor = await pool.query(
      `INSERT INTO contributors (name, default_role)
       VALUES ('Jane Doe', 'composer')
       RETURNING id`,
    );
    const contributorId = contributor.rows[0].id;

    await pool.query(
      `INSERT INTO track_contributors (track_id, contributor_id, role, split_percent)
       VALUES ($1, $2, 'composer', 100)`,
      [trackId, contributorId],
    );

    const res = await request(app).post(`/api/releases/${releaseId}/submit`);

    expect(res.status).toBe(201);

    const submissionCheck = await pool.query(
      "SELECT * FROM submissions WHERE release_id = $1",
      [releaseId],
    );
    expect(submissionCheck.rows).toHaveLength(1);

    const releaseCheck = await pool.query(
      "SELECT status FROM releases WHERE id = $1",
      [releaseId],
    );
    expect(releaseCheck.rows[0].status).toBe("submitted");
  });

  it("fails readiness check", async () => {
    const release = await pool.query(
      `INSERT INTO releases (title, artist_name, upc, release_date)
       VALUES ('Test Release', 'Test Artist', '123456789012', '2026-01-01')
       RETURNING id`,
    );
    const releaseId = release.rows[0].id;

    const res = await request(app).post(`/api/releases/${releaseId}/submit`);

    expect(res.status).toBe(422);
    expect(res.body.details).toContainEqual(
      expect.objectContaining({ code: "missing_tracks" }),
    );

    const submissionCheck = await pool.query(
      "SELECT * FROM submissions WHERE release_id = $1",
      [releaseId],
    );
    expect(submissionCheck.rows).toHaveLength(0);

    const releaseCheck = await pool.query(
      "SELECT status FROM releases WHERE id = $1",
      [releaseId],
    );
    expect(releaseCheck.rows[0].status).toBe("draft");
  });

  it("rolls back if a failure happens between the two writes", async () => {
    const release = await pool.query(
      `INSERT INTO releases (title, artist_name, upc, release_date)
       VALUES ('Test Release', 'Test Artist', '123456789012', '2026-01-01')
       RETURNING id`,
    );
    const releaseId = release.rows[0].id;

    const track = await pool.query(
      `INSERT INTO tracks (release_id, title, track_number, isrc)
       VALUES ($1, 'Track One', 1, 'USRC17654321')
       RETURNING id`,
      [releaseId],
    );
    const trackId = track.rows[0].id;

    const contributor = await pool.query(
      `INSERT INTO contributors (name, default_role)
       VALUES ('Jane Doe', 'composer')
       RETURNING id`,
    );
    const contributorId = contributor.rows[0].id;

    await pool.query(
      `INSERT INTO track_contributors (track_id, contributor_id, role, split_percent)
       VALUES ($1, $2, 'composer', 100)`,
      [trackId, contributorId],
    );

    const client = await pool.connect();
    let callCount = 0;
    const originalQuery = client.query.bind(client);
    vi.spyOn(client, "query").mockImplementation(((text: any, values: any) => {
      callCount++;
      if (callCount === 3) {
        return Promise.reject(new Error("forced failure for rollback test"));
      }
      return originalQuery(text, values);
    }) as any);


    const originalConnect = pool.connect.bind(pool);
    vi.spyOn(pool, "connect").mockImplementation(((callback?: any) => {
      if (callback) {
        return originalConnect(callback);
      }
      return Promise.resolve(client);
    }) as any);

    

    const res = await request(app).post(`/api/releases/${releaseId}/submit`);
    vi.restoreAllMocks();

    expect(res.status).toBe(500);

    const submissionCheck = await pool.query(
      "SELECT * FROM submissions WHERE release_id = $1",
      [releaseId],
    );
    expect(submissionCheck.rows).toHaveLength(0);

    const releaseCheck = await pool.query(
      "SELECT status FROM releases WHERE id = $1",
      [releaseId],
    );
    expect(releaseCheck.rows[0].status).toBe("draft");
  });
});
