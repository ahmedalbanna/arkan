
// src/app/api/user-transactions/route.ts
import { getTransactionsByUserId } from '@/lib/db/queries';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

export const GET = withAuth(async ({ user }) => {
    try {
        const transactions = await getTransactionsByUserId(user.id);
        return createApiResponse(transactions, 200);
    } catch (error) {
        return handleApiError(error);
    }
});
