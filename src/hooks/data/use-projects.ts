'use client';

import { toast } from '@/hooks/util/use-toast';
import { projectKeys } from '@/lib/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBuilderStore } from '../core/useBuilderStore';
import { useAuth } from '@/context/AuthContext';
import { LocalProjectService } from '@/modules/projects/adapters/local-storage/LocalProjectService';
import { ProjectApiClient } from '@/modules/projects/adapters/api-client/ProjectApiClient';
import { Project, type ProjectProperties } from '@/modules/projects/domain/entities/Project';
import { container } from '@/infrastructure/di/container';

export function useProjects() {
  const { firebaseUser } = useAuth();
  const projectScope = firebaseUser?.uid ?? 'anonymous';

  const { data, ...rest } = useQuery<Project[]>({
    queryKey: projectKeys.lists(projectScope),
    queryFn: async () => {
      if (!firebaseUser) {
        return [];
      }

      try {
        const client = container.resolve(ProjectApiClient);
        const result = await client.fetchProjects();
        if (result.isFailure) throw result.error;
        
        const serverProjects = result.getValue();
        const localService = container.resolve(LocalProjectService);
        const mergedProjects = serverProjects.map((project) => new Project(project));

        mergedProjects.forEach((project) => {
          localService.saveProject(project.toStateObject());
        });

        return mergedProjects;
      } catch (error) {
        console.warn('Could not sync with server, using local projects.', error);
        const localService = container.resolve(LocalProjectService);
        const localProjects = await localService.getAllProjects();
        return localProjects.map((project: ProjectProperties) => new Project(project));
      }
    },
    enabled: Boolean(firebaseUser),
  });

  return { projects: data, projectScope, ...rest };
}

export function useSaveProject() {
  const queryClient = useQueryClient();
  const { setHasUnsavedChanges } = useBuilderStore();
  const { firebaseUser } = useAuth();
  const projectScope = firebaseUser?.uid ?? 'anonymous';

  const saveProjectMutation = useMutation({
    mutationFn: async (projectData: ProjectProperties) => {
      if (!navigator.onLine || !firebaseUser) {
        toast({
          title: 'Offline',
          description: 'You are offline. Please connect to the internet to save the project.',
          variant: 'destructive',
        });
        throw new Error('User is offline.');
      }

      const client = container.resolve(ProjectApiClient);
      const result = await client.saveProject(projectData);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: (savedProject) => {
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(projectScope) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectScope, savedProject.id ?? '') });
      toast({ title: 'Project Saved', description: `"${savedProject.name}" has been saved to the cloud.` });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Failed to save project.';
      toast({ title: 'Error', description: `Failed to save project: ${description}`, variant: 'destructive' });
    },
  });

  return {
    saveProjectMutation,
    isSaving: saveProjectMutation.isPending,
  };
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const projectScope = firebaseUser?.uid ?? 'anonymous';

  return useMutation({
    mutationFn: async (projectId: string) => {
      const localService = container.resolve(LocalProjectService);
      const localDelete = localService.deleteProject(projectId);

      if (navigator.onLine && firebaseUser) {
        try {
          const client = container.resolve(ProjectApiClient);
          const result = await client.deleteProject(projectId);
          if (result.isFailure) throw result.error;
        } catch (error) {
          console.error('Failed to delete from server:', error);
        }
      }

      await localDelete;
      return projectId;
    },
    onSuccess: (projectId) => {
      toast({ title: 'Project Deleted', description: 'The project has been successfully deleted.' });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(projectScope) });
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectScope, projectId) });
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : 'Delete failed.';
      toast({ title: 'Delete Failed', description, variant: 'destructive' });
    },
  });
}
