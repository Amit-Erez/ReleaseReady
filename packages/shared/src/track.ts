import { z } from "zod";

export const trackSchema = z.object({
  id: z.number(),
  release_id: z.number(),
  title: z.string(),
  track_number: z.number().int().positive(),
  isrc: z
    .string()
    .regex(/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/, "Invalid ISRC code")
    .nullable(),
});

export type Track = z.infer<typeof trackSchema>;

export const trackWithSplitsSchema = trackSchema.extend({
  splitsTotal: z.number(),
});

export type TrackWithSplits = z.infer<typeof trackWithSplitsSchema>;

export const createTrackSchema = z.object({
  title: z.string().min(1),
  track_number: z.number().int().positive(),
  isrc: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? null : val),
    z
      .string()
      .regex(/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/, "Invalid ISRC code")
      .nullable()
      .optional(),
  ),
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>;
