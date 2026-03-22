'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { transactionKeys } from '@/lib/query-keys';
import { TransactionApiClient } from '@/modules/billing/adapters/api-client/TransactionApiClient';
import { toast, useToast } from '@/hooks/util/use-toast';
import { Transaction, type TransactionProperties } from '@/modules/billing/domain/entities/Transaction';
import { runAuthenticatedResultCall } from './authenticated-client-call';

export type TransactionStatus = 'pending' | 'verified' | 'rejected';

export interface VerifyPaymentVariables {
  transactionId: string;
  userId: string;
  creditsToGrant: number;
  status: TransactionStatus;
  adminNotes?: string;
}

const TRANSACTIONS_PER_PAGE = 6;

export function useTransactions(status: TransactionStatus) {
  const { firebaseUser, isLoading: authLoading } = useAuth();

  return useInfiniteQuery({
    queryKey: transactionKeys.list(status),
    queryFn: async ({ pageParam }) => {
      const results = await runAuthenticatedResultCall(firebaseUser, TransactionApiClient, (client, token) =>
        client.getTransactions({ token, status, limit: TRANSACTIONS_PER_PAGE, lastVisibleId: pageParam }),
      );

      return {
        ...results,
        transactions: results.transactions.map((transaction) => new Transaction(transaction)),
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.lastVisibleId ?? undefined : undefined),
    enabled: !authLoading && Boolean(firebaseUser),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: VerifyPaymentVariables) =>
      runAuthenticatedResultCall(firebaseUser, TransactionApiClient, (client, token) => client.verifyPayment(variables, token)),
    onSuccess: (_data, variables) => {
      toast({ title: 'Success', description: `Transaction has been ${variables.status}.` });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
    onError: (error: Error) => {
      toast({ title: 'Verification Failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUserTransactions() {
  const { firebaseUser, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: transactionKeys.lists(),
    queryFn: async () => {
      const results = await runAuthenticatedResultCall(firebaseUser, TransactionApiClient, (client, token) =>
        client.fetchUserTransactions(token),
      );
      return results.map((transaction: TransactionProperties) => new Transaction(transaction));
    },
    enabled: !authLoading && Boolean(firebaseUser),
  });
}

export function useSubmitPaymentProof(options?: { onSuccess?: () => void }) {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) =>
      runAuthenticatedResultCall(firebaseUser, TransactionApiClient, (client, token) =>
        client.submitPaymentProof({ formData, token }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    },
  });
}
