'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { TransactionApiClient, VerifyPaymentVariables } from '@/modules/billing/adapters/api-client/TransactionApiClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';
import { transactionKeys } from '@/infrastructure/api/query-keys';

export function useTransactions(status: string = 'all') {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: transactionKeys.list(status),
    queryFn: async ({ pageParam }) => {
      if (!user) return { transactions: [], hasNextPage: false, lastVisibleId: null };
      const client = container.resolve(TransactionApiClient);
      const result = await client.fetchTransactions({ status: status === 'all' ? undefined : status, lastVisibleId: pageParam as string });
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
    enabled: !!user,
  });
}

export function useUserTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: transactionKeys.user(user?.uid || 'anonymous'),
    queryFn: async () => {
      if (!user) return [];
      const client = container.resolve(TransactionApiClient);
      const result = await client.fetchUserTransactions();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!user,
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (variables: VerifyPaymentVariables) => {
      const client = container.resolve(TransactionApiClient);
      const result = await client.verifyPayment(variables);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all() });
      toast({ title: 'Success', description: 'Payment verified successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to verify payment.', variant: 'destructive' });
    },
  });
}

export function useSubmitPaymentProof(options?: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const client = container.resolve(TransactionApiClient);
      const result = await client.submitPaymentProof({ formData });
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Payment proof submitted successfully.' });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all() });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to submit proof.', variant: 'destructive' });
    },
  });
}
