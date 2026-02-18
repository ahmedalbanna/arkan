
'use client';

import { toast } from '@/hooks/util/use-toast';
import type { ProjectProperties } from '@/lib/models';
import { Project } from '@/lib/models';
import { projectKeys } from '@/lib/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBuilderStore } from '../core/useBuilderStore';
import { useAuth } from '@/context/NextAuthContext';
import { useSession } from "next-auth/react";
import { fetchProjectsApi, saveProjectApi, deleteProjectApi } from '@/services/api/projectService';
import { localProjectService } from '@/services/local-project-service';

export function useProjects() {
    const { data: session } = useSession();
    const { data, ...rest } = useQuery<Project[]>({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            if (!session?.user?.id) return [];
            // Then, fetch from server and merge
            try {
                const token = session.user.id;
                const serverProjects = await fetchProjectsApi(token);
                
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
        enabled: !!session?.user?.id,
    });

    return { projects: data, ...rest };
}

export function useSaveProject() {
    const queryClient = useQueryClient();
    const { setHasUnsavedChanges } = useBuilderStore();
    const { data: session } = useSession();

    const saveProjectMutation = useMutation({
        mutationFn: async (projectData: ProjectProperties) => {
            if (!navigator.onLine || !session?.user?.id) {
                toast({ title: 'Offline', description: 'You are offline. Please connect to the internet to save the project.', variant: 'destructive' });
                throw new Error("User is offline.");
            }
            const token = session.user.id;
            return saveProjectApi(projectData, token);
        },
        onSuccess: (savedProject) => {
            setHasUnsavedChanges(false);
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            toast({ title: 'Project Saved', description: `"${savedProject.name}" has been saved to the cloud.` });
        },
        onError: (error) => {
            toast({ title: 'Error', description: `Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
        }
    });

    return {
        saveProjectMutation,
        isSaving: saveProjectMutation.isPending,
    };
}


export function useDeleteProject() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: async (projectId: string) => {
            // Delete from local and server simultaneously
            const localDelete = localProjectService.deleteProject(projectId);
            let serverDelete: Promise<unknown> | null = null;
            if (navigator.onLine && session?.user?.id) {
                const token = session.user.id;
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
        onError: (error) => {
            toast({ title: 'Delete Failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
        },
    });
}
