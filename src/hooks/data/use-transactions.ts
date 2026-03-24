'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { TransactionApiClient, VerifyPaymentVariables } from '@/modules/billing/adapters/api-client/TransactionApiClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/util/use-toast';

export function useTransactions(status?: string) {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: ['transactions', status],
    queryFn: async () => {
      if (!firebaseUser) return [];
      const client = container.resolve(TransactionApiClient);
      const result = await client.fetchTransactions(status);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
  });
}

export function useUserTransactions() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: ['user-transactions', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser) return [];
      const client = container.resolve(TransactionApiClient);
      const result = await client.fetchUserTransactions();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    enabled: !!firebaseUser,
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
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Success', description: 'Payment verified successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to verify payment.', variant: 'destructive' });
    },
  });
}

export function useSubmitPaymentProof() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const client = container.resolve(TransactionApiClient);
      const result = await client.submitPaymentProof(formData);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Payment proof submitted successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to submit proof.', variant: 'destructive' });
    },
  });
}
