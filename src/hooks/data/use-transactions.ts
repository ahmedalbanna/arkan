
'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { transactionKeys } from '@/lib/query-keys';
import { getTransactions, verifyPayment } from '@/services/transaction-service';
import { toast } from '@/hooks/util/use-toast';
import { Transaction } from '@/lib/models/transaction';

export type TransactionStatus = 'pending' | 'verified' | 'rejected';

export interface VerifyPaymentVariables {
  transactionId: string;
  userId: string;
  creditsToGrant: number;
  status: 'verified' | 'rejected';
  adminNotes?: string;
}

const TRANSACTIONS_PER_PAGE = 6;

export function useTransactions(status: TransactionStatus) {
    const { firebaseUser, isLoading: authLoading } = useAuth();

    return useInfiniteQuery({
        queryKey: transactionKeys.list(status),
        queryFn: async ({ pageParam }) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            const results = await getTransactions({ token, status, limit: TRANSACTIONS_PER_PAGE, lastVisibleId: pageParam });
            // Instantiate Transaction objects
            return {
                ...results,
                transactions: results.transactions.map(t => new Transaction(t))
            };
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
        enabled: !authLoading && !!firebaseUser,
    });
}


export function useVerifyPayment() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (variables: VerifyPaymentVariables) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return verifyPayment(variables, token);
        },
        onSuccess: (data, variables) => {
            toast({ title: 'Success', description: `Transaction has been ${variables.status}.` });
            // Invalidate all transaction lists to refresh data across all tabs
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
        },
        onError: (error: Error) => {
            toast({ title: 'Verification Failed', description: error.message, variant: 'destructive' });
        }
    });
}
