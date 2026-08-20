import type { Release, Track, Contributor, TrackContributor } from "@release-ready/shared";

/**
 * Static placeholder data for the "static UI" pass — no fetching, no computed
 * readiness. `readinessSummary`/`readinessChecks`/`splitPercent` are hand-typed
 * to match what real checkReadiness() output would look like for this fixture,
 * not derived from one.
 */
export type ReadinessCheck = {
  code: string;
  message: string;
  passed: boolean;
};

export type ReleaseListItem = Release & {
  readinessSummary: { checksPassed: number; checksTotal: number } | null;
  readinessChecks: ReadinessCheck[];
};

export type TrackFixture = Track & {
  /** Sum of this track's contributor splits. null = no contributors listed. */
  splitPercent: number | null;
};

const READINESS_CHECK_COUNT = 6;

export const placeholderReleases: ReleaseListItem[] = [
  {
    id: 1,
    title: "Midnight Static",
    artist_name: "Nova Sinclair",
    upc: null,
    release_date: new Date("2026-03-14"),
    status: "draft",
    created_at: new Date("2026-01-05"),
    updated_at: new Date("2026-02-20"),
    readinessSummary: { checksPassed: 3, checksTotal: READINESS_CHECK_COUNT },
    readinessChecks: [
      { code: "missing_title", message: "Title is required", passed: true },
      { code: "missing_upc", message: "UPC is required", passed: false },
      { code: "missing_tracks", message: "A release must have at least one track", passed: true },
      { code: "missing_isrc", message: "Every track must have an isrc code", passed: false },
      { code: "no_contributors_listed", message: "Every track must list at least 1 contributor", passed: true },
      { code: "splits_not_100", message: "Every track's contributor splits must total exactly 100 percent", passed: false },
    ],
  },
  {
    id: 2,
    title: "Nightdrive",
    artist_name: "Kilo Static",
    upc: "194398271025",
    release_date: new Date("2026-04-20"),
    status: "draft",
    created_at: new Date("2026-01-18"),
    updated_at: new Date("2026-03-01"),
    readinessSummary: { checksPassed: 6, checksTotal: READINESS_CHECK_COUNT },
    readinessChecks: [
      { code: "missing_title", message: "Title is required", passed: true },
      { code: "missing_upc", message: "UPC is required", passed: true },
      { code: "missing_tracks", message: "A release must have at least one track", passed: true },
      { code: "missing_isrc", message: "Every track must have an isrc code", passed: true },
      { code: "no_contributors_listed", message: "Every track must list at least 1 contributor", passed: true },
      { code: "splits_not_100", message: "Every track's contributor splits must total exactly 100 percent", passed: true },
    ],
  },
  {
    id: 3,
    title: "Solstice",
    artist_name: "Reyes & Vance",
    upc: "194398271322",
    release_date: new Date("2026-02-01"),
    status: "submitted",
    created_at: new Date("2025-11-02"),
    updated_at: new Date("2026-01-25"),
    readinessSummary: null,
    readinessChecks: [
      { code: "missing_title", message: "Title is required", passed: true },
      { code: "missing_upc", message: "UPC is required", passed: true },
      { code: "missing_tracks", message: "A release must have at least one track", passed: true },
      { code: "missing_isrc", message: "Every track must have an isrc code", passed: true },
      { code: "no_contributors_listed", message: "Every track must list at least 1 contributor", passed: true },
      { code: "splits_not_100", message: "Every track's contributor splits must total exactly 100 percent", passed: true },
    ],
  },
  {
    id: 4,
    title: null,
    artist_name: "Priya Menon",
    upc: null,
    release_date: new Date("2026-01-10"),
    status: "draft",
    created_at: new Date("2025-12-14"),
    updated_at: new Date("2025-12-14"),
    readinessSummary: { checksPassed: 3, checksTotal: READINESS_CHECK_COUNT },
    readinessChecks: [
      { code: "missing_title", message: "Title is required", passed: false },
      { code: "missing_upc", message: "UPC is required", passed: false },
      { code: "missing_tracks", message: "A release must have at least one track", passed: true },
      { code: "missing_isrc", message: "Every track must have an isrc code", passed: true },
      { code: "no_contributors_listed", message: "Every track must list at least 1 contributor", passed: false },
      { code: "splits_not_100", message: "Every track's contributor splits must total exactly 100 percent", passed: true },
    ],
  },
  {
    id: 5,
    title: "Afterglow Sessions",
    artist_name: "Nova Sinclair",
    upc: null,
    release_date: new Date("2026-05-02"),
    status: "draft",
    created_at: new Date("2026-02-10"),
    updated_at: new Date("2026-02-10"),
    readinessSummary: { checksPassed: 2, checksTotal: READINESS_CHECK_COUNT },
    readinessChecks: [
      { code: "missing_title", message: "Title is required", passed: true },
      { code: "missing_upc", message: "UPC is required", passed: false },
      { code: "missing_tracks", message: "A release must have at least one track", passed: true },
      { code: "missing_isrc", message: "Every track must have an isrc code", passed: false },
      { code: "no_contributors_listed", message: "Every track must list at least 1 contributor", passed: false },
      { code: "splits_not_100", message: "Every track's contributor splits must total exactly 100 percent", passed: false },
    ],
  },
];

