

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from './use-toast';
import { generatePresentationApi, generatePresentationOutlineApi } from '@/services';
import type { GeneratePresentationOutput, PresentationHistoryEntry, GeneratePresentationOutlineInput, GeneratePresentationOutlineOutput } from '@/ai/schemas';
import { useBuilderStore } from './useBuilderStore';
import { useLocalization } from '@/context/LocalizationContext';
import { userKeys } from '@/lib/query-keys';
import { Project } from '@/lib/models/project';

interface GeneratePresentationVariables {
    body: any;
    token: string;
}

export function useGeneratePresentation() {
    const { t } = useLocalization();
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    const { project, updateProject } = useBuilderStore();

    return useMutation<GeneratePresentationOutput, Error, GeneratePresentationVariables>({
        mutationFn: generatePresentationApi,
        onSuccess: (data) => {
            if (!project) return;
            const newEntry: PresentationHistoryEntry = {
                id: new Date().toISOString(),
                name: `Presentation - ${new Date().toLocaleTimeString()}`,
                slides: data.slides,
            };
            
            // Use the new updater function to call the model's method
            updateProject(p => {
                p.addPresentationToHistory(newEntry);
            });

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

export function useGeneratePresentationOutline(options?: {
    onSuccess?: (data: GeneratePresentationOutlineOutput, variables: GeneratePresentationOutlineInput, context: unknown) => unknown;
    onError?: (error: Error, variables: GeneratePresentationOutlineInput, context: unknown) => unknown;
}) {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    return useMutation<GeneratePresentationOutlineOutput, Error, GeneratePresentationOutlineInput>({
        mutationFn: async (variables) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return generatePresentationOutlineApi(variables, token);
        },
        onSuccess: (data, variables, context) => {
             if (firebaseUser) {
                queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
            }
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(error, variables, context);
        },
    });
}
