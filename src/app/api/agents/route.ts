
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { getEnabledAgents } from '@/lib/data/agents';

// GET all enabled agents
export const GET = withAuth(async ({ user }) => {
  try {
    const agents = await getEnabledAgents();
    return createApiResponse(agents, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
