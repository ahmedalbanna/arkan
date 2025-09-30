
// src/app/api/user-transactions/route.ts
import { getTransactionsByUserId } from '@/lib/db/queries';

export const GET = withEnhancedAuth(async ({ user }) => {
    try {
        const transactions = await getTransactionsByUserId(user.id);
        return createApiResponseEnhanced(transactions, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
});
