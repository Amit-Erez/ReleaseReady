import { Router } from "express";
import {
  createRelease,
  getReleaseById,
  listReleases,
  updateRelease,
} from "../services/releases.js";
import { createReleaseSchema } from "@release-ready/shared";
import { listContributorsByRelease } from "../services/contributors.js";
import { getReleaseReadiness } from "../services/readiness.js";

export const releasesRouter = Router();

releasesRouter.get("/", async (_req, res) => {
  try {
    const releases = await listReleases();
    res.json(releases);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});

releasesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({
      error: "invalid_id",
      message: "This isn't a valid ID",
    });
    return;
  }
  try {
    const release = await getReleaseById(id);
    if (!release) {
      res.status(404).json({
        error: "release_not_found",
        message: "Release not found",
      });
    } else {
      res.json(release);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});

releasesRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({
      error: "invalid_id",
      message: "This isn't a valid ID",
    });
    return;
  }
  const releaseInfo = createReleaseSchema.safeParse(req.body);
  if (!releaseInfo.success) {
    return res.status(400).json({
      error: "validation_error",
      message: "Invalid release data",
      details: releaseInfo.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        field: issue.path.join("."),
      })),
    });
  }

  try {
    const existing = await getReleaseById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ error: "release_not_found", message: "Release not found" });
    }
    if (existing.status === "submitted") {
      return res.status(409).json({
        error: "release_already_submitted",
        message: "Submitted releases can't be edited",
      });
    }
    const result = await updateRelease(id, releaseInfo.data);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error && (err as any).code === "23505") {
      return res.status(409).json({
        error: "duplicate_upc",
        message: "That UPC is already in use",
      });
    }
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});

releasesRouter.get("/:releaseId/contributors", async (req, res) => {
  const id = Number(req.params.releaseId);
  if (Number.isNaN(id)) {
    res.status(400).json({
      error: "invalid_releaseId",
      message: "This isn't a valid release ID",
    });
    return;
  }
  try {
    const release = await getReleaseById(id);
    if (!release) {
      return res
        .status(404)
        .json({ error: "release_not_found", message: "Release not found" });
    }
    const result = await listContributorsByRelease(id);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});

releasesRouter.post("/", async (req, res) => {
  const releaseInfo = createReleaseSchema.safeParse(req.body);
  if (!releaseInfo.success) {
    return res.status(400).json({
      error: "validation_error",
      message: "Invalid release data",
      details: releaseInfo.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        field: issue.path.join("."),
      })),
    });
  }

  try {
    const result = await createRelease(releaseInfo.data);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error && (err as any).code === "23505") {
      return res.status(409).json({
        error: "duplicate_upc",
        message: "That UPC is already in use",
      });
    }
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});

releasesRouter.get("/:releaseId/readiness", async (req, res) => {
  const id = Number(req.params.releaseId);
  if (Number.isNaN(id)) {
    res.status(400).json({
      error: "invalid_releaseId",
      message: "This isn't a valid release ID",
    });
    return;
  }
  try {
    const failures = await getReleaseReadiness(id);
    if (failures === undefined) {
      return res
        .status(404)
        .json({ error: "release_not_found", message: "Release not found" });
    }
    res.status(200).json(failures);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});
