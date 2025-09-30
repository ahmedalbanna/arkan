/**
 * API Route لتحديد الإشعارات كمقروءة - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتحديد الإشعارات كمقروءة
 */

import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { adminRealtimeDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لتحديد الإشعارات كمقروءة
const markAsReadSchema = z.object({
    notificationIds: z.array(z.string()).min(1),
});

/**
 * معالج تحديد الإشعارات كمقروءة
 */
class MarkAsReadHandler extends ComplexApiHandler<z.infer<typeof markAsReadSchema>, { message: string }> {
    protected inputSchema = markAsReadSchema;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: z.infer<typeof markAsReadSchema>, context: any) {
        const { user } = context;
        const { notificationIds } = data;

        // Use the Admin SDK to interact with the Realtime Database
        const updates: { [key: string]: any } = {};
        notificationIds.forEach(id => {
            updates[`/notifications/${user.id}/${id}/isRead`] = true;
        });

        await adminRealtimeDb.ref().update(updates);

        return { message: 'Notifications marked as read.' };
    }
}

// إنشاء المعالج
const markAsReadHandler = new MarkAsReadHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    markAsReadHandler.handle.bind(markAsReadHandler),
    { logging: true }
);
