
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { toast } from './use-toast';
import type { AnyProjectProposal } from '@/ai/schemas';
import { generateProposalApi } from '@/services/proposal-service';
import { useBuilderStore } from './useBuilderStore';

interface GenerateProposalBody {
    projectIdea: string;
    templateId: string;
    customGuidelines: string[];
}

export function useGenerateProposal() {
    const { firebaseUser, refetchUser } = useAuth();
    const { setProposal } = useBuilderStore();
    const queryClient = useQueryClient();

    return useMutation<AnyProjectProposal, Error, GenerateProposalBody>({
        mutationFn: async (body) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateProposalApi({ body, token });
        },
        onSuccess: (data) => {
            setProposal(data);
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
