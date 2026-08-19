import { replaceTrackContributorsSchema } from "@release-ready/shared";
import { Router } from "express";
import { replaceTrackContributors } from "../services/trackContributors.js";
import { getTrackById } from "../services/tracks.js";
import { getReleaseById } from "../services/releases.js";

export const trackContributorsRouter = Router({ mergeParams: true });

trackContributorsRouter.put<{ trackId: string }>("/", async (req, res) => {
  const trackId = Number(req.params.trackId);
  const trackContributorsInfo = replaceTrackContributorsSchema.safeParse(
    req.body,
  );
  if (Number.isNaN(trackId)) {
    return res.status(400).json({
      error: "invalid_trackId",
      message: "This isn't a valid track ID",
    });
  } else if (!trackContributorsInfo.success) {
    return res.status(400).json({
      error: "validation_error",
      message: "Invalid track contributor data",
      details: trackContributorsInfo.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        field: issue.path.join("."),
      })),
    });
  }

  try {
    const track = await getTrackById(trackId);
    if (!track) {
      return res
        .status(404)
        .json({ error: "track_not_found", message: "Track not found" });
    }
    const release = await getReleaseById(track.release_id);
    if (!release) {
      return res.status(404).json({
        error: "release_not_found",
        message: "Release not found",
      });
    } else if (release.status === "submitted") {
      return res.status(409).json({
        error: "release_already_submitted",
        message: "Tracks on a submitted release can't be edited",
      });
    }
    const splitsArr = trackContributorsInfo.data.map((c) => c.split_percent);
    const sum = splitsArr.reduce((acc, val) => acc + val, 0);
    if (sum !== 100) {
      return res.status(422).json({
        error: "splits_total_invalid",
        message: "Splits total must equal exactly 100.00",
      });
    }
    const result = await replaceTrackContributors(
      trackId,
      trackContributorsInfo.data,
    );
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error && (err as any).code === "23503") {
      return res.status(400).json({
        error: "invalid_reference",
        message: "That contributor or track doesn't exist",
      });
    } else if (err instanceof Error && (err as any).code === "23505") {
      return res.status(409).json({
        error: "duplicate_credit",
        message:
          "A contributor cannot be creditted for the same role more than once per track",
      });
    }
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});
