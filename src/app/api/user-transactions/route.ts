
import { withAuth, handleApiError, handleBillingResult } from '@/infrastructure/api/api-utils';
import { container } from '@/infrastructure/di/container';
import { BillingController } from '@/modules/billing/adapters/controllers/BillingController';

export const GET = withAuth(async ({ user }) => {
    try {
        const controller = container.resolve(BillingController);
        const result = await controller.getTransactions({ userId: user.id });
        return handleBillingResult(result);
    } catch (error) {
        return handleApiError(error);
    }
});
