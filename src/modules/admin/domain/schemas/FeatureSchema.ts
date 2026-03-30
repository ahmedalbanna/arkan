
import { z } from 'zod';

export const FeatureSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string(),
    isEnabled: z.boolean(),
    category: z.string().optional(),
    updatedAt: z.string().datetime().optional(),
});

export const UpdateFeatureSchema = FeatureSchema.partial().extend({
    id: z.string()
});

export type UpdateFeatureInput = z.infer<typeof UpdateFeatureSchema>;
