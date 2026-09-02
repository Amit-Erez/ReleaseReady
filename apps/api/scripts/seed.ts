import { Client } from 'pg';
import { config } from '../src/config.js';

const client = new Client({ connectionString: config.DATABASE_URL });

async function main() {
  await client.connect();

  await client.query(
    'TRUNCATE contributors, releases, tracks, track_contributors, submissions RESTART IDENTITY CASCADE'
  );

  const contributors = await client.query<{ id: number }>(
    `INSERT INTO contributors (name, default_role) VALUES
      ('Jane Doe', 'composer'),
      ('John Smith', 'producer'),
      ('Alice Brown', 'lyricist'),
      ('Bob Lee', 'arranger')
    RETURNING id`
  );

  const releases = await client.query<{ id: number }>(
    `INSERT INTO releases (title, artist_name, upc, release_date, status) VALUES
      ('Neon Skyline', 'The Wavelengths', '123456789012', '2026-03-15', 'submitted'),
      ('Midnight Echo', 'Sable River', '234567890123', '2026-05-01', 'draft'),
      ('Untitled Sessions', 'Sable River', NULL, '2026-06-20', 'draft'),
      (NULL, 'The Wavelengths', NULL, '2026-07-10', 'draft')
    RETURNING id`
  );

  const neonSkylineId = releases.rows[0].id;
  const midnightEchoId = releases.rows[1].id;

  const tracks = await client.query<{ id: number }>(
    `INSERT INTO tracks (release_id, title, track_number, isrc) VALUES
      ($1, 'Neon Skyline', 1, 'USRC12345601'),
      ($1, 'City Lights', 2, 'USRC12345602'),
      ($2, 'Low Tide', 1, NULL),
      ($2, 'Static Bloom', 2, NULL),
      ($2, 'Afterglow', 3, NULL)
    RETURNING id`,
    [neonSkylineId, midnightEchoId]
  );

  const neonSkylineTrackId = tracks.rows[0].id;
  const cityLightsTrackId = tracks.rows[1].id;
  const lowTideTrackId = tracks.rows[2].id;
  const janeDoeId = contributors.rows[0].id;
  const johnSmithId = contributors.rows[1].id;
  const aliceBrownId = contributors.rows[2].id;
  const bobLeeId = contributors.rows[3].id;

  await client.query(
    `INSERT INTO track_contributors (track_id, contributor_id, role, split_percent) VALUES
      ($1, $2, 'composer', 60.00),
      ($1, $3, 'producer', 40.00),
      ($4, $2, 'composer', 50.00),
      ($4, $5, 'arranger', 50.00),
      ($6, $3, 'producer', 70.00),
      ($6, $7, 'lyricist', 30.00)`,
    [
      neonSkylineTrackId,
      janeDoeId,
      johnSmithId,
      cityLightsTrackId,
      bobLeeId,
      lowTideTrackId,
      aliceBrownId,
    ]
  );

  await client.query(
    `INSERT INTO submissions (release_id, submitted_at) VALUES ($1, '2026-02-20')`,
    [neonSkylineId]
  );

  console.log('Seed complete: 4 contributors, 4 releases, 5 tracks, 6 credits, 1 submission.');

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
