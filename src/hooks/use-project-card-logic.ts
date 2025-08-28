'use client';

import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useDeleteProject } from '@/hooks/use-projects';
import type { SavedProject } from '@/lib/types';
import { useLocalization } from '@/context/LocalizationContext';

export function useProjectCardLogic(project: SavedProject) {
    const router = useRouter();
    const { t } = useLocalization();
    const loadState = useBuilderStore(state => state.loadState);
    const deleteProjectMutation = useDeleteProject();

    const handleLoadProject = () => {
        loadState(project);
        router.push('/generate');
    };

    const handleDeleteProject = () => {
        deleteProjectMutation.mutate(project.id);
    }

    const projectTitle = project.name || project.proposal?.title || t('projects.untitled');
    const isDeletingThisProject = deleteProjectMutation.isPending && deleteProjectMutation.variables === project.id;

    return {
        handleLoadProject,
        handleDeleteProject,
        projectTitle,
        isDeletingThisProject,
        t
    };
}
