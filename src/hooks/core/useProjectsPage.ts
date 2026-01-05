
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useDeleteProject, useProjects } from '@/hooks';
import { Project } from '@/lib/models';
import { useRouter } from 'next/navigation';
import { useToast } from '../util/use-toast';
import { useBuilderStore } from './useBuilderStore';

export function useProjectsPage() {
    const { t } = useLocalization();
    const router = useRouter();
    const { toast } = useToast();
    const { projects, isLoading, isError, error, refetch, isRefetching } = useProjects();
    const { loadProject } = useBuilderStore();
    const deleteMutation = useDeleteProject();

    const handleLoadProject = (project: Project) => {
        loadProject(project.toStateObject());
        router.push('/builder');
    };

    const handleDeleteProject = (projectId: string) => {
        deleteMutation.mutate(projectId);
    };

    const handleCreateNewProject = () => {
        // This logic is now handled by the newSession method in the store
        // which can be triggered from the UI.
        const { newSession } = useBuilderStore.getState();
        newSession();
        router.push('/builder');
    };

    return {
        t,
        toast,
        projects,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
        deleteMutation,
        handleLoadProject,
        handleDeleteProject,
        handleCreateNewProject,
    };
}
