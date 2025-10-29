// src/app/api/admin/transactions/route.ts
import { getTransactionsByStatus } from '@/lib/db/queries';
import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

const getTransactionsSchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected']),
  limit: z.coerce.number().int().min(1).max(50).default(6),
  lastVisibleId: z.string().optional(),
});

export const GET = withAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = getTransactionsSchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return handleApiError(queryValidation.error);
    }

    const { limit, lastVisibleId, status } = queryValidation.data;

    const { transactions, hasNextPage, lastVisibleId: newLastVisibleId } = await getTransactionsByStatus({ status, limit, lastVisibleId });
    return createApiResponse({ transactions, hasNextPage, lastVisibleId: newLastVisibleId }, 200);

  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
