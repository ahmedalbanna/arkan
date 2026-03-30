
import { z } from 'zod';
import { UserRoleSchema, SecuritySettingsSchema } from './UserSchema';

export const userUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Invalid email address').optional(),
    bio: z.string().optional(),
    hasCompletedOnboarding: z.boolean().optional(),
    apiKeys: z.record(z.string()).optional(),
    securitySettings: SecuritySettingsSchema.optional(),
});

export const adminUpdateUserSchema = userUpdateSchema.extend({
    credits: z.coerce.number().int().min(0).optional(),
    role: UserRoleSchema.optional(),
    isDisabled: z.boolean().optional(),
});

export const userStatsSchema = z.object({
    totalProjects: z.number(),
    totalGenerations: z.number(),
    remainingCredits: z.number(),
    lastActivity: z.string(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type UserStatsType = z.infer<typeof userStatsSchema>;
