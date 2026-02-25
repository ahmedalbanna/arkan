
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { BillingController } from '@/modules/billing/adapters/controllers/BillingController';

export const GET = withAuth(async ({ user }) => {
    try {
        const controller = container.resolve(BillingController);
        const transactions = await controller.getTransactions({ userId: user.id });
        return createApiResponse(transactions, 200);
    } catch (error) {
        return handleApiError(error);
    }
});
