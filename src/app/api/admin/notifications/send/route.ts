import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

const sendNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
  link: z.string().url().or(z.string().startsWith('/')).optional(),
});

export const POST = withAuth(async ({ request }) => {
  try {
    let body = await request.json();
    let validation = sendNotificationSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { userId, title, body: notificationBody, link } = validation.data;
    const controller = container.resolve(UserController);
    
    await controller.sendNotification(userId, {
        title,
        description: notificationBody,
        icon: 'bell',
        link: link || '/dashboard'
    });

    return createApiResponse({ message: 'Notification sent successfully.' }, 200);

  } catch (error: any) {
    console.error('Error sending notification:', error);
    if (error.code === 'messaging/registration-token-not-registered') {
         return handleApiError({ message: 'Device token is no longer valid.' }, 410);
    }
    return handleApiError(error);
  }
}, { requireAdmin: true });
