
'use client';

import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/hooks';
import { useDeleteProject } from '@/hooks';
import { useLocalization } from '@/context/LocalizationContext';
import type { Project } from '@/lib/models/project'; // Import the Project class

export function useProjectCardLogic(project: Project) { // Changed type to Project
    const router = useRouter();
    const { t } = useLocalization();
    const { loadProject } = useBuilderStore();

    const deleteProjectMutation = useDeleteProject();

    const handleLoadProject = () => {
        // The store's loadProject action expects a plain object
        loadProject(project.toPlainObject()); 
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
