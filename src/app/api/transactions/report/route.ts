
import { getTransactionsByDateRange } from '@/lib/db/queries';
import { z } from 'zod';

const getReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const GET = withEnhancedAuth(async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const queryValidation = getReportSchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return handleApiErrorEnhanced(queryValidation.error);
    }

    const { startDate, endDate } = queryValidation.data;
    const transactions = await getTransactionsByDateRange(startDate, endDate);
    return createApiResponseEnhanced(transactions, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
}, { requireAdmin: true });
