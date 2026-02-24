
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { ProjectController } from '@/modules/projects/adapters/controllers/ProjectController';

export const GET = withAuth(async ({ user }) => {
  try {
    const controller = container.resolve(ProjectController);
    const projects = await controller.getProjects(user.id);
    return createApiResponse(projects, 200);
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const projectData = await request.json();
    const controller = container.resolve(ProjectController);
    const savedProject = await controller.saveProject(projectData, user.id);
    return createApiResponse(savedProject, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
