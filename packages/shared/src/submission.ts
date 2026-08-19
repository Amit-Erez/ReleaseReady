import { z } from "zod";

export const submissionSchema = z.object({
  id: z.number(),
  release_id: z.number(),
  submitted_at: z.date(),
});

export type Submission = z.infer<typeof submissionSchema>;
