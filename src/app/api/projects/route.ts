

import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { getProjects, saveProject } from '@/services/projectService';

export const GET = withAuth(async ({ user }) => {
  try {
    const projects = await getProjects(user.id);
    return createApiResponse(projects, 200);
  } catch (error) {
    return handleApiError(error);
  }
});

export const POST = withAuth(async ({ request, user }) => {
  try {
    const projectData = await request.json();
    // Ensure the author is the currently authenticated user
    const dataToSave = {
      ...projectData,
      meta: {
        ...projectData.meta,
        author: user.id,
      }
    };
    const savedProject = await saveProject(dataToSave);
    return createApiResponse(savedProject, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
