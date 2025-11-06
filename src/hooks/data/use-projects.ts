
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectKeys } from '@/lib/query-keys';
import { localProjectService } from '@/services/local-project-service';
import type { ProjectProperties } from '@/lib/models';
import { useBuilderStore } from '../core/useBuilderStore';
import { toast } from '@/hooks/util/use-toast';
import { Project } from '@/lib/models'; // Import the Project class

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
    const { loadProject, project } = useBuilderStore();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (data: ProjectProperties) => {
            return localProjectService.saveProject(data);
        },
        onSuccess: (savedProject) => {
            toast({ title: 'Project Saved', description: 'Your changes have been saved locally.' });
            loadProject(savedProject);
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            queryClient.setQueryData(projectKeys.detail(savedProject.id!), new Project(savedProject));
        },
        onError: (error) => {
            toast({ title: 'Error', description: `Failed to save project: ${error.message}`, variant: 'destructive' });
        }
    });

    const saveProject = () => {
        if (!project) return;
        const projectData = project.toStateObject();
        mutation.mutate(projectData);
    }

    return {
        saveProject,
        isSaving: mutation.isPending,
        mutation,
    }
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
