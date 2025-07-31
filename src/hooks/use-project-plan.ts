
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { toast } from './use-toast';
import type { ProjectPlan, ProjectProposal } from '@/ai/schemas';
import { generateProjectPlanApi } from '@/services/project-plan-service';
import { useProjectPlanStore } from './useProjectPlanStore';

interface GeneratePlanVariables {
    proposal?: ProjectProposal;
    projectIdea?: string;
}

export function useGenerateProjectPlan() {
    const { firebaseUser, refetchUser } = useAuth();
    const queryClient = useQueryClient();
    const { setProjectPlan } = useProjectPlanStore();

    return useMutation<ProjectPlan, Error, GeneratePlanVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateProjectPlanApi({ ...variables, token });
        },
        onSuccess: (data) => {
            setProjectPlan(data);
            refetchUser(); // To update credits
            toast({ title: 'Project Plan Generated', description: 'Your project has been broken down into phases and tasks.' });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Project Plan Generation Failed");
        },
    });
}
