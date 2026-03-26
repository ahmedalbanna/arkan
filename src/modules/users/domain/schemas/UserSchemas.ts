import { z } from 'zod';

/**
 * Shared API request/response schemas for validation across routes.
 */

// User schemas
export const adminUpdateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    bio: z.string().optional(),
    credits: z.coerce.number().int().min(0).optional(),
    role: z.enum(['user', 'admin']).optional(),
    hasCompletedOnboarding: z.boolean().optional(),
    apiKeys: z.record(z.string()).optional(),
});

export const userUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    bio: z.string().optional(),
    hasCompletedOnboarding: z.boolean().optional(),
    apiKeys: z.record(z.string()).optional(),
});

// Template schemas
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

// Export types for use in components
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type CreateDocxTemplateInput = z.infer<typeof createDocxTemplateSchema>;
export type CreatePptxTemplateInput = z.infer<typeof createPptxTemplateSchema>;
