
import { z } from 'zod';
import { handleApiError, withAuth, createApiResponse } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { BillingController } from '@/modules/billing/adapters/controllers/BillingController';

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
    const controller = container.resolve(BillingController);
    const transactions = await controller.getTransactions({ startDate, endDate });
    return createApiResponse(transactions, 200);
  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
