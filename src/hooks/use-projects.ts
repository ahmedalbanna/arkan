
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
  updateProjectApi,
} from "@/services/project-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBuilderStore } from "./useBuilderStore";

// Define types for mutation variables
interface UpdateProjectVariables {
  projectId: string;
  data: Partial<ProjectProperties>; // Allow partial updates
}

// This is essentially the same as ProjectProperties but ensures name is required.
type SaveProjectVariables = Partial<ProjectProperties> & { name: string };

/**
 * Fetches a list of projects and transforms them into Project instances.
 */
export function useProjects() {
  const { firebaseUser } = useAuth();

  return useQuery<Project[], Error, Project[]>({ 
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      const projectsData = await fetchProjectsApi();
      return projectsData.map(p => new Project(p));
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: any) => handleErrorUtility(error, "Failed to fetch projects"),
    },
  });
}

/**
 * Fetches a single project by its ID and transforms it into a Project instance.
 */
export function useProject(projectId: string) {
  const { firebaseUser } = useAuth();
  return useQuery<Project | undefined, Error, Project | undefined>({ 
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      const projectData = await fetchProjectApi(projectId);
      return projectData ? new Project(projectData) : undefined;
    },
    enabled: !!firebaseUser && !!projectId,
    meta: {
      onError: (error: any) => handleErrorUtility(error, "Failed to fetch project"),
    },
  });
}

/**
 * Mutation to save a new project.
 */
export function useSaveProject() {
  const queryClient = useQueryClient();
  const { setHasUnsavedChanges } = useBuilderStore();

  return useMutation<Project, Error, SaveProjectVariables>({
    mutationFn: async (data) => {
        const newProjectData = await createProjectApi(data);
        return new Project(newProjectData);
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(newProject.id), newProject.toJSON());
      setHasUnsavedChanges(false);
      toast({
        title: "Project Saved",
        description: `"${newProject.name}" has been successfully saved.`,
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
  const { setHasUnsavedChanges } = useBuilderStore();

  return useMutation<Project, Error, UpdateProjectVariables>({
    mutationFn: async (variables) => {
        const updatedProjectData = await updateProjectApi(variables.projectId, variables.data);
        return new Project(updatedProjectData);
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject.toJSON());
      setHasUnsavedChanges(false);
    },
    onError: (error) => handleErrorUtility(error, "Save Failed"),
  });
}

/**
 * Mutation to delete a project.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: deleteProjectApi,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      toast({
        title: "Project Deleted",
        description: "The project has been successfully deleted.",
      });
    },
    onError: (error) => handleErrorUtility(error, "Delete Failed"),
  });
}
