
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { ProjectController } from '@/modules/projects/adapters/controllers/ProjectController';

export const GET = withAuth(async ({ params }) => {
  try {
    const { id } = await params;
    const controller = container.resolve(ProjectController);
    const project = await controller.getProjectById(id);
    if (!project) {
      return handleApiError({ message: 'Project not found.' }, 404);
    }
    return createApiResponse(project, 200);
  } catch (error) {
    return handleApiError(error);
  }
});

export const DELETE = withAuth(async ({ params }) => {
  try {
    const { id } = await params;
    const controller = container.resolve(ProjectController);
    await controller.deleteProject(id);
    return createApiResponse({ message: 'Project deleted successfully.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
