
'use client';

import { toast } from '@/hooks/util/use-toast';
import type { ProjectProperties } from '@/lib/models';
import { Project } from '@/lib/models'; // Import the Project class
import { projectKeys } from '@/lib/query-keys';
import { localProjectService } from '@/services/local-project-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBuilderStore } from '../core/useBuilderStore';

export function useProjects() {
    const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<Project[]>({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            const projectsData = await localProjectService.getAllProjects();
            return projectsData.map(p => new Project(p));
        },
        // This query is now client-side only, so it's always enabled.
    });

    return { projects: data, isLoading, isError, error, refetch, isRefetching };
}

export function useProject(projectId?: string) {
    const { data, ...rest } = useQuery<Project | null>({
        queryKey: projectKeys.detail(projectId!),
        queryFn: async () => {
            if (!projectId) return null;
            const projectData = await localProjectService.getProject(projectId);
            return projectData ? new Project(projectData) : null;
        },
        enabled: !!projectId,
    });
    return { data, ...rest };
}

export function useSaveProject() {
    const queryClient = useQueryClient();
    const { setHasUnsavedChanges } = useBuilderStore();

    const saveProjectMutation = useMutation({
        mutationFn: (projectData: ProjectProperties) => {
            return localProjectService.saveProject(projectData);
        },
        onSuccess: (savedProject) => {
            // Update the specific project in the cache to avoid a full refetch
            queryClient.setQueryData(projectKeys.detail(savedProject.id!), new Project(savedProject));

            // Only invalidate the list if absolutely necessary, to prevent re-renders
            // For autosave, this is generally not needed and can cause loops.
            // A manual save action might invalidate this, but autosave shouldn't.
            // queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

            // Check if there are new unsaved changes before setting this to false.
            const hasChangesMadeDuringSave = useBuilderStore.getState().hasUnsavedChanges;
            const lastSavedTimestamp = new Date(savedProject.meta.updated || 0).getTime();
            const currentProjectTimestamp = new Date(useBuilderStore.getState().project?.meta.updated || 0).getTime();

            if (currentProjectTimestamp <= lastSavedTimestamp) {
                setHasUnsavedChanges(false);
            }
        },
        onError: (error) => {
            toast({ title: 'Error', description: `Failed to save project: ${error.message}`, variant: 'destructive' });
        }
    });

    return {
        saveProjectMutation,
        isSaving: saveProjectMutation.isPending,
    };
}


export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) => {
            return localProjectService.deleteProject(projectId);
        },
        onSuccess: (data, projectId) => {
            toast({ title: 'Project Deleted', description: 'The project has been successfully deleted.' });
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        },
        onError: (error) => {
            toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
        },
    });
}
