import { z } from "zod";

export const trackContributorSchema = z.object({
  track_id: z.number(),
  contributor_id: z.number(),
  role: z.enum(["composer", "producer", "arranger", "lyricist"]),
  split_percent: z.number().gt(0).lte(100),
});

export type TrackContributor = z.infer<typeof trackContributorSchema>;

export const createTrackContributorSchema = z.object({
  contributor_id: z.number(),
  role: z.enum(["composer", "producer", "arranger", "lyricist"]),
  split_percent: z.number().gt(0).lte(100),
});

export type CreateTrackContributorInput = z.infer<typeof createTrackContributorSchema>;

export const replaceTrackContributorsSchema = z.array(createTrackContributorSchema);
export type ReplaceTrackContributorsInput = z.infer<typeof replaceTrackContributorsSchema>;