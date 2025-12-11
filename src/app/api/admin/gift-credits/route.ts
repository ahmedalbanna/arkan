
'use server';

import { z } from 'zod';
import { adminDb, adminRealtimeDb, adminAuth } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { FieldValue } from 'firebase-admin/firestore';
import { getUserProfile } from '@/lib/db/queries';

const giftCreditsSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  credits: z.coerce.number().int().positive('Credits must be a positive number.'),
  message: z.string().optional(),
});

export const POST = withAuth(async ({ request, user: adminUser }) => {
  try {
    const body = await request.json();
    const validation = giftCreditsSchema.safeParse(body);
    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const { userId, credits, message } = validation.data;

    // Get the user's profile to ensure they exist
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return handleApiError({ message: 'User not found.' }, 404);
    }
    
    // Add credits to user's account
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
        credits: FieldValue.increment(credits)
    });
    
    // Send notification
    const rtdb = adminRealtimeDb;
    const notificationRef = rtdb.ref(`notifications/${userId}`).push();
    const notificationPayload = {
      title: "🎁 You've received a gift!",
      description: message ? `Admin ${adminUser.name} sent you ${credits} credits with a message: "${message}"` : `An admin has sent you ${credits} credits!`,
      icon: "gem",
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/profile'
    };
    await notificationRef.set(notificationPayload);
    
    // Try to send a push notification if the user has a device token
    const tokenDoc = await adminDb.collection('deviceTokens').doc(userId).get();
    if (tokenDoc.exists) {
        const { token } = tokenDoc.data() as { token: string };
        const pushMessage = {
            token: token,
            notification: {
                title: notificationPayload.title,
                body: `You received ${credits} credits from an admin.`,
            },
            webpush: {
                fcmOptions: {
                    link: '/profile',
                },
            },
        };
        try {
            await adminAuth.app.messaging().send(pushMessage);
        } catch (pushError) {
            console.warn(`Failed to send push notification to user ${userId}, but credits were added.`, pushError);
        }
    }


    return createApiResponse({ message: `Successfully gifted ${credits} credits to ${userProfile.name}.` }, 200);

  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