export const placeholderTracks: TrackFixture[] = [
  { id: 101, release_id: 1, title: "Fade Into You", track_number: 1, isrc: "USRC17607839", splitPercent: 100 },
  { id: 102, release_id: 1, title: "Neon Static", track_number: 2, isrc: null, splitPercent: 60 },

  { id: 201, release_id: 2, title: "Chrome Skyline", track_number: 1, isrc: "USRC17607846", splitPercent: 100 },
  { id: 202, release_id: 2, title: "Vapor Trail", track_number: 2, isrc: "USRC17607847", splitPercent: 100 },

  { id: 301, release_id: 3, title: "Solstice", track_number: 1, isrc: "USRC17607848", splitPercent: 100 },

  { id: 401, release_id: 4, title: "Untitled Sketch", track_number: 1, isrc: "USRC17607849", splitPercent: null },

  { id: 501, release_id: 5, title: "Drift", track_number: 1, isrc: null, splitPercent: null },
  { id: 502, release_id: 5, title: "Halcyon", track_number: 2, isrc: "USRC17607850", splitPercent: 55 },
];

export const placeholderContributors: Contributor[] = [
  { id: 1, name: "Nova Sinclair", default_role: "composer", created_at: new Date("2025-10-01") },
  { id: 2, name: "Jax Rivera", default_role: "producer", created_at: new Date("2025-10-05") },
  { id: 3, name: "Kilo Static", default_role: "composer", created_at: new Date("2025-11-10") },
  { id: 4, name: "Mara Reyes", default_role: "composer", created_at: new Date("2025-09-15") },
  { id: 5, name: "Theo Vance", default_role: "composer", created_at: new Date("2025-09-15") },
];

export const placeholderTrackContributors: TrackContributor[] = [
  { track_id: 101, contributor_id: 1, role: "composer", split_percent: 70 },
  { track_id: 101, contributor_id: 2, role: "producer", split_percent: 30 },
  { track_id: 102, contributor_id: 1, role: "composer", split_percent: 60 },
  { track_id: 201, contributor_id: 3, role: "composer", split_percent: 100 },
  { track_id: 202, contributor_id: 3, role: "composer", split_percent: 60 },
  { track_id: 202, contributor_id: 2, role: "producer", split_percent: 40 },
  { track_id: 301, contributor_id: 4, role: "composer", split_percent: 50 },
  { track_id: 301, contributor_id: 5, role: "composer", split_percent: 50 },
  { track_id: 502, contributor_id: 1, role: "composer", split_percent: 55 },
];
