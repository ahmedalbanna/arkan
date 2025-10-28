
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectKeys } from '@/lib/query-keys';
import { fetchProjectsApi, createProject, updateProject, deleteProject, type ProjectState, fetchProjectApi } from '@/services/project-service';
import { useBuilderStore } from '../core/useBuilderStore';
import { toast } from '@/hooks/util/use-toast';
import { Project } from '@/lib/models/project'; // Import the Project class

export function useProjects() {
    const { firebaseUser } = useAuth();
    const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<Project[]>({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) return [];
            const token = await firebaseUser.getIdToken();
            const projectsData = await fetchProjectsApi(token);
            // Instantiate Project objects
            return projectsData.map(p => new Project(p));
        },
        enabled: !!firebaseUser,
    });

    return { projects: data, isLoading, isError, error, refetch, isRefetching };
}

export function useProject(projectId: string) {
    const { firebaseUser } = useAuth();
    const { data, ...rest } = useQuery<Project>({
        queryKey: projectKeys.detail(projectId),
        queryFn: async () => {
            if (!firebaseUser || !projectId) return null;
            const token = await firebaseUser.getIdToken();
            const projectData = await fetchProjectApi(token, projectId);
            return new Project(projectData);
        },
        enabled: !!firebaseUser && !!projectId,
    });
    return { data, ...rest };
}

export function useSaveProject() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    const { loadProject, project } = useBuilderStore();
    const router = useRouter();

    const createMutation = useMutation({
        mutationFn: (data: ProjectState) => {
            if (!firebaseUser) throw new Error("User not authenticated");
            return firebaseUser.getIdToken().then(token => createProject(data, token));
        },
        onSuccess: (savedProject) => {
            toast({ title: 'Project Created', description: `Successfully created "${savedProject.name}".` });
            loadProject(savedProject);
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            router.push('/builder');
        },
        onError: (error) => {
            toast({ title: 'Error', description: `Failed to create project: ${error.message}`, variant: 'destructive' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: ProjectState) => {
            if (!firebaseUser || !project?.id) throw new Error("User not authenticated or project ID missing");
            return firebaseUser.getIdToken().then(token => updateProject(project.id, data, token));
        },
        onSuccess: (savedProject) => {
            toast({ title: 'Project Saved', description: 'Your changes have been saved.' });
            loadProject(savedProject);
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
            queryClient.setQueryData(projectKeys.detail(savedProject.id), savedProject);
        },
         onError: (error) => {
            toast({ title: 'Error', description: `Failed to save project: ${error.message}`, variant: 'destructive' });
        }
    });

    const saveProject = () => {
        if (!project) return;
        const projectData = project.toStateObject();
        if (project.id) {
            updateMutation.mutate(projectData);
        } else {
            createMutation.mutate(projectData);
        }
    }

    return {
        saveProject,
        isSaving: createMutation.isPending || updateMutation.isPending,
        createMutation,
        updateMutation,
    }
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
        onSuccess: (data, projectId) => {
            toast({ title: 'Project Deleted', description: 'The project has been successfully deleted.' });
            queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
        },
        onError: (error) => {
            toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
        },
    });
}
