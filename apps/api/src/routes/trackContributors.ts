import { createTrackContributorSchema } from "@release-ready/shared";
import { Router } from "express";
import { createTrackContributor } from "../services/trackContributors.js";

export const trackContributorsRouter = Router({ mergeParams: true });

trackContributorsRouter.post<{ trackId: string }>("/", async (req, res) => {
  const trackId = Number(req.params.trackId);
  const trackContributorInfo = createTrackContributorSchema.safeParse(req.body);

  if (Number.isNaN(trackId)) {
    return res.status(400).json({
      error: "invalid_trackId",
      message: "This isn't a valid track ID",
    });
  } else if (!trackContributorInfo.success) {
    return res.status(400).json({
      error: "validation_error",
      message: "Invalid track contributor data",
      details: trackContributorInfo.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        field: issue.path.join("."),
      })),
    });
  }

  try {
    const result = await createTrackContributor(
      trackId,
      trackContributorInfo.data,
    );
    return res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error && (err as any).code === "23503") {
      return res.status(400).json({
        error: "invalid_reference",
        message: "That contributor or track doesn't exist",
      });
    }
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});
