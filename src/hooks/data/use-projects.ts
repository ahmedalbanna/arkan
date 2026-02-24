
'use client';

import { toast } from '@/hooks/util/use-toast';
import type { ProjectProperties } from '@/lib/models';
import { Project } from '@/lib/models';
import { projectKeys } from '@/lib/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBuilderStore } from '../core/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { localProjectService } from '@/services/local-project-service';
import { container } from '@/infrastructure/di/container';
import { ProjectApiClient } from '@/modules/projects/adapters/api-client/ProjectApiClient';

export function useProjects() {
    const { firebaseUser } = useAuth();
    const { data, ...rest } = useQuery<Project[]>({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) return [];
            // Then, fetch from server and merge
            try {
                const token = await getAuthenticatedToken(firebaseUser);
                const client = container.resolve(ProjectApiClient);
                const serverProjects = await client.fetchProjects(token);
                
                const mergedProjects = serverProjects.map(p => new Project(p));

                // Sync local db with server source of truth
                mergedProjects.forEach(p => localProjectService.saveProject(p.toStateObject()));

                return mergedProjects;

            } catch (e) {
                console.warn("Could not sync with server, using local projects.", e);
                 // First, get local projects for optimistic UI
                const localProjects = await localProjectService.getAllProjects();
                return localProjects.map(p => new Project(p));
            }
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
            if (!navigator.onLine || !firebaseUser) {
                toast({ title: 'Offline', description: 'You are offline. Please connect to the internet to save the project.', variant: 'destructive' });
                throw new Error("User is offline.");
            }
            const token = await getAuthenticatedToken(firebaseUser);
            const client = container.resolve(ProjectApiClient);
            return client.saveProject(projectData, token);
        },
        onSuccess: (savedProject) => {
            setHasUnsavedChanges(false);
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            toast({ title: 'Project Saved', description: `"${savedProject.name}" has been saved to the cloud.` });
        },
        onError: (error: any) => {
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
            // Delete from local and server simultaneously
            const localDelete = localProjectService.deleteProject(projectId);
            let serverDelete: Promise<any> | null = null;
            if (navigator.onLine && firebaseUser) {
                const token = await getAuthenticatedToken(firebaseUser);
                const client = container.resolve(ProjectApiClient);
                serverDelete = client.deleteProject(projectId, token);
            }
            await Promise.all([localDelete, serverDelete]);
            return projectId;
        },
        onSuccess: (projectId) => {
            toast({ title: 'Project Deleted', description: 'The project has been successfully deleted.' });
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            // Also remove from the specific detail query if it exists
            queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
        },
        onError: (error: any) => {
            toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
        },
    });
}
