
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

export const GET = withAuth(async ({ user }) => {
    try {
        const controller = container.resolve(UserController);
        const stats = await controller.getUserStats(user.id);
        
        return createApiResponse(stats, 200);
    } catch (error) {
        return handleApiError(error);
    }
});
