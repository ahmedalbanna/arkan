
// src/app/api/admin/transactions/route.ts
import { getTransactionsByStatus, getTransactionsByDateRange } from '@/lib/db/queries';
import { z } from 'zod';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const getTransactionsSchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(6).optional(),
  lastVisibleId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const GET = withAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = getTransactionsSchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return handleApiError(queryValidation.error);
    }

    const { limit, lastVisibleId, status, startDate, endDate } = queryValidation.data;

    // Handle report generation request
    if (startDate && endDate) {
        const transactions = await getTransactionsByDateRange(startDate, endDate);
        return createApiResponse(transactions, 200);
    }
    
    // Handle status-based fetching for the console
    if (status) {
        const { transactions, hasNextPage, lastVisibleId: newLastVisibleId } = await getTransactionsByStatus({ status, limit: limit!, lastVisibleId });
        return createApiResponse({ transactions, hasNextPage, lastVisibleId: newLastVisibleId }, 200);
    }
    
    return handleApiError({ message: 'Missing required parameters. Provide either status or both startDate and endDate.' }, 400);

  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
