'use client';

import { useProjects, useDeleteProject, useToast } from '@/hooks';
import { useBuilderStore } from './useBuilderStore';
import { useRouter } from 'next/navigation';
import { useLocalization } from '@/context/LocalizationContext';
import { Project } from '@/lib/models';
import { useRef, useCallback } from 'react';

export function useProjectsPage() {
    const { t } = useLocalization();
    const router = useRouter();
    const { projects, isLoading, isError, error, refetch, isRefetching } = useProjects();
    const { loadProject, newSession } = useBuilderStore();
    const deleteMutation = useDeleteProject();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadProject = (project: Project) => {
        loadProject(project.toStateObject());
        router.push('/builder');
    };

    const handleDeleteProject = (projectId: string) => {
        deleteMutation.mutate(projectId);
    };

    const handleCreateNewProject = () => {
        // Reset the store to a fresh, untitled project before navigating
        newSession();
        router.push('/builder');
    };

    const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const projectData = JSON.parse(event.target?.result as string);
                    if (projectData.id) { // Basic validation
                        loadProject(projectData);
                        toast({ title: t('builder.toasts.projectLoadedTitle'), description: t('builder.toasts.projectLoadedDesc', { projectName: projectData.name }) });
                        router.push('/builder');
                    } else {
                        throw new Error(t('builder.errors.invalidProjectFile'));
                    }
                } catch (err) {
                    toast({ title: t('builder.toasts.loadFailedTitle'), description: (err as Error).message, variant: 'destructive' });
                }
            };
            reader.readAsText(file);
        }
        if (e.target) e.target.value = '';
    }, [loadProject, toast, t, router]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return {
        t,
        projects,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
        deleteMutation,
        fileInputRef,
        handleLoadProject,
        handleDeleteProject,
        handleCreateNewProject,
        handleUploadClick,
        onFileChange,
    };
}
