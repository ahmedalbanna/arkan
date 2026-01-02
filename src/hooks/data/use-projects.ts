
'use client';

import { toast } from '@/hooks/util/use-toast';
import type { ProjectProperties } from '@/lib/models';
import { Project } from '@/lib/models';
import { projectKeys } from '@/lib/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBuilderStore } from '../core/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { fetchProjectsApi, saveProjectApi, deleteProjectApi } from '@/services/api/projectService';

export function useProjects() {
    const { firebaseUser } = useAuth();
    const { data, ...rest } = useQuery<Project[]>({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) return [];
            const token = await getAuthenticatedToken(firebaseUser);
            const projectsData = await fetchProjectsApi(token);
            return projectsData.map(p => new Project(p));
        },
        enabled: !!firebaseUser,
    });

    return { projects: data, ...rest };
}

export function useSaveProject() {
    const queryClient = useQueryClient();
    const { setHasUnsavedChanges } = useBuilderStore();
    const { firebaseUser } = useAuth();

    const saveProjectMutation = useMutation({
        mutationFn: async (projectData: ProjectProperties) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return saveProjectApi(projectData, token);
        },
        onSuccess: (savedProject) => {
            queryClient.setQueryData(projectKeys.detail(savedProject.id!), new Project(savedProject));
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            
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
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (projectId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteProjectApi(projectId, token);
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
