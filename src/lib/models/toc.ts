import { z } from 'zod';

export const TocSectionSchema = z.object({
    title: z.string(),
    sections: z.array(z.string()),
});

export type TocSection = z.infer<typeof TocSectionSchema>;