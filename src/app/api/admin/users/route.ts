
import { getPaginatedUsers } from '@/lib/db/queries';
import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const userListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  lastVisibleId: z.string().optional(),
});

export const GET = withAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = userListQuerySchema.safeParse(Object.fromEntries(searchParams));
    
    if (!queryValidation.success) {
      return handleApiError(queryValidation.error);
    }
  
    const { limit, lastVisibleId } = queryValidation.data;
    const results = await getPaginatedUsers({ limit, lastVisibleId });
    return createApiResponse(results, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
