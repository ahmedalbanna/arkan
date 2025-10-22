
"use client";

import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { handleErrorUtility } from "@/lib/errorUtils";
import { Project, type ProjectProperties } from "@/lib/models/project";
import { projectKeys } from "@/lib/query-keys";
import {
  createProject,
  deleteProject,
  fetchProject as fetchProjectApi,
  fetchProjects as fetchProjectsApi,
  updateProject,
  type SavedProject,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBuilderStore } from "./useBuilderStore";

// Define types for mutation variables
interface UpdateProjectVariables {
  projectId: string;
  data: ProjectProperties;
}

type SaveProjectVariables = ProjectProperties & { name: string };

/**
 * Fetches a list of projects.
 * Returns instances of the Project CLASS.
 */
export function useProjects() {
  const { firebaseUser } = useAuth();

  const queryInfo = useQuery({
    queryKey: projectKeys.lists(),
    queryFn: async (): Promise<SavedProject[]> => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchProjectsApi({ token });
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch projects");
      },
    },
    select: (data: SavedProject[]): Project[] => {
      if (!data) return [];
      return data.map(p => new Project(p as ProjectProperties));
    },
  });

  return {
    ...queryInfo,
    projects: queryInfo.data,
  }
}

/**
 * Fetches a single project by its ID.
 * Returns an instance of the Project CLASS.
 */
export function useProject(projectId: string) {
  const { firebaseUser } = useAuth();
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: async (): Promise<SavedProject> => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchProjectApi({ projectId, token });
    },
    enabled: !!firebaseUser && !!projectId,
    meta: {
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch project");
      },
    },
    select: (data: SavedProject): Project | undefined => {
      if (!data) return undefined;
      return new Project(data as ProjectProperties);
    },
  });
}

export function useSaveProject() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const { setProject, setHasUnsavedChanges } = useBuilderStore();

  return useMutation<SavedProject, Error, SaveProjectVariables>({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return createProject({ ...data, token });
    },
    onSuccess: (newProjectData) => {
      const newProject = new Project(newProjectData as ProjectProperties);
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      setProject(newProject);
      setHasUnsavedChanges(false);
      toast({
        title: "Project Saved",
        description: `"${newProject.name}" has been successfully saved.`,
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Save Failed");
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const { setProject, setHasUnsavedChanges } = useBuilderStore();

  return useMutation<SavedProject, Error, UpdateProjectVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateProject({ projectId: variables.projectId, data: variables.data, token });
    },
    onSuccess: (updatedProjectData) => {
      const updatedProject = new Project(updatedProjectData as ProjectProperties);
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProjectData);
      setProject(updatedProject);
      setHasUnsavedChanges(false);
      // No toast for autosave to prevent noise.
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Save Failed");
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<void, Error, string>({
    mutationFn: async (projectId) => {
      const token = await getAuthenticatedToken(firebaseUser);
      await deleteProject({ projectId, token });
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast({
        title: "Project Deleted",
        description: "The project has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Delete Failed");
    },
  });
}
