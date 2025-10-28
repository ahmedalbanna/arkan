
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useDeleteProject } from '@/hooks';
import { useBuilderStore } from './useBuilderStore';
import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/models'; // Import the Project class

export function useProjectCardLogic(project: Project) {
    const { t } = useLocalization();
    const router = useRouter();
    const { loadProject } = useBuilderStore();
    const deleteMutation = useDeleteProject();

    const handleLoadProject = () => {
        loadProject(project.toStateObject());
        router.push('/builder');
    };

    const handleDeleteProject = () => {
        deleteMutation.mutate(project.id);
    };

    const projectTitle = project.name || t('projects.untitled');
    const isDeletingThisProject = deleteMutation.isPending && deleteMutation.variables === project.id;

    return {
        handleLoadProject,
        handleDeleteProject,
        projectTitle,
        isDeletingThisProject,
        t
    };
}
