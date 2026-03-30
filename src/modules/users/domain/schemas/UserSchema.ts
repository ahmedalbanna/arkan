
import { z } from 'zod';

export const SecuritySettingsSchema = z.object({
    enableLoginAlerts: z.boolean().default(true)
});

export const UserRoleSchema = z.enum(['admin', 'user']);

export const UserProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    credits: z.number().int().min(0).optional(),
    role: UserRoleSchema,
    createdAt: z.string().datetime('Invalid date format'),
    updatedAt: z.string().datetime('Invalid date format'),
    bio: z.string().optional(),
    profilePictureUrl: z.string().optional(),
    hasCompletedOnboarding: z.boolean().optional(),
    apiKeys: z.record(z.string()).optional(),
    lastDailyCreditUpdate: z.string().datetime('Invalid date format').optional(),
    securitySettings: SecuritySettingsSchema.optional(),
    isDisabled: z.boolean().optional(),
    isTwoFactorEnabled: z.boolean().optional(),
    twoFactorSecret: z.string().optional(),
    tokenVersion: z.number().int().optional(),
});

export const UserPropertiesSchema = UserProfileSchema.partial().extend({
    id: z.string().optional()
});

export type UserProfileType = z.infer<typeof UserProfileSchema>;
export type UserPropertiesType = z.infer<typeof UserPropertiesSchema>;
export type SecuritySettingsType = z.infer<typeof SecuritySettingsSchema>;
