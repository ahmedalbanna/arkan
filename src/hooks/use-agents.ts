
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { agentKeys, categoryKeys } from "@/lib/query-keys";
import { Agent, type AgentProperties } from '@/lib/models/agent';
import { type AgentPrompt, type AgentKnowledgeSource } from '@/lib/types';
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
} from "@/services";
import { type AgentEditorFormValues } from "@/lib/agent-editor-schema";
import type { UploadedFile } from '@/components/admin/agent-editor/GenerateAgentView';
import { useAgentStore } from "@/hooks/useAgentStore";

export { Agent };
export type UpdateAgentVariables = {
  agentId: string;
  payload: AgentEditorFormValues;
};
export type CreateAgentVariables = Omit<import('@/lib/types').Agent, 'isEnabled' | 'category' | 'id'> & { id: string, category: string; knowledge?: AgentKnowledgeSource[] };

/**
 * Custom hook to fetch the list of all AI agent categories.
 */
export function useAgentCategories() {
  const { firebaseUser } = useAuth();

  return useQuery<import('@/lib/types').AgentCategoryDetails[]>({
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

  return useMutation<import('@/lib/types').AgentCategory, Error, { id: string; name: string }>({
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
 * Custom hook to get the list of all AI agents from the central store.
 * Returns an array of Agent CLASS INSTANCES.
 */
export function useAgents() {
  const { agents, isLoaded, error } = useAgentStore();

  const agentList = useMemo(() =>
    Object.values(agents).map(a => new Agent(a as AgentProperties)),
    [agents]
  );

  return { agents: agentList, isLoaded, isError: !!error };
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
  const { fetchAgents } = useAgentStore.getState();

  return useMutation<import('@/lib/types').Agent, Error, UpdateAgentVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateAgentApi(variables, token);
    },
    onSuccess: (data) => {
      toast({
        title: "Agent Updated",
        description: `Agent "${data.name}" has been successfully updated.`,
      });
      // Instead of invalidating, trigger a refetch of the store.
      fetchAgents();
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
    const { firebaseUser } = useAuth();
    const { fetchAgents } = useAgentStore.getState();

    return useMutation<import('@/lib/types').Agent, Error, CreateAgentVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createAgentApi(variables, token);
        },
        onSuccess: (newAgent) => {
            toast({ title: 'Success', description: 'New AI agent created.' });
            // Trigger a refetch of the store data.
            fetchAgents();
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
    const { firebaseUser } = useAuth();
    const { fetchAgents } = useAgentStore.getState();

    return useMutation<any, Error, string>({
        mutationFn: async (agentId: string) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return deleteAgentApi(agentId, token);
        },
        onSuccess: (data, agentId) => {
            toast({ title: 'Agent Deleted', description: `Agent "${agentId}" was successfully deleted.` });
            fetchAgents(); // Refetch the store data
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
