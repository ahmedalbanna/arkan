// This file was moved from /api/transactions/route.ts

import { getTransactionsByStatus } from '@/lib/db/queries';
import { z } from 'zod';
import { handleApiError, withAuth, createApiResponse } from '@/lib/api-utils';

const getTransactionsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(6),
  lastVisibleId: z.string().optional(),
  status: z.enum(['pending', 'verified', 'rejected']).default('pending'),
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
