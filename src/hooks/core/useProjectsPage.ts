
'use client';

import { useProjects, useDeleteProject } from '@/hooks';
import { useBuilderStore } from './useBuilderStore';
import { useRouter } from 'next/navigation';
import { useLocalization } from '@/context/LocalizationContext';
import { Project } from '@/lib/models';
import { useToast } from '../util/use-toast';

export function useProjectsPage() {
    const { t } = useLocalization();
    const router = useRouter();
    const { toast } = useToast();
    const { projects, isLoading, isError, error, refetch, isRefetching } = useProjects();
    const { loadProject, setIsCreateProjectOpen } = useBuilderStore();
    const deleteMutation = useDeleteProject();

    const handleLoadProject = (project: Project) => {
        loadProject(project.toStateObject());
        router.push('/builder');
    };

    const handleDeleteProject = (projectId: string) => {
        deleteMutation.mutate(projectId);
    };

    const handleCreateNewProject = () => {
        setIsCreateProjectOpen(true);
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
