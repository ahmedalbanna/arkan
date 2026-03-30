import { z } from 'zod';

/**
 * Standard User Profile Update Schema
 */
export const userUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    bio: z.string().optional(),
    hasCompletedOnboarding: z.boolean().optional(),
    apiKeys: z.record(z.string()).optional(),
    securitySettings: z.object({
        enableLoginAlerts: z.boolean()
    }).optional(),
});

/**
 * Administrative User Update Schema
 */
export const adminUpdateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    bio: z.string().optional(),
    credits: z.coerce.number().int().min(0).optional(),
    role: z.enum(['user', 'admin']).optional(),
    hasCompletedOnboarding: z.boolean().optional(),
    apiKeys: z.record(z.string()).optional(),
    isDisabled: z.boolean().optional(),
    securitySettings: z.object({
        enableLoginAlerts: z.boolean()
    }).optional(),
});

/**
 * User Statistics Schema (Read-only)
 */
export const userStatsSchema = z.object({
    totalProjects: z.number(),
    totalGenerations: z.number(),
    remainingCredits: z.number(),
    lastActivity: z.string(),
});

// Inferred types
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
