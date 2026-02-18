
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from "next-auth/react";
import { submitPaymentProof } from '@/services/api/transactionService';
import { useToast } from '@/hooks';
import { transactionKeys } from '@/lib/query-keys';

export function useSubmitPaymentProof() {
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
            toast({ title: 'Submission Successful', description: 'Your payment proof has been uploaded for review.' });
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
        },
        onError: (error: Error) => {
            toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
        }
    });
}
