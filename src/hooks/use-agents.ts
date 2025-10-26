
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { agentKeys, categoryKeys } from "@/lib/query-keys";
import { Agent, type AgentProperties, AgentCategory, AgentPrompt, AgentKnowledgeSource } from '@/lib/models/agent';
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import {
  fetchAgentApi,
  updateAgentApi,
  createAgentApi,
  deleteAgentApi,
  generateAgentConfigApi,
  fetchAgentCategoriesApi,
  createAgentCategoryApi,
  updateAgentCategoryApi,
  deleteAgentCategoryApi,
  fetchAgentsApi,
} from "@/services";
import { type AgentEditorFormValues } from "@/lib/agent-editor-schema";
import type { UploadedFile } from '@/components/admin/agent-editor/GenerateAgentView';
import { useAgentStore } from "@/hooks/useAgentStore";
import { AgentCategoryDetails } from "@/lib/models/agent";

export { Agent };
export type UpdateAgentVariables = {
  agentId: string;
  payload: AgentEditorFormValues;
};
export type CreateAgentVariables = Omit<AgentProperties, 'isEnabled' | 'category' | 'id' | 'pageUrl'> & { id: string, category: string, pageUrl: string; knowledge?: AgentKnowledgeSource[] };

/**
 * Custom hook to fetch the list of all AI agent categories.
 */
export function useAgentCategories() {
  const { firebaseUser } = useAuth();

  return useQuery<AgentCategoryDetails[]>({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchAgentCategoriesApi(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 15, // 15 minutes
    meta: {
      onError: (error: Error) => handleErrorUtility(error, "Failed to fetch agent categories"),
    },
  });
}

/**
 * Custom mutation hook to create a new agent category.
 */
export function useCreateAgentCategory() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<AgentCategoryDetails, Error, { id: string; name: string }>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return createAgentCategoryApi(variables, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast({ title: "Category Created", description: "The new agent category has been saved." });
    },
    onError: (error) => {
      handleErrorUtility(error, "Failed to create category");
      throw error; // Re-throw for form handling
    },
  });
}

/**
 * Custom mutation hook to update an agent category.
 */
export function useUpdateAgentCategory() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<AgentCategoryDetails, Error, { id: string; name: string }>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return updateAgentCategoryApi(variables, token);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
            toast({ title: "Category Updated", description: `Category "${data.name}" has been saved.`});
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to update category");
        }
    });
}

/**
 * Custom mutation hook to delete an agent category.
 */
export function useDeleteAgentCategory() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<{message: string}, Error, string>({
        mutationFn: async (id) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteAgentCategoryApi(id, token);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
            toast({ title: "Category Deleted", description: data.message });
        },
        onError: (error) => {
            handleErrorUtility(error, "Failed to delete category");
        }
    });
}



/**
 * Fetches a list of all agents.
 * Returns instances of the Agent CLASS.
 */
export function useAgents() {
  const { firebaseUser } = useAuth();

  const queryInfo = useQuery<Agent[]>({
    queryKey: agentKeys.lists(),
    queryFn: async (): Promise<Agent[]> => {
      const token = await getAuthenticatedToken(firebaseUser);
      const data = await fetchAgentsApi(token);
      return data.map(a => new Agent(a as AgentProperties));
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) => {
        handleErrorUtility(error, "Failed to fetch agents");
      },
    },
  });

  return {
    agents: queryInfo.data || [],
    isLoaded: !queryInfo.isLoading,
    isError: queryInfo.isError,
  }
}

/**
 * Custom hook to fetch a single agent by its ID.
 * Returns an instance of the Agent CLASS.
 */
export function useAgent(agentId: string) {
  const { firebaseUser } = useAuth();
  
  return useQuery<Agent | null>({
    queryKey: agentKeys.detail(agentId),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      const data = await fetchAgentApi(agentId, token); 
      if (!data) return null;
      return new Agent(data as AgentProperties);
    },
    enabled: !!firebaseUser && !!agentId,
    meta: {
      onError: (error: Error) =>
        handleErrorUtility(error, `Failed to fetch agent ${agentId}`),
    },
  });
}


/**
 * Custom mutation hook to update an agent's configuration.
 * Handles API calls, cache invalidation, and provides user feedback.
 * @returns The result of the useMutation hook.
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation<AgentProperties, Error, UpdateAgentVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateAgentApi(variables, token);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.agentId) });
      toast({
        title: "Agent Updated",
        description: `Agent "${data.name}" has been successfully updated.`,
      });
    },
    onError: (error) => {
      handleErrorUtility(error, "Update Agent Failed");
    },
  });
}

/**
 * Custom mutation hook to create a new agent.
 * @returns The result of the useMutation hook.
 */
export function useCreateAgent() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<AgentProperties, Error, CreateAgentVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createAgentApi(variables, token);
        },
        onSuccess: (newAgent) => {
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
            toast({ title: 'Success', description: 'New AI agent created.' });
        },
        onError: (error, newAgent, context) => {
             handleErrorUtility(error, "Create Agent Failed");
             throw error; // Re-throw to be handled by the form
        },
    });
}

/**
 * Custom mutation hook to delete an agent.
 * @returns The result of the useMutation hook.
 */
export function useDeleteAgent() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, string>({
        mutationFn: async (agentId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteAgentApi(agentId, token);
        },
        onSuccess: (data, agentId) => {
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
            toast({ title: 'Agent Deleted', description: `Agent "${agentId}" was successfully deleted.` });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, "Delete Failed");
        }
    });
}

export function useGenerateAgentConfig() {
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (variables: { prompt: string, includeJsonOutput: boolean, contextFiles: UploadedFile[] }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateAgentConfigApi(variables, token);
        }
    })
}
