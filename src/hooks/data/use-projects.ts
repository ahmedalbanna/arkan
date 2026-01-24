
'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/util/use-toast';
import type { ProjectProperties } from '@/lib/models';
import { Project } from '@/lib/models';
import { projectKeys } from '@/lib/query-keys';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { deleteProjectApi, fetchProjectsApi, saveProjectApi } from '@/services/api/projectService';
import { localProjectService } from '@/services/local-project-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBuilderStore } from '../core/useBuilderStore';

/**
 * Projects Hook
 *
 * Fetches and manages user projects with offline-first approach.
 * Syncs between local IndexedDB storage and Firebase backend.
 *
 * @returns Projects data and query state
 *
 * @example
 * ```tsx
 * const { projects, isLoading, error } = useProjects();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error} />;
 *
 * return <ProjectList projects={projects} />;
 * ```
 */
export function useProjects() {
    const { firebaseUser } = useAuth();
    const { data, ...rest } = useQuery<Project[]>({
        queryKey: firebaseUser ? projectKeys.lists(firebaseUser.uid) : projectKeys.lists('guest'),
        queryFn: async () => {
            if (!firebaseUser) return [];
            // Then, fetch from server and merge
            try {
                const token = await getAuthenticatedToken(firebaseUser);
                const serverProjects = await fetchProjectsApi(token);

                const mergedProjects = serverProjects.map(p => new Project(p));

                // Sync local db with server source of truth
                mergedProjects.forEach(p => localProjectService.saveProject(p.toStateObject()));

                return mergedProjects;

            } catch (e) {
                // Could not sync with server, fall back to local projects
                // First, get local projects for optimistic UI
                const localProjects = await localProjectService.getAllProjects();
                return localProjects.map(p => new Project(p));
            }
        },
        enabled: !!firebaseUser,
    });

    return { projects: data, ...rest };
}

/**
 * Save Project Hook
 *
 * Handles saving projects to Firebase backend.
 * Requires online connection and authenticated user.
 *
 * @returns Save mutation and loading state
 *
 * @example
 * ```tsx
 * const { saveProjectMutation, isSaving } = useSaveProject();
 *
 * const handleSave = () => {
 *   saveProjectMutation.mutate(project.toStateObject());
 * };
 * ```
 */
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
            return saveProjectApi(projectData, token);
        },
        onSuccess: (savedProject) => {
            setHasUnsavedChanges(false);
            queryClient.invalidateQueries({ queryKey: projectKeys.lists(firebaseUser?.uid || 'guest') });
            toast({ title: 'Project Saved', description: `"${savedProject.name}" has been saved to the cloud.` });
        },
        onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast({ title: 'Error', description: `Failed to save project: ${errorMessage}`, variant: 'destructive' });
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
                serverDelete = deleteProjectApi(projectId, token);
            }
            await Promise.all([localDelete, serverDelete]);
            return projectId;
        },
        onSuccess: (projectId) => {
            toast({ title: 'Project Deleted', description: 'The project has been successfully deleted.' });
            queryClient.invalidateQueries({ queryKey: projectKeys.lists(firebaseUser?.uid || 'guest') });
            // Also remove from the specific detail query if it exists
            queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
        },
        onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast({ title: 'Delete Failed', description: errorMessage, variant: 'destructive' });
        },
    });
}
