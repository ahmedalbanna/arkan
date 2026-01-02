
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
import { localProjectService } from '@/services/local-project-service';

export function useProjects() {
    const { firebaseUser } = useAuth();
    const { data, ...rest } = useQuery<Project[]>({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) return [];
            // First, get local projects for optimistic UI
            const localProjects = await localProjectService.getAllProjects();
            
            // Then, fetch from server and merge
            try {
                const token = await getAuthenticatedToken(firebaseUser);
                const serverProjects = await fetchProjectsApi(token);
                
                // Merge local and server data, server is source of truth
                const allProjectsMap = new Map<string, ProjectProperties>();
                localProjects.forEach(p => allProjectsMap.set(p.id!, p));
                serverProjects.forEach(p => allProjectsMap.set(p.id!, p));

                const mergedProjects = Array.from(allProjectsMap.values());

                // Sync local db with server source of truth
                mergedProjects.forEach(p => localProjectService.saveProject(p));

                return mergedProjects.map(p => new Project(p));

            } catch (e) {
                console.warn("Could not sync with server, using local projects.", e);
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
            // Step 1: Save to local DB first. This is fast and works offline.
            const locallySavedProject = await localProjectService.saveProject(projectData);
            
            // Optimistically update the UI to show changes are "saved" locally.
            queryClient.setQueryData(projectKeys.lists(), (oldData: Project[] | undefined) => {
                const existing = oldData?.find(p => p.id === locallySavedProject.id);
                if (existing) {
                    return oldData!.map(p => p.id === locallySavedProject.id ? new Project(locallySavedProject) : p);
                }
                return [...(oldData || []), new Project(locallySavedProject)];
            });
            setHasUnsavedChanges(false);

            // Step 2: Attempt to save to the server in the background.
            if (navigator.onLine && firebaseUser) {
                try {
                    const token = await getAuthenticatedToken(firebaseUser);
                    const serverSavedProject = await saveProjectApi(locallySavedProject, token);
                    
                    // Update cache with the server-confirmed data
                    queryClient.setQueryData(projectKeys.detail(serverSavedProject.id!), new Project(serverSavedProject));
                    
                    return serverSavedProject;
                } catch (serverError) {
                    // The local save succeeded, but server sync failed.
                    // The user's data is safe locally. We can notify them if needed.
                    console.error("Server sync failed:", serverError);
                    toast({ title: 'Offline Mode', description: 'Project saved locally. Will sync with the cloud when connection is restored.' });
                    // Re-throw to let the mutation know it partially failed, but don't bother the user with a destructive toast.
                    throw new Error("Server sync failed."); 
                }
            }
            
            return locallySavedProject;
        },
        onSuccess: (savedProject) => {
             // Invalidate list to ensure it's fresh on next fetch
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        },
        onError: (error: any) => {
            // Only show a destructive error toast if the *local* save fails, which is rare.
            if (!error.message?.includes("Server sync failed")) {
                toast({ title: 'Error', description: `Failed to save project locally: ${error.message}`, variant: 'destructive' });
                // If local save fails, changes are still unsaved.
                setHasUnsavedChanges(true);
            }
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
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            // Also remove from the specific detail query if it exists
            queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
        },
        onError: (error: any) => {
            toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
        },
    });
}
