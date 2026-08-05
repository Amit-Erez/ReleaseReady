import { Router } from "express";
import {
  createRelease,
  getReleaseById,
  listReleases,
} from "../services/releases.js";
import { createReleaseSchema } from "@release-ready/shared";

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
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});
