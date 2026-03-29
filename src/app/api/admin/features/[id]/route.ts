
import { z } from 'zod';
import { handleApiError, withAuth, handleAdminResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AdminController } from '@/modules/admin/adapters/controllers/AdminController';

const updateFeatureSchema = z.object({
  isEnabled: z.boolean(),
});

export const PUT = withAuth(async ({ request, params }) => {
  try {
    const { id } = await params;
    if (!id) {
      return handleApiError({ message: 'Feature ID is required.' }, 400);
    }

    const body = await request.json();
    const validation = updateFeatureSchema.safeParse(body);

    if (!validation.success) {
      return handleApiError(validation.error);
    }

    const controller = container.resolve(AdminController);
    const result = await controller.updateFeature(id, validation.data);

    return handleAdminResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
