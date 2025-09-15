
'use client';

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { getTransactions as getTransactionsApi, verifyPayment as verifyPaymentApi, fetchUserTransactions as fetchUserTransactionsApi } from '@/services';
import { transactionKeys, userKeys } from '@/lib/query-keys';
import { TransactionStatus, type TransactionData, VerifyPaymentVariables } from '@/services';
import { Transaction, type TransactionProperties } from '@/lib/models/transaction';


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

    return useInfiniteQuery({
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

/**
 * Custom mutation hook for an admin to verify or reject a payment transaction.
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
            toast({
                title: "Transaction Updated",
                description: `Transaction has been marked as ${variables.status}.`,
            });
            // Invalidate all transaction lists to ensure UI updates across all tabs
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            // Invalidate the specific user's profile to update their credit count
            queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });
        },
        onError: (error) => {
            handleErrorUtility(error, "Payment verification failed");
        }
    });
}
