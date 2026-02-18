
'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { transactionKeys } from '@/lib/query-keys';
import { getTransactions, verifyPayment, submitPaymentProof } from '@/services/api/transactionService';
import { toast, useToast } from '@/hooks/util/use-toast';
import { Transaction, type TransactionProperties } from '@/lib/models/transaction';
import { VerifyPaymentVariables } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export type TransactionStatus = 'pending' | 'verified' | 'rejected';

export { type VerifyPaymentVariables };

const TRANSACTIONS_PER_PAGE = 6;

export function useTransactions(status: TransactionStatus) {
    const { data: session, status: sessionStatus } = useSession();

    return useInfiniteQuery({
        queryKey: transactionKeys.list(status),
        queryFn: async ({ pageParam }) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            const token = session.user.id;
            const results = await getTransactions({ token, status, limit: TRANSACTIONS_PER_PAGE, lastVisibleId: pageParam });
            // Instantiate Transaction objects
            return {
                ...results,
                transactions: results.transactions.map(t => new Transaction(t))
            };
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
        enabled: sessionStatus === "authenticated",
    });
}


export function useVerifyPayment() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: async (variables: VerifyPaymentVariables) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            const token = session.user.id;
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
    const { data: session, status: sessionStatus } = useSession();

    return useQuery({
        queryKey: transactionKeys.lists(),
        queryFn: async () => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            const token = session.user.id;
            const { fetchUserTransactions } = await import('@/services/api/transactionService');
            const results = await fetchUserTransactions(token);
            // Instantiate Transaction objects
            return results.map((t: TransactionProperties) => new Transaction(t));
        },
        enabled: sessionStatus === "authenticated",
    });
}

export function useSubmitPaymentProof(options?: { onSuccess?: () => void }) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            if (!session?.user?.id) throw new Error("User not authenticated");
            const token = session.user.id;
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
