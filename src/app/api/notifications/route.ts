// src/app/api/notifications/route.ts
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

/**
 * GET /api/notifications
 * Fetches notifications for the authenticated user.
 * This can be used as a non-real-time fallback.
 */
export const GET = withAuth(async ({ user }) => {
    try {
        const controller = container.resolve(UserController);
        const notifications = await controller.getNotifications(user.uid);

        return createApiResponse(notifications, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
