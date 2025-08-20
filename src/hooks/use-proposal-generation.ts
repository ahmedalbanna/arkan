

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { toast } from './use-toast';
import type { AnyProjectProposal, ExternalContext } from '@/lib/types';
import { generateProposalApi } from '@/services/proposal-service';
import { useBuilderStore } from './useBuilderStore';
import type { AdvancedProposalFields } from './useProposalGenerationStore';

export interface GenerateProposalBody {
    projectIdea: string;
    templateId: string;
    customGuidelines: string[];
    externalContext: ExternalContext[];
    advancedFields?: AdvancedProposalFields;
}

export function useGenerateProposal() {
    const { firebaseUser } = useAuth();
    const { setProposal } = useBuilderStore();
    const queryClient = useQueryClient();

    return useMutation<string, Error, GenerateProposalBody>({
        mutationFn: async (body) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateProposalApi({ body, token });
        },
        onSuccess: (data) => {
            setProposal(data);
            if (firebaseUser) {
              queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
            }
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
