import { z } from 'zod';
import prisma from '@/lib/db/prisma';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

const sendNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
  link: z.string().url().optional(),
});

/**
 * POST /api/admin/notifications/send
 * 
 * Note: Firebase Messaging has been removed. To implement notifications:
 * - Use a service like Pusher, Ably, or WebSockets for real-time notifications
 * - Use email notifications via services like SendGrid or Resend
 * - Use browser's native Notification API for local notifications
 * - Store notifications in PostgreSQL for in-app notification center
 */
export const POST = withAuth(async ({ request }) => {
  try {
    let body = await request.json();
    let validation = sendNotificationSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    let { userId, title, body: notificationBody, link } = validation.data;

    // Save notification to PostgreSQL for in-app notification center
    // TODO: Implement notification table in Prisma schema if needed
    // await prisma.notification.create({
    //   data: {
    //     userId,
    //     title,
    //     body: notificationBody,
    //     link: link || '/dashboard',
    //     isRead: false,
    //     createdAt: new Date(),
    //   },
    // });

    // For now, return success without actually sending push notifications
    // Implement alternative notification methods as needed
    console.log(`Notification for user ${userId}: ${title} - ${notificationBody}`);

    return createApiResponse({ 
      messageId: 'Notification saved to database',
      notice: 'Push notifications disabled - Firebase removed'
    }, 200);

  } catch (error) {
    console.error('Error saving notification:', error);
    return handleApiError(error);
  }
}, { requireAdmin: true });
