/**
 * API Route لمسح الإشعارات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لمسح الإشعارات
 */

import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { adminRealtimeDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لمسح الإشعارات
const clearSchema = z.object({
    notificationIds: z.array(z.string()).min(1, "At least one notification ID is required."),
});

/**
 * معالج مسح الإشعارات
 */
class ClearNotificationsHandler extends ComplexApiHandler<z.infer<typeof clearSchema>, { message: string }> {
    protected inputSchema = clearSchema;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: z.infer<typeof clearSchema>, context: any) {
        const { user } = context;
        const { notificationIds } = data;

        const updates: { [key: string]: null } = {};
        notificationIds.forEach(id => {
            updates[`/notifications/${user.id}/${id}`] = null; // Setting to null deletes the key in RTDB
        });

        await adminRealtimeDb.ref().update(updates);

        return { message: 'Notifications cleared.' };
    }
}

// إنشاء المعالج
const clearNotificationsHandler = new ClearNotificationsHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    clearNotificationsHandler.handle.bind(clearNotificationsHandler),
    { logging: true }
);
