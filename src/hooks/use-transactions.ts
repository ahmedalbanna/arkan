
'use client';

import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { transactionKeys, userKeys } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { toast } from '@/hooks';
import { getTransactions as getTransactionsApi, verifyPayment as verifyPaymentApi } from '@/services';
import { TransactionStatus } from '@/services';
import { useEffect } from 'react';


export interface VerifyPaymentVariables {
    transactionId: string;
    userId: string;
    creditsToGrant: number;
    status: 'verified' | 'rejected';
    adminNotes?: string;
}

const TRANSACTIONS_PER_PAGE = 6;


export function useTransactions(status: TransactionStatus) {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    const queryInfo = useInfiniteQuery({
        queryKey: transactionKeys.list(status),
        queryFn: ({ pageParam }) => getTransactionsApi({ status, limit: TRANSACTIONS_PER_PAGE, lastVisibleId: pageParam, token: firebaseUser!.getIdToken() }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            if (!lastPage.hasNextPage) return undefined;
            const lastTransaction = lastPage.transactions[lastPage.transactions.length - 1];
            return lastTransaction?.id;
        },
        enabled: !!firebaseUser,
        staleTime: 1000 * 60, // 1 minute
    });

     useEffect(() => {
        // Invalidate other tabs when this one becomes active to refetch data
        queryClient.invalidateQueries({ queryKey: transactionKeys.list(status) });
    }, [status, queryClient]);

    return queryInfo;
}

/**
 * Custom mutation hook to verify or reject a payment transaction.
 * Requires admin privileges. Handles API calls and cache invalidation.
 *
 * @returns The result of the useMutation hook.
 */
export function useVerifyPayment() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, VerifyPaymentVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return verifyPaymentApi(variables, token);
        },
        onSuccess: (data, variables) => {
            // Invalidate queries to refetch data after verification
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });

            toast({
                title: 'Success',
                description: `Transaction has been ${variables.status}.`,
            });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, 'Verification Failed');
        }
    });
}
