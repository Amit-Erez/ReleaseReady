import { z } from 'zod';

export const createReleaseSchema = z.object({
  artist_name: z.string().min(1, 'Artist name is required'),
  title: z.string().min(1).nullable().optional(),
  upc: z.string().regex(/^\d{12,13}$/, 'UPC must be 12 or 13 digits').nullable().optional(),
  release_date: z.string().date('Release date must be a valid date (YYYY-MM-DD)'),
});

export type CreateReleaseInput = z.infer<typeof createReleaseSchema>;
