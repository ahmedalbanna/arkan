
import { withAuth, handleApiError, handleProjectResult } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { ProjectController } from '@/modules/projects/adapters/controllers/ProjectController';

export const GET = withAuth(async ({ params }) => {
  try {
    const { id } = await params;
    const controller = container.resolve(ProjectController);
    const result = await controller.getProjectById(id);
    return handleProjectResult(result);
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withAuth(async ({ params }) => {
  try {
    const { id } = await params;
    const controller = container.resolve(ProjectController);
    const result = await controller.deleteProject(id);
    return handleProjectResult(result);
  } catch (error) {
    return handleApiError(error);
  }
});
