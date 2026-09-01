import { Router } from "express";
import {
  createTrack,
  getTrackById,
  getTracksWithSplits,
  listTracksByRelease,
  moveTrack,
  updateTrack,
} from "../services/tracks.js";
import { createTrackSchema, moveTrackSchema, updateTrackSchema } from "@release-ready/shared";
import { getReleaseById } from "../services/releases.js";

export const tracksRouter = Router({ mergeParams: true });
export const trackByIdRouter = Router();

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
    const tracks = await getTracksWithSplits(releaseId);
    res.status(200).json(tracks);
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

  const release = await getReleaseById(releaseId);
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

  try {
    const result = await createTrack(releaseId, trackInfo.data);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error && (err as any).code === "23505") {
      if ((err as any).constraint === "tracks_uniq_release_id_track_number") {
        return res.status(409).json({
          error: "duplicate_track_number",
          message:
            "A track with that track number already exists on this release",
        });
      }
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

trackByIdRouter.patch("/:id", async (req, res) => {
  const trackId = Number(req.params.id);
  const trackInfo = updateTrackSchema.safeParse(req.body);

  if (Number.isNaN(trackId)) {
    return res.status(400).json({
      error: "invalid_trackId",
      message: "This isn't a valid track ID",
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
    const result = await updateTrack(trackId, trackInfo.data);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error && (err as any).code === "23505") {
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

trackByIdRouter.patch("/:id/move", async (req, res) => {
  const trackId = Number(req.params.id);
  const moveInfo = moveTrackSchema.safeParse(req.body);

  if (Number.isNaN(trackId)) {
    return res
      .status(400)
      .json({ error: "invalid_trackId", message: "This isn't a valid track ID" });
  } else if (!moveInfo.success) {
    return res.status(400).json({
      error: "validation_error",
      message: "Invalid move data",
      details: moveInfo.error.issues.map((issue) => ({
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
        message: "Tracks on a submitted release can't be reordered",
      });
    }

    const tracksOnRelease = await listTracksByRelease(track.release_id);
    const newPosition =
      moveInfo.data.direction === "up"
        ? track.track_number - 1
        : track.track_number + 1;

    if (newPosition < 1 || newPosition > tracksOnRelease.length) {
      return res.status(422).json({
        error: "invalid_move",
        message: "Track is already at that end of the list",
      });
    }

    const result = await moveTrack(trackId, newPosition);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});
