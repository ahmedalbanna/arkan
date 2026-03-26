
import { createApiResponse, handleApiError } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AdminController } from '@/modules/admin/adapters/controllers/AdminController';

export async function GET() {
    try {
        const controller = container.resolve(AdminController);
        const features = await controller.getFeatures();

        return createApiResponse(features, 200);
    } catch (error) {
        return handleApiError(error);
    }
}
