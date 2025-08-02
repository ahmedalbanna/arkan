
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from './use-toast';
import { generatePresentationApi } from '@/services/presentation-service';
import type { GeneratePresentationOutput, PresentationHistoryEntry } from '@/ai/schemas';
import { usePresentationStore } from './usePresentationStore';
import { useLocalization } from '@/context/LocalizationContext';
import { userKeys } from '@/lib/query-keys';

interface GeneratePresentationVariables {
    body: any;
    token: string;
}

export function useGeneratePresentation() {
    const { t } = useLocalization();
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    const { addPresentationToHistory } = usePresentationStore();

    return useMutation<GeneratePresentationOutput, Error, GeneratePresentationVariables>({
        mutationFn: generatePresentationApi,
        onSuccess: (data) => {
            const newEntry: PresentationHistoryEntry = {
                id: new Date().toISOString(),
                name: `Presentation - ${new Date().toLocaleTimeString()}`,
                slides: data.slides,
            };
            addPresentationToHistory(newEntry);
            if (firebaseUser) {
                queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
            }
            toast({ title: t('builder.presentationGenerator.toasts.success') });
        },
        onError: (error: Error) => {
            toast({ 
                title: t('builder.presentationGenerator.toasts.failed'), 
                description: error.message, 
                variant: 'destructive' 
            });
        }
    });
}
