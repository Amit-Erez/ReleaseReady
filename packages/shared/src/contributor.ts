import { z } from "zod";

export const contributorSchema = z.object({
  id: z.number(),
  name: z.string(),
  default_role: z.enum(["composer", "producer", "arranger", "lyricist"]),
  created_at: z.date(),
});

export type Contributor = z.infer<typeof contributorSchema>;

export const createContributorSchema = z.object({
  name: z.string().min(1).max(60),
  default_role: z.enum(["composer", "producer", "arranger", "lyricist"]),
});

export type CreateContributorInput = z.infer<typeof createContributorSchema>;
