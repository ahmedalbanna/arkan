
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import admin from 'firebase-admin';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { CustomFirebaseError } from '@/lib/firebase/error';

const sendNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  title: z.string().min(1, 'Title is required.'),
  body: z.string().min(1, 'Body is required.'),
  link: z.string().url().optional(),
});

export const POST = withAuth(async ({ request }) => {
  try {
    const body = await request.json();
    const validation = sendNotificationSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { userId, title, body: notificationBody, link } = validation.data;

    // Get the user's device token from Firestore
    const tokenDoc = await adminDb.collection('deviceTokens').doc(userId).get();
    if (!tokenDoc.exists) {
      return handleApiError({ message: 'User device token not found. They may not have granted notification permissions.' }, 404);
    }

    const { token } = tokenDoc.data() as { token: string };

    const message: admin.messaging.Message = {
      token: token,
      notification: {
        title,
        body: notificationBody,
      },
      webpush: {
        fcmOptions: {
          link: link || process.env.NEXT_PUBLIC_BASE_URL || '/', // Default link if not provided
        },
      },
    };

    const response = await admin.messaging().send(message);

    return createApiResponse({ messageId: response }, 200);

  } catch (error) {
    console.error('Error sending push notification:', error);
    if (error instanceof CustomFirebaseError) { // Type assertion can be done here
        if (error.code === 'messaging/registration-token-not-registered') {
             return handleApiError({ message: 'Device token is no longer valid. The user may have uninstalled the app or revoked permissions.' }, 410);
        }
    }
    return handleApiError(error);
  }
}, { requireAdmin: true });
