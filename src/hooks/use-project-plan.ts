
'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { toast } from './use-toast';
import type { ProjectPlan } from '@/ai/schemas';
import { generateProjectPlanApi } from '@/services';
import { useBuilderStore } from './useBuilderStore';
import { Project } from '@/lib/models/project';

interface GeneratePlanVariables {
    projectDescription: string;
    keyDeliverables: string;
}

export function useGenerateProjectPlan() {
    const { firebaseUser, refetchUser } = useAuth();
    const { project, setProject } = useBuilderStore();

    return useMutation<ProjectPlan, Error, GeneratePlanVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateProjectPlanApi({ ...variables, token });
        },
        onSuccess: (data) => {
            if (!project) return;
            project.setProjectPlan(data);
            setProject(new Project(project.toStateObject()));

            refetchUser(); // To update credits
            toast({ title: 'Project Plan Generated', description: 'Your project has been broken down into phases and tasks.' });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Project Plan Generation Failed");
        },
    });
}
