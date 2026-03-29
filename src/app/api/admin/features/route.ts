'use server';

import { handleApiError, withAuth, handleAdminResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { AdminController } from '@/modules/admin/adapters/controllers/AdminController';

export const GET = withAuth(async () => {
  try {
    const controller = container.resolve(AdminController);
    const result = await controller.getFeatures();
    return handleAdminResult(result);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
