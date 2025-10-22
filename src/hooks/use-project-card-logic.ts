
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useDeleteProject } from '@/hooks';
import type { Project } from '@/lib/models/project';
import { useRouter } from 'next/navigation';

export function useProjectCardLogic(project: Project) {
    const router = useRouter();
    const { t } = useLocalization();
    const { loadProject } = useBuilderStore();

    const deleteProjectMutation = useDeleteProject();

    const handleLoadProject = () => {
        // The store's loadProject action expects the raw project properties.
        // The .toJSON() method serializes the Project instance into the correct format.
        loadProject(project.toJSON());
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
