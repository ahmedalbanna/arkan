
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { TransactionApiClient } from '@/modules/billing/adapters/api-client/TransactionApiClient';
import { container } from '@/infrastructure/di/container';
import { useToast } from '@/hooks';
import { transactionKeys } from '@/lib/query-keys';

export function useSubmitPaymentProof() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            const client = container.resolve(TransactionApiClient);
            return client.submitPaymentProof({ formData, token });
        },
        onSuccess: () => {
            toast({ title: 'Submission Successful', description: 'Your payment proof has been uploaded for review.' });
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
        },
        onError: (error: Error) => {
            toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
        }
    });
}
