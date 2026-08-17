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

export async function getReleaseReadiness(releaseId: number) {
  const release = await getReleaseById(releaseId);
  if (!release) return undefined;
  const tracks = await listTracksByRelease(releaseId);

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

  return checkReadiness({
    title: release.title,
    upc: release.upc,
    tracks: tracksInput,
  });
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
