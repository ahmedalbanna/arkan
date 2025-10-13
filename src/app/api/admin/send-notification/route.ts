/**
 * API Route لإرسال الإشعارات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإرسال الإشعارات
 */

import { ComplexApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
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

/**
 * معالج إرسال الإشعارات
 */
class SendNotificationHandler extends ComplexApiHandler<z.infer<typeof sendNotificationSchema>, {
    messageId: string;
}> {
    protected inputSchema = sendNotificationSchema;
    protected requiresAdmin = true;
    protected creditCost = 1;

    protected async processRequest(data: z.infer<typeof sendNotificationSchema>) {
        const { userId, title, body: notificationBody, link } = data;

        // Get the user's device token from Firestore
        const tokenDoc = await adminDb.collection('deviceTokens').doc(userId).get();
        if (!tokenDoc.exists) {
            throw new Error('User device token not found. They may not have granted notification permissions.');
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

        return { messageId: response };
    }
}

// إنشاء المعالج
const sendNotificationHandler = new SendNotificationHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    sendNotificationHandler,
    { requireAdmin: true, logging: true }
);
