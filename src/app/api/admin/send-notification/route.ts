/**
 * API Route لإرسال الإشعارات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import admin from 'firebase-admin';
import { z } from 'zod';

// Schema لإرسال الإشعارات
const sendNotificationSchema = z.object({
    userId: z.string().min(1, 'User ID is required.'),
    title: z.string().min(1, 'Title is required.'),
    body: z.string().min(1, 'Body is required.'),
    link: z.string().url().optional(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { userId, title, body: notificationBody, link } = await request.json();

        // Get the user's device token from Firestore
        const tokenDoc = await adminDb.collection('deviceTokens').doc(userId).get();
        if (!tokenDoc.exists) {
            return ApiResponse.notFound('User device token not found. They may not have granted notification permissions.');
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

        return ApiResponse.success({ messageId: response });
    } catch (error) {
        console.error('Error sending notification:', error);
        return ApiResponse.error('Failed to send notification', 500);
    }
}, { validateBody: sendNotificationSchema, requireAdmin: true });
