
// src/app/api/user-transactions/route.ts
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { getTransactionsByUserId } from '@/services/transactionService';

export const GET = withAuth(async ({ user }) => {
    try {
        const transactions = await getTransactionsByUserId(user.id);
        return createApiResponse(transactions, 200);
    } catch (error) {
        return handleApiError(error);
    }
});
