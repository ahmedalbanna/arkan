
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { getProject, deleteProject } from '@/services/projectService';

export const GET = withAuth(async ({ params }) => {
  try {
    const project = await getProject(params.id);
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
    await deleteProject(params.id);
    return createApiResponse({ message: 'Project deleted successfully.' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
