import { withAuth, handleApiError, handleUserResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

export const GET = withAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const controller = container.resolve(UserController);
    const result = await controller.getScheduledNotifications({ status, limit });

    return handleUserResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });

export const DELETE = withAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return handleApiError({ message: "Missing ID" }, 400);
    }

    const controller = container.resolve(UserController);
    const result = await controller.cancelScheduledNotification(id);

    return handleUserResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
