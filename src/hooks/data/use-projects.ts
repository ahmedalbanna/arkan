
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
    
    return useQuery<Project[]>({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) return [];
            
            try {
                const token = await getAuthenticatedToken(firebaseUser);
                const serverProjects = await fetchProjectsApi(token);
                // The new, safe sync logic.
                await localProjectService.syncWithServer(serverProjects);
            } catch (serverError) {
                console.warn("Could not connect to server to sync. Will use local data only.", serverError);
                // If server sync fails, try to load from local storage.
                // If local storage is also empty, throw the error so the UI can show a proper error state.
                const localProjects = await localProjectService.getAllProjects();
                if (localProjects.length > 0) {
                    return localProjects.map(p => new Project(p));
                } else {
                    // Only throw if both server and local are unavailable.
                    throw serverError;
                }
            }
            
            // If server sync was successful, return all local projects (which now includes server projects).
            const allLocalProjects = await localProjectService.getAllProjects();
            return allLocalProjects.map(p => new Project(p));
        },
        enabled: !!firebaseUser,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useSaveProject() {
    const queryClient = useQueryClient();
    const { setProjectStatus } = useBuilderStore();
    const { firebaseUser } = useAuth();

    const saveProjectMutation = useMutation({
        mutationFn: async (projectData: ProjectProperties) => {
            setProjectStatus('saving');
            const updatedProjectData = {
                ...projectData,
                meta: { ...projectData.meta, updated: new Date().toISOString() },
            };
            
            // Always save locally first for speed and offline capability
            await localProjectService.saveProject(updatedProjectData);

            if (!navigator.onLine || !firebaseUser) {
                // If offline, we've already saved locally.
                toast({ title: 'Saved Locally', description: 'Project saved to your device. It will sync when you are back online.' });
                return updatedProjectData;
            }
            
            // If online, also save to server
            try {
                const token = await getAuthenticatedToken(firebaseUser);
                return await saveProjectApi(updatedProjectData, token);
            } catch (error) {
                // If server save fails, the data is still safe locally.
                console.error("Failed to save project to server, but it's saved locally.", error);
                throw new Error("Failed to sync with server. Your work is saved locally.");
            }
        },
        onSuccess: (savedProject) => {
            setProjectStatus('idle');
            // Invalidate the list of projects to refetch it.
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            
            // Also update the specific query for this project if it exists in the cache
            queryClient.setQueryData(projectKeys.detail(savedProject.id!), new Project(savedProject));

            if (navigator.onLine) {
                toast({ title: 'Project Saved', description: `"${savedProject.name}" has been saved.` });
            }
        },
        onError: (error: any) => {
            setProjectStatus('dirty'); // Revert to dirty on error so user can try again
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
