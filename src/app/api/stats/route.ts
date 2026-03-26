
import { handleResult, handleApiError, withAuth } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { UserController } from '@/modules/users/adapters/controllers/UserController';

export const GET = withAuth(async ({ user }) => {
    try {
        const controller = container.resolve(UserController);
        const result = await controller.getUserStats(user.id);
        
        return handleResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});
