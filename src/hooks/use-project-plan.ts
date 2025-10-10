
'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import type { ProjectPlan } from '@/lib/models/plan';
import { generateProjectPlanApi } from '@/services';
import { useMutation } from '@tanstack/react-query';
import { toast } from './use-toast';
import { useBuilderStore } from './useBuilderStore';

interface GeneratePlanVariables {
    projectDescription: string;
    keyDeliverables: string;
}

export function useGenerateProjectPlan() {
    const { firebaseUser, refetchUser } = useAuth();
    const { updateProject } = useBuilderStore();

    return useMutation<ProjectPlan, Error, GeneratePlanVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateProjectPlanApi({ ...variables, token });
        },
        onSuccess: (data) => {
            // Use the updater function to call the model's method
            updateProject(p => p.setProjectPlan(data));

            refetchUser(); // To update credits
            toast({ title: 'Project Plan Generated', description: 'Your project has been broken down into phases and tasks.' });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Project Plan Generation Failed");
        },
    });
}
