// src/app/api/notifications/mark-as-read/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { withAuth, handleApiError, createApiResponse } from '@/infrastructure/api/api-utils';

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1),
});

import { handleUserResult } from '@/infrastructure/api/api-utils';

export const POST = withAuth(async ({ request, user }) => {
    try {
        const body = await request.json();
        const validation = markAsReadSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { notificationIds } = validation.data;
        const controller = container.resolve(UserController);
        
        const result = await controller.markNotificationsAsRead(user.uid, notificationIds);

        return handleUserResult(result);

    } catch (error) {
        return handleApiError(error);
    }
});
