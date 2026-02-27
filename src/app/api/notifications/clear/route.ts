// src/app/api/notifications/clear/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

const clearSchema = z.object({
  notificationIds: z.array(z.string()).min(1, "At least one notification ID is required."),
});


export const POST = withAuth(async ({ request, user }) => {
    try {
        const body = await request.json();
        const validation = clearSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { notificationIds } = validation.data;
        const controller = container.resolve(UserController);
        
        await controller.clearNotifications(user.uid, notificationIds);

        return createApiResponse({ message: 'Notifications cleared.' }, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
