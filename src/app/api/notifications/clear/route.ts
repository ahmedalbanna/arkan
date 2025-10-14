/**
 * API Route لمسح الإشعارات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminRealtimeDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لمسح الإشعارات
const clearSchema = z.object({
    notificationIds: z.array(z.string()).min(1, "At least one notification ID is required."),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { notificationIds } = await request.json();

        const updates: { [key: string]: null } = {};
        notificationIds.forEach(id => {
            updates[`/notifications/${user.id}/${id}`] = null; // Setting to null deletes the key in RTDB
        });

        await adminRealtimeDb.ref().update(updates);

        return ApiResponse.success({ message: 'Notifications cleared.' });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        return ApiResponse.error('Failed to clear notifications', 500);
    }
}, { validateBody: clearSchema, requireAuth: true });
