
import { withAuth, handleApiError, createApiResponse } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AdminController } from '@/modules/admin/adapters/controllers/AdminController';

export const GET = withAuth(async () => {
    try {
        const controller = container.resolve(AdminController);
        const stats = await controller.getDashboardStats();
        return createApiResponse(stats, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
