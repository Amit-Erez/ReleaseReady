import { Router } from "express";
import { createContributor } from "../services/contributors.js";
import { createContributorSchema } from "@release-ready/shared";

export const contributorsRouter = Router();

contributorsRouter.post("/", async (req, res) => {
  const contributorInfo = createContributorSchema.safeParse(req.body);
  if (!contributorInfo.success) {
    return res.status(400).json({
      error: "validation_error",
      message: "Invalid contributor data",
      details: contributorInfo.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        field: issue.path.join("."),
      })),
    });
  }

  try {
    const result = await createContributor(contributorInfo.data);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong",
    });
  }
});
