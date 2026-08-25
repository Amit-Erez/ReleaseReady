import { z } from "zod";

export const createReleaseSchema = z.object({
  artist_name: z.string().min(1, "Artist name is required"),
  title: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? null : val),
    z.string().min(1).nullable().optional(),
  ),
  upc: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? null : val),
    z
      .string()
      .regex(/^\d{12,13}$/, "UPC must be 12 or 13 digits")
      .nullable()
      .optional(),
  ),
  release_date: z.iso.date("Release date must be a valid date (YYYY-MM-DD)"),
});

export type CreateReleaseInput = z.infer<typeof createReleaseSchema>;

export const releaseSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  artist_name: z.string(),
  upc: z
    .string()
    .regex(/^\d{12,13}$/, "UPC must be 12 or 13 digits")
    .nullable(),
  release_date: z.date(),
  status: z.enum(["draft", "submitted"]),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Release = z.infer<typeof releaseSchema>;

export const releaseWithReadinessSchema = releaseSchema.extend({
  readinessSummary: z.object({
    checksPassed: z.number(),
    checksTotal: z.number(),
    ruleChecks: z.array(
      z.object({
        code: z.string(),
        message: z.string(),
        passed: z.boolean(),
      }),
    ),
  }),
});

export type ReleaseWithReadiness = z.infer<typeof releaseWithReadinessSchema>;
