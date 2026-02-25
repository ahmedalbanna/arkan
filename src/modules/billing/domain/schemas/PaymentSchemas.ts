import { z } from 'zod';

export const fileSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, 'File is required')
    .refine((file) => file.size < 10 * 1024 * 1024, 'File size must be less than 10MB'),
});
