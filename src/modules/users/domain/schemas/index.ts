import { z } from 'zod';

/**
 * Shared API request/response schemas for validation across routes.
 */

export * from './AuthSchemas';
export * from './ProfileSchemas';
export * from './NotificationSchemas';

// Template schemas (Moved from AI/Content for now as users manage them)
export const createDocxTemplateSchema = z.object({
    id: z.string().min(3).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    description: z.string().min(1),
});

export const createPptxTemplateSchema = z.object({
    id: z.string().min(3).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    description: z.string().min(1),
});

export type CreateDocxTemplateInput = z.infer<typeof createDocxTemplateSchema>;
export type CreatePptxTemplateInput = z.infer<typeof createPptxTemplateSchema>;
