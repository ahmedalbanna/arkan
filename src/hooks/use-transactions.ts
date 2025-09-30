
'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { transactionKeys } from '@/lib/core/query-keys';
import { Transaction, type TransactionProperties } from '@/lib/models/transaction';
import { fetchUserTransactions as fetchUserTransactionsApi, getTransactions as getTransactionsApi, TransactionStatus } from '@/services';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';


interface TransactionsPage {
    transactions: Transaction[];
    hasNextPage: boolean;
}

const TRANSACTIONS_PER_PAGE = 6;

/**
 * Fetches a paginated list of transactions based on their status.
 * Used primarily for the admin payment verification console.
 * Returns instances of the Transaction CLASS.
 * @param status The status of transactions to fetch ('pending', 'verified', 'rejected').
 */
export function useTransactions(status: TransactionStatus) {
    const { firebaseUser } = useAuth();
    const queryKey = transactionKeys.list(status);

    return useInfiniteQuery<TransactionsPage>({
        queryKey: queryKey,
        queryFn: async ({ pageParam }) => {
            if (!firebaseUser) throw new Error("User not authenticated.");
            const token = await firebaseUser.getIdToken();
            const result = await getTransactionsApi({ status, limit: TRANSACTIONS_PER_PAGE, lastVisibleId: pageParam as string | undefined, token });
            // Transform plain objects to Transaction instances
            return {
                ...result,
                transactions: result.transactions.map(t => new Transaction(t as TransactionProperties))
            };
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.transactions[lastPage.transactions.length - 1]?.id : undefined,
        enabled: !!firebaseUser,
        staleTime: 1000 * 60, // 1 minute
    });
}


/**
 * Fetches the payment transaction history for the currently authenticated user.
 * Returns instances of the Transaction CLASS.
 */
export function useUserTransactions() {
    const { firebaseUser } = useAuth();
    const queryKey = transactionKeys.list(firebaseUser?.uid || 'user');

    return useQuery<Transaction[]>({
        queryKey: queryKey,
        queryFn: async () => {
            const token = await getAuthenticatedToken(firebaseUser);
            const data = await fetchUserTransactionsApi(token);
            // Transform plain objects to Transaction instances
            return data.map(t => new Transaction(t as TransactionProperties));
        },
        enabled: !!firebaseUser,
    });
}
