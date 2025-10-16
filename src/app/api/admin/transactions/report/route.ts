
import { getTransactionsByDateRange } from '@/lib/db/queries';
import { z } from 'zod';
import { handleApiError, withAuth, createApiResponse } from '@/lib/api-utils';

const getReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const GET = withAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = getReportSchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return handleApiError(queryValidation.error);
    }

    const { startDate, endDate } = queryValidation.data;
    const transactions = await getTransactionsByDateRange(startDate, endDate);
    return createApiResponse(transactions, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
