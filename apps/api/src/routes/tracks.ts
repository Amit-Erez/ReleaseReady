import { Router } from "express";
import { createTrack, listTracksByRelease } from "../services/tracks.js";
import { createTrackSchema } from "@release-ready/shared";
import { getReleaseById } from "../services/releases.js";

export const tracksRouter = Router({ mergeParams: true });

tracksRouter.get<{ releaseId: string }>("/", async (req, res) => {
  const releaseId = Number(req.params.releaseId);
  if (Number.isNaN(releaseId)) {
    return res.status(400).json({
      error: "invalid_releaseId",
      message: "This isn't a valid release ID",
    });
  }
  try {
    const release = await getReleaseById(releaseId);
    if (!release) {
      return res
        .status(404)
        .json({ error: "release_not_found", message: "Release not found" });
    }
    const result = await listTracksByRelease(releaseId);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});

tracksRouter.post<{ releaseId: string }>("/", async (req, res) => {
  const releaseId = Number(req.params.releaseId);
  const trackInfo = createTrackSchema.safeParse(req.body);

  if (Number.isNaN(releaseId)) {
    return res.status(400).json({
      error: "invalid_releaseId",
      message: "This isn't a valid release ID",
    });
  } else if (!trackInfo.success) {
    return res.status(400).json({
      error: "validation_error",
      message: "Invalid track data",
      details: trackInfo.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        field: issue.path.join("."),
      })),
    });
  }

  try {
    const result = await createTrack(releaseId, trackInfo.data);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error && (err as any).code === "23503") {
      return res.status(404).json({
        error: "release_not_found",
        message: "Release not found",
      });
    } else if (err instanceof Error && (err as any).code === "23505") {
      return res.status(409).json({
        error: "duplicate_isrc",
        message: "That ISRC is already in use",
      });
    }
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});
