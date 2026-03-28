import { withAuth, handleApiError, handleProjectResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { ProjectController } from '@/modules/projects/adapters/controllers/ProjectController';

export const DELETE = withAuth(async ({ params }) => {
  try {
    const { id } = await params;
    const controller = container.resolve(ProjectController);
    const result = await controller.deleteSnapshot(id);
    return handleProjectResult(result);
  } catch (error) {
    return handleApiError(error);
  }
});
