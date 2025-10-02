/**
 * API Route للإشعارات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للإشعارات
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج قائمة الإشعارات
 */
class NotificationsListHandler extends SimpleApiHandler<Array<{
    id: string;
    [key: string]: any;
}>> {
    protected async processRequest(context: any) {
        const { user } = context;

        // هذا استعلام Firestore. التطبيق يستخدم الآن RTDB للإشعارات.
        // هذا الـ endpoint يحتاج إلى تحديث لاستخدام RTDB admin SDK إذا كان سيتم استخدامه.
        const snapshot = await adminDb.collection('notifications')
            .where('userId', '==', user.id)
            .where('isRead', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return notifications;
    }
}

// إنشاء المعالج
const notificationsListHandler = new NotificationsListHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    notificationsListHandler.handle.bind(notificationsListHandler),
    {
        logging: true
    }
);
