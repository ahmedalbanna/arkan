
import { revalidatePath } from 'next/cache';
import { withAuth, handleApiError, handleProjectResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { ProjectController } from '@/modules/projects/adapters/controllers/ProjectController';

export const GET = withAuth(async ({ user }) => {
  try {
    const controller = container.resolve(ProjectController);
    const result = await controller.getProjects(user.id);
    return handleProjectResult(result);
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const projectData = await request.json();
    const controller = container.resolve(ProjectController);
    const result = await controller.saveProject(projectData, user.id);

    if (result.isSuccess) {
      const project = result.getValue();
      revalidatePath(`/builder?id=${project.id}`);
      revalidatePath('/dashboard');
    }

    return handleProjectResult(result);
  } catch (error) {
    return handleApiError(error);
  }
});
