
// code explantion in docs/hooks/use-projects.md

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { projectKeys } from "@/lib/query-keys";
import { useAuth } from "@/context/AuthContext";
import {
  fetchProjects as fetchProjectsApi,
  fetchProject as fetchProjectApi,
  createProject,
  deleteProject,
  updateProject,
  type SavedProject,
  subscribeToProjects,
} from "@/services/project-service";
import { useBuilderStore } from "./useBuilderStore";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { type ProjectState } from "@/services/project-service";
import { useEffect } from "react";


// Define types for mutation variables
interface UpdateProjectVariables {
  projectId: string;
  data: ProjectState;
}

type SaveProjectVariables = ProjectState & { name: string };

export function useProjects() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!firebaseUser) {
        // Clear the cache if the user logs out
        queryClient.setQueryData(projectKeys.lists(), []);
        return;
    };

    const unsubscribe = subscribeToProjects(firebaseUser.uid, (projects) => {
        queryClient.setQueryData(projectKeys.lists(), projects);
    });

    return () => unsubscribe();
  }, [firebaseUser, queryClient]);


  return useQuery<SavedProject[]>({
    queryKey: projectKeys.lists(),
    queryFn: async () => {
      // The initial fetch is still useful for server rendering or if the listener is slow.
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchProjectsApi(token);
    },
    enabled: !!firebaseUser,
    staleTime: Infinity, // Data is now real-time, so it's always "fresh"
    meta: {
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch projects");
      },
    },
  });
}

export function useProject(projectId: string) {
  const { firebaseUser } = useAuth();
  return useQuery<SavedProject>({
    queryKey: projectKeys.detail(projectId),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchProjectApi(projectId, token);
    },
    enabled: !!firebaseUser && !!projectId,
    meta: {
      // Add this meta property
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch project");
      },
    },
  });
}

export function useSaveProject() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const setCurrentProjectId = useBuilderStore(
    (state) => state.setCurrentProjectId
  );
  const setHasUnsavedChanges = useBuilderStore(
    (state) => state.setHasUnsavedChanges
  );

  return useMutation<SavedProject, Error, SaveProjectVariables>({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return createProject(data, token);
    },
    onSuccess: (newProject) => {
      // Invalidation is handled by the real-time listener now.
      // We can manually update the cache for an even faster UI response if desired.
      queryClient.setQueryData(projectKeys.lists(), (old: SavedProject[] | undefined) => [...(old || []), newProject]);
      setCurrentProjectId(newProject.id); // Set the ID in the store for subsequent saves
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
  const setHasUnsavedChanges = useBuilderStore(
    (state) => state.setHasUnsavedChanges
  );

  return useMutation<SavedProject, Error, UpdateProjectVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateProject(variables.projectId, variables.data, token);
    },
    onSuccess: (updatedProject) => {
       // Invalidation is handled by the real-time listener now.
       // We can manually update the specific project detail for a faster UI response.
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProject);
      setHasUnsavedChanges(false);
      // No toast needed for autosave, it would be too noisy.
    },
    onError: (error: Error) => {
      handleErrorUtility(error, "Autosave Failed");
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<void, Error, string>({
    mutationFn: async (projectId) => {
      const token = await getAuthenticatedToken(firebaseUser);
      await deleteProject(projectId, token);
    },
    onSuccess: (_, projectId) => {
      // Invalidation is handled by the real-time listener.
      // We can manually remove from the cache for a faster UI response.
      queryClient.setQueryData(projectKeys.lists(), (old: SavedProject[] | undefined) => old?.filter(p => p.id !== projectId) || []);
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
