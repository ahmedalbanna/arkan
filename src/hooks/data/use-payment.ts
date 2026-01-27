'use client';
import { getFirebaseAuthToken } from '@/lib/utils/authUtils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { transactionKeys } from '@/lib/query-keys';
import { submitPaymentProof } from '@/services/api/transactionService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useSubmitPaymentProof() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await getFirebaseAuthToken();
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
