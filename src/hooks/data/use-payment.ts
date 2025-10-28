
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { submitPaymentProof } from '@/services/payment-service';
import { useToast } from '../use-toast';
import { transactionKeys } from '@/lib/query-keys';

export function useSubmitPaymentProof() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return submitPaymentProof({ formData, token });
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
