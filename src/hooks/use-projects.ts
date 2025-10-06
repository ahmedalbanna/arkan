
// code explantion in docs/hooks/use-projects.md

"use client";

import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks";
import { getAuthenticatedToken } from "@/lib/authUtils";
import { projectKeys } from '@/lib/core/query-keys';
import { handleErrorUtility } from "@/lib/errorUtils";
import { Project, type ProjectProperties } from "@/lib/models/project"; // NEW: Import our class
import {
  createProject,
  deleteProject,
  fetchProject as fetchProjectApi,
  fetchProjects as fetchProjectsApi,
  updateProject,
  type ProjectState,
  type SavedProject,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBuilderStore } from "./useBuilderStore";

// Define types for mutation variables
interface UpdateProjectVariables {
  projectId: string;
  data: ProjectState;
}

interface SaveProjectVariables {
  name: string;
  type: 'proposal' | 'report' | 'presentation' | 'academic';
  language: 'ar' | 'en';
  description?: string;
  teamId?: string;
}

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
      return fetchProjectsApi(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch projects");
      },
    },
    // NEW: Transform the raw data into an array of Project instances
    select: (data: SavedProject[]): Project[] => {
      if (!data) return [];
      return data.map(p => new Project(p as ProjectProperties));
    },
  });

  return {
    ...queryInfo,
    // The `data` property from queryInfo is now `Project[] | undefined`
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
      return fetchProjectApi(projectId, token);
    },
    enabled: !!firebaseUser && !!projectId,
    meta: {
      onError: (error: Error) => {
        // معالجة خاصة لأخطاء المشاريع المؤقتة
        if (error.message.includes('Temporary projects are now managed in browser cache')) {
          toast({
            title: "المشروع المؤقت غير متاح",
            description: "المشاريع المؤقتة تُحفظ الآن في المتصفح. يرجى حفظ المشروع أولاً.",
            variant: "destructive",
          });
        } else {
          handleErrorUtility(error, "Failed to fetch project");
        }
      },
    },
    // NEW: Transform the raw data into a Project instance
    select: (data: SavedProject): Project | undefined => {
      if (!data) return undefined;
      return new Project(data as ProjectProperties);
    },
  });
}

export function useSaveProject() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const { setProject, setHasUnsavedChanges } = useBuilderStore(); // Use setProject from the store

  return useMutation<SavedProject, Error, SaveProjectVariables>({
    mutationFn: async (data) => {
      const token = await getAuthenticatedToken(firebaseUser);
      // تحويل SaveProjectVariables إلى CreateProjectData
      const createData = {
        title: data.name,
        type: data.type,
        language: data.language,
        description: data.description,
        teamId: data.teamId,
      };
      return createProject(createData, token);
    },
    onSuccess: (newProjectData) => {
      const newProject = new Project(newProjectData as ProjectProperties);
      // Invalidate the list of projects
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Set the newly created project as the active one in the builder store
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
      return updateProject(variables.projectId, variables.data, token);
    },
    onSuccess: (updatedProjectData) => {
      const updatedProject = new Project(updatedProjectData as ProjectProperties);

      // Invalidate the main project list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });

      // Update the specific project's query data in the cache
      queryClient.setQueryData(projectKeys.detail(updatedProject.id), updatedProjectData);

      // Update the active project in the builder store
      setProject(updatedProject);
      setHasUnsavedChanges(false);

      toast({
        title: "Project Updated",
        description: `Your changes to "${updatedProject.name}" have been saved.`,
      });
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
      await deleteProject(projectId, token);
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
