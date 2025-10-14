/**
 * API Route للإشعارات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = createApiHandler(async (context) => {
    try {
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

        return ApiResponse.success(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return ApiResponse.error('Failed to fetch notifications', 500);
    }
}, { requireAuth: true });
