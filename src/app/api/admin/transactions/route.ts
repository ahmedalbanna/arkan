
import { z } from 'zod';
import { withAuth, handleApiError, handleBillingResult } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { BillingController } from '@/modules/billing/adapters/controllers/BillingController';

const getTransactionsSchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
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

    const controller = container.resolve(BillingController);
    const result = await controller.getTransactions({ status, limit, lastVisibleId });
    return handleBillingResult(result);

  } catch (error) {
    return handleApiError(error);
  }
}, { requireAdmin: true });
