// src/app/api/user-transactions/route.ts
import { getTransactionsByUserId } from '@/services/transactionService';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

export const GET = withAuth(async ({ user }) => {
    try {
        let transactions = await getTransactionsByUserId(user.id);
        return createApiResponse(transactions, 200);
    } catch (error) {
        return handleApiError(error);
    }
});
