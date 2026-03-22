// src/app/api/notifications/route.ts
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';
import { withAuth, handleApiError, handleUserResult } from '@/lib/utils/api-utils';

/**
 * GET /api/notifications
 * Fetches notifications for the authenticated user.
 * This can be used as a non-real-time fallback.
 */
export const GET = withAuth(async ({ user }) => {
    try {
        const controller = container.resolve(UserController);
        const result = await controller.getNotifications(user.uid);

        return handleUserResult(result);

    } catch (error) {
        return handleApiError(error);
    }
});
