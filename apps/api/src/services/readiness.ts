import type { Release } from "@release-ready/shared";
import { getReleaseById } from "./releases.js";
import { listTracksByRelease } from "./tracks.js";
import { listTrackContributorsByTrack } from "./trackContributors.js";

export type ReadinessInput = {
  title: string | null;
  upc: string | null;
  tracks: { id: number; isrc: string | null; splitPercents: number[] }[];
};

export type ReadinessFailure = {
  code: string;
  message: string;
  field: string;
};

/** Total number of distinct readiness rules (see checkReadiness's `code`s below). */
export const READINESS_CHECK_COUNT = 6;
export const RULES = [
  {code: "missing_title", message: "Title is required"},
  {code: "missing_upc", message: "UPC is required"},
  {code: "missing_tracks", message: "A release must have at least one track"},
  {code: "missing_isrc", message: "Every track must have an isrc code"},
  {code: "no_contributors_listed", message: "Every track must list at least 1 contributor"},
  {code: "splits_not_100", message: "Every track's contributor splits must total exactly 100 percent"},
]
export const submittedReleaseRulesPanel = RULES.map((rule) => ({...rule, passed: true}))

async function buildReadinessInput(release: Release): Promise<ReadinessInput> {
  const tracks = await listTracksByRelease(release.id);

  const tracksInput = await Promise.all(
    tracks.map(async (track) => {
      const contributors = await listTrackContributorsByTrack(track.id);
      return {
        id: track.id,
        isrc: track.isrc,
        splitPercents: contributors.map((c) => c.split_percent),
      };
    }),
  );

  return { title: release.title, upc: release.upc, tracks: tracksInput };
}

export async function getReleaseReadiness(releaseId: number) {
  const release = await getReleaseById(releaseId);
  if (!release) return undefined;
  const input = await buildReadinessInput(release);
  return checkReadiness(input);
}

/**
 * A release-level pass/fail count for list views. Note a single rule (e.g.
 * missing_isrc) can produce multiple failures — one per offending track — so
 * this dedupes by `code` rather than using the raw failure count.
 */
export function summarizeReadiness(failures: ReadinessFailure[]) {
  const failingCodes = new Set(failures.map((f) => f.code));
  const ruleChecks = [];
  for (const rule of RULES) {
    if(failingCodes.has(rule.code)){
      ruleChecks.push({code: rule.code, message: rule.message, passed: false})
    } else {
      ruleChecks.push({code: rule.code, message: rule.message, passed: true})
    }
  }
  return {
    checksPassed: READINESS_CHECK_COUNT - failingCodes.size,
    checksTotal: READINESS_CHECK_COUNT,
    ruleChecks: ruleChecks,
  };
}

/**
 * Submitted releases get a static all-passing summary, skipping the queries.
 */
export async function getReadinessSummaryForRelease(release: Release) {
  if (release.status === "submitted") return {
    checksPassed: READINESS_CHECK_COUNT,
    checksTotal: READINESS_CHECK_COUNT,
    ruleChecks: submittedReleaseRulesPanel,
  };
  const input = await buildReadinessInput(release);
  const failures = checkReadiness(input);
  return summarizeReadiness(failures);
}

export function checkReadiness(input: ReadinessInput): ReadinessFailure[] {
  const failures: ReadinessFailure[] = [];

  if (!input.title) {
    failures.push({
      code: "missing_title",
      message: "Title is required",
      field: "title",
    });
  }

  if (!input.upc) {
    failures.push({
      code: "missing_upc",
      message: "UPC is required",
      field: "upc",
    });
  }

  if (input.tracks.length === 0) {
    failures.push({
      code: "missing_tracks",
      message: "A release must have at least one track",
      field: "tracks",
    });
  } else {
    for (const track of input.tracks) {
      if (!track.isrc) {
        failures.push({
          code: "missing_isrc",
          message: "Every track must have an isrc code",
          field: `tracks[${track.id}].isrc`,
        });
      }
    }
    for (const track of input.tracks) {
      if (track.splitPercents.length === 0) {
        failures.push({
          code: "no_contributors_listed",
          message: "Every track must list at least 1 contributor",
          field: `tracks[${track.id}]`,
        });
      } else {
        const splitsTotal = track.splitPercents.reduce((sum, p) => sum + p, 0);
        if (splitsTotal !== 100) {
          failures.push({
            code: "splits_not_100",
            message:
              "Every track's contributor splits must total exactly 100 percent",
            field: `tracks[${track.id}].split_percent`,
          });
        }
      }
    }
  }

  return failures;
}
