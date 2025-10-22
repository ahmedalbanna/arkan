
"use client";

import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks";
import { handleErrorUtility } from "@/lib/errorUtils";
import { Project, type ProjectProperties } from "@/lib/models/project";
import { projectKeys } from "@/lib/query-keys";
import {
  createProjectApi,
  deleteProjectApi,
  fetchProjectApi,
  fetchProjectsApi,
  updateProjectApi, // Renamed for clarity to avoid conflict
  type SavedProject,
} from "@/services/project-service"; // Corrected import path
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBuilderStore } from "./useBuilderStore";

// Define types for mutation variables
interface UpdateProjectVariables {
  projectId: string;
  data: Partial<ProjectProperties>; // Allow partial updates
}

type SaveProjectVariables = ProjectProperties & { name: string };

/**
 * Fetches a list of projects.
 * Relies on authenticatedFetch within the service layer for auth.
 */
export function useProjects() {
  const { firebaseUser } = useAuth();

  const queryInfo = useQuery<Project[], Error, SavedProject[]>({ 
    queryKey: projectKeys.lists(),
    queryFn: fetchProjectsApi, // No token needed here
    enabled: !!firebaseUser, // Query is enabled only when firebaseUser is available
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) => handleErrorUtility(error, "Failed to fetch projects"),
    },
    select: (data) => data.map(p => new Project(p as ProjectProperties)),
  });

  return {
    ...queryInfo,
    projects: queryInfo.data ?? [], // Ensure it's always an array
  }
}

/**
 * Fetches a single project by its ID.
 */
export function useProject(projectId: string) {
  const { firebaseUser } = useAuth();
  return useQuery<Project | undefined, Error, SavedProject>({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => fetchProjectApi(projectId), // Pass projectId directly
    enabled: !!firebaseUser && !!projectId,
    meta: {
      onError: (error) => handleErrorUtility(error, "Failed to fetch project"),
    },
    select: (data) => data ? new Project(data as ProjectProperties) : undefined,
  });
}

/**
 * Mutation to save a new project.
 */
export function useSaveProject() {
  const queryClient = useQueryClient();
  const { loadProject, setHasUnsavedChanges } = useBuilderStore();

  return useMutation<SavedProject, Error, SaveProjectVariables>({
    mutationFn: createProjectApi, // No token needed
    onSuccess: (newProjectData) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      loadProject(newProjectData);
      setHasUnsavedChanges(false);
      toast({
        title: "Project Saved",
        description: `"${newProjectData.name}" has been successfully saved.`,
      });
    },
    onError: (error) => handleErrorUtility(error, "Save Failed"),
  });
}

/**
 * Mutation to update an existing project.
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { loadProject, setHasUnsavedChanges } = useBuilderStore();

  return useMutation<SavedProject, Error, UpdateProjectVariables>({
    mutationFn: (variables) => updateProjectApi(variables.projectId, variables.data),
    onSuccess: (updatedProjectData) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(updatedProjectData.id), updatedProjectData);
      loadProject(updatedProjectData);
      setHasUnsavedChanges(false);
      // No toast for autosave to prevent noise.
    },
    onError: (error) => handleErrorUtility(error, "Save Failed"),
  });
}

/**
 * Mutation to delete a project.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteProjectApi, // The project ID is passed directly
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Also remove the specific project from the cache
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      toast({
        title: "Project Deleted",
        description: "The project has been successfully deleted.",
      });
    },
    onError: (error) => handleErrorUtility(error, "Delete Failed"),
  });
}
