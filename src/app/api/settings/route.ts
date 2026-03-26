
import { createApiResponse, handleApiError } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AdminController } from '@/modules/admin/adapters/controllers/AdminController';

// GET /api/settings - This endpoint is public for fetching bank details etc.
export async function GET() {
    try {
        const controller = container.resolve(AdminController);
        const settings = await controller.getSettings();
        return createApiResponse(settings, 200);
    } catch (error) {
        return handleApiError(error);
    }
}
