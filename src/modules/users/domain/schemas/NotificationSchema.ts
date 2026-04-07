
import { z } from 'zod';

export const NotificationIconSchema = z.enum(['credit-card', 'bot', 'file-text', 'user-plus', 'default', 'gem', 'bell']).default('default');

export const NotificationPropertiesSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: NotificationIconSchema,
  isRead: z.boolean().default(false),
  createdAt: z.string().datetime('Invalid date format'),
  link: z.string().optional(),
});

export const sendNotificationSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    icon: NotificationIconSchema,
    link: z.string().optional(),
});

export const sendBatchNotificationSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    icon: NotificationIconSchema,
    link: z.string().optional(),
});

export const scheduleNotificationSchema = sendNotificationSchema.extend({
    scheduledFor: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
});

export const giftCreditsSchema = z.object({
    userId: z.string().min(1, 'User ID is required.'),
    credits: z.coerce.number().int().positive('Credits must be a positive number.'),
    message: z.string().optional(),
});

export type NotificationPropertiesType = z.infer<typeof NotificationPropertiesSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type SendBatchNotificationInput = z.infer<typeof sendBatchNotificationSchema>;
export type ScheduleNotificationInput = z.infer<typeof scheduleNotificationSchema>;
export type GiftCreditsInput = z.infer<typeof giftCreditsSchema>;
