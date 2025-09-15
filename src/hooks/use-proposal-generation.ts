
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { toast } from './use-toast';
import type { ExternalContext } from '@/lib/types';
import { generateProposalApi } from '@/services';
import { useBuilderStore } from './useBuilderStore';
import type { AdvancedProposalFields } from './useProposalGenerationStore';
import { Project } from '@/lib/models/project'; // Import Project

export interface GenerateProposalBody {
    projectIdea: string;
    templateId: string;
    customGuidelines: string[];
    externalContext: ExternalContext[];
    advancedFields?: AdvancedProposalFields;
}

export function useGenerateProposal() {
    const { firebaseUser, refetchUser } = useAuth();
    const { updateProject } = useBuilderStore(); // Get the central updater function

    return useMutation<any, Error, GenerateProposalBody>({
        mutationFn: async (body) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateProposalApi({ body, token });
        },
        onSuccess: (data) => {
            // Use the updater function to call the model's method
            updateProject(p => {
                p.setProposal(data);
            });

            refetchUser(); // To update credits
            toast({
                title: "Proposal Generated",
                description: "Your project proposal has been successfully created.",
            });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Proposal Generation Failed");
        },
    });
}
