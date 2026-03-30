import { z } from 'zod';

/**
 * Schema for sending a single notification
 */
export const sendNotificationSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    icon: z.enum(['credit-card', 'bot', 'file-text', 'user-plus', 'default', 'gem']).default('default'),
    link: z.string().optional(),
});

/**
 * Schema for batch notifications
 */
export const sendBatchNotificationSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    icon: z.enum(['credit-card', 'bot', 'file-text', 'user-plus', 'default', 'gem']).default('default'),
    link: z.string().optional(),
});

/**
 * Schema for scheduling a notification
 */
export const scheduleNotificationSchema = sendNotificationSchema.extend({
    scheduledFor: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
});

/**
 * Schema for gifting credits
 */
export const giftCreditsSchema = z.object({
    userId: z.string().min(1, 'User ID is required.'),
    credits: z.coerce.number().int().positive('Credits must be a positive number.'),
    message: z.string().optional(),
});

// Inferred types
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type SendBatchNotificationInput = z.infer<typeof sendBatchNotificationSchema>;
export type ScheduleNotificationInput = z.infer<typeof scheduleNotificationSchema>;
export type GiftCreditsInput = z.infer<typeof giftCreditsSchema>;
