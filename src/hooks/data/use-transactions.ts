'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { transactionKeys } from '@/lib/query-keys';
import { getTransactions, verifyPayment, submitPaymentProof } from '@/modules/billing/adapters/api-client/TransactionApiClient';
import { toast, useToast } from '@/hooks/util/use-toast';
import { Transaction, type TransactionProperties } from '@/modules/billing/domain/entities/Transaction';

import { useQuery } from '@tanstack/react-query';


export type TransactionStatus = 'pending' | 'verified' | 'rejected';



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

export function useUserTransactions() {
    const { firebaseUser, isLoading: authLoading } = useAuth();

    return useQuery({
        queryKey: transactionKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            const { fetchUserTransactions } = await import('@/modules/billing/adapters/api-client/TransactionApiClient');
            const results = await fetchUserTransactions(token);
            // Instantiate Transaction objects
            return results.map((t: TransactionProperties) => new Transaction(t));
        },
        enabled: !authLoading && !!firebaseUser,
    });
}

export function useSubmitPaymentProof(options?: { onSuccess?: () => void }) {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return submitPaymentProof({ formData, token });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            options?.onSuccess?.();
        },
        onError: (error: Error) => {
            toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
        }
    });
}
