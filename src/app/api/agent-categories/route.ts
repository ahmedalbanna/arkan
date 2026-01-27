import { listDocs } from '@/lib/firebase/db-helpers';
import { handleApiError, createApiResponse, withAuth } from '@/lib/utils/api-utils';

export const GET = withAuth(async () => {
  try {
    const categories = await listDocs('agent_categories', {
      orderBy: { field: 'name', direction: 'asc' },
    });
    return createApiResponse(categories, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
