// src/app/api/notifications/mark-as-read/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1),
});

export const POST = withAuth(async ({ request, user }) => {
    try {
        const body = await request.json();
        const validation = markAsReadSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { notificationIds } = validation.data;
        const controller = container.resolve(UserController);
        
        await controller.markNotificationsAsRead(user.uid, notificationIds);

        return createApiResponse({ message: 'Notifications marked as read.' }, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
