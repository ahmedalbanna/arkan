/**
 * API Route لتحديد الإشعارات كمقروءة - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminRealtimeDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لتحديد الإشعارات كمقروءة
const markAsReadSchema = z.object({
    notificationIds: z.array(z.string()).min(1),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const { notificationIds } = await request.json();

        // Use the Admin SDK to interact with the Realtime Database
        const updates: { [key: string]: any } = {};
        notificationIds.forEach(id => {
            updates[`/notifications/${user.id}/${id}/isRead`] = true;
        });

        await adminRealtimeDb.ref().update(updates);

        return ApiResponse.success({ message: 'Notifications marked as read.' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return ApiResponse.error('Failed to mark notifications as read', 500);
    }
}, { validateBody: markAsReadSchema, requireAuth: true });
