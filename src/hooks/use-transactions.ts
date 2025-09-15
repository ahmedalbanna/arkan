
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { transactionKeys } from '@/lib/query-keys';
import { getTransactions as getTransactionsApi } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { TransactionStatus, type TransactionData } from '@/services';
import { Transaction, type TransactionProperties } from '@/lib/models/transaction';


const TRANSACTIONS_PER_PAGE = 6;

// Define the shape of the API response
interface TransactionsPage {
    transactions: TransactionData[],
    hasNextPage: boolean,
    lastVisibleId?: string | null;
};

export function useTransactions(status: TransactionStatus) {
    const { firebaseUser } = useAuth();

    // The queryKey now includes the status, so React Query will automatically
    // manage separate caches and refetch when the status changes.
    const queryKey = transactionKeys.list(status);

    const queryInfo = useInfiniteQuery({
        queryKey: queryKey,
        queryFn: async ({ pageParam }) => {
            if (!firebaseUser) throw new Error("User not authenticated.");
            const token = await firebaseUser.getIdToken();
            return getTransactionsApi({ status, limit: TRANSACTIONS_PER_PAGE, lastVisibleId: pageParam as string | undefined, token });
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => {
            if (!lastPage.hasNextPage) return undefined;
            const lastTransaction = lastPage.transactions[lastPage.transactions.length - 1];
            return lastTransaction?.id;
        },
        enabled: !!firebaseUser,
        staleTime: 1000 * 60, // 1 minute
        select: (data) => ({
            ...data,
            pages: data.pages.map(page => ({
                ...page,
                transactions: page.transactions.map(t => new Transaction(t as TransactionProperties))
            }))
        })
    });

    return queryInfo;
}
