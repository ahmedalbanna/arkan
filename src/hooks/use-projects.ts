
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { projectKeys } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import type { SavedProject, ProjectState } from '@/lib/types';
import { 
    fetchProjects as fetchProjectsApi,
    createProject, 
    deleteProject, 
    updateProject 
} from '@/services/project-service';
import { useBuilderStore } from './useBuilderStore';

export function useProjects() {
    const { firebaseUser } = useAuth();
    return useQuery<SavedProject[]>({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchProjectsApi(token);
        },
        enabled: !!firebaseUser,
    });
}

export function useSaveProject() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    const setCurrentProjectId = useBuilderStore(state => state.setCurrentProjectId);
    const setHasUnsavedChanges = useBuilderStore(state => state.setHasUnsavedChanges);

    return useMutation({
        mutationFn: async (data: ProjectState & { name: string }) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return createProject(data, token);
        },
        onSuccess: (newProject) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            setCurrentProjectId(newProject.id); // Set the ID in the store for subsequent saves
            setHasUnsavedChanges(false);
            toast({
                title: 'Project Saved',
                description: `"${newProject.name}" has been successfully saved.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Save Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}


export function useUpdateProject() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    const setHasUnsavedChanges = useBuilderStore(state => state.setHasUnsavedChanges);

    return useMutation({
        mutationFn: async (variables: { projectId: string; data: ProjectState }) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return updateProject(variables.projectId, variables.data, token);
        },
        onSuccess: (updatedProject) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(updatedProject.id) });
            setHasUnsavedChanges(false);
            toast({
                title: 'Project Updated',
                description: `"${updatedProject.name}" has been successfully updated.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Update Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}


export function useDeleteProject() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (projectId: string) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return deleteProject(projectId, token);
        },
        onSuccess: (_, projectId) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            toast({
                title: 'Project Deleted',
                description: 'The project has been successfully deleted.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Delete Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}

    