
// code explantion in docs/hooks/use-agents.md

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, type LucideIcon } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { agentKeys, categoryKeys } from "@/lib/query-keys";
import { type Agent, type AgentPrompt, type AgentKnowledgeSource } from '@/lib/types';
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";
import { type UseQueryOptions } from "@tanstack/react-query";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import {
  fetchAgents as fetchAgentsApi,
  fetchAgent as fetchAgentApi,
  updateAgent as updateAgentApi,
  createAgent as createAgentApi,
  deleteAgent as deleteAgentApi,
  generateAgentConfigApi,
  fetchAgentCategories as fetchAgentCategoriesApi,
  createAgentCategory as createAgentCategoryApi
} from "@/services/agent-service";
import { AgentEditorFormValues } from "@/components/admin/agent-editor/AgentEditor";
import { type UploadedFile } from '@/components/admin/agent-editor/GenerateAgentView';
import { AgentWithComponent, useAgentStore } from "@/hooks/useAgentStore";

export { Agent };
export type UpdateAgentPayload = Partial<AgentEditorFormValues>;


export interface UpdateAgentVariables {
    agentId: string;
    payload: UpdateAgentPayload;
}

export type CreateAgentVariables = Omit<Agent, 'isEnabled' | 'category'> & { category: string; knowledge?: AgentKnowledgeSource[] };

export interface AgentCategory {
    id: string;
    name: string;
}


/**
 * Custom hook to fetch the list of all AI agent categories.
 */
export function useAgentCategories() {
  const { firebaseUser } = useAuth();

  return useQuery<AgentCategory[]>({
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

  return useMutation<AgentCategory, Error, { id: string; name: string }>({
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
 * Custom hook to fetch the list of all AI agents.
 * This hook now acts as a bridge to the `useAgentStore` for components,
 * which handles fetching and caching.
 *
 * @returns An object containing the list of agents, loading status, and error status.
 */
export function useAgents() {
  const { agents, isLoaded, error } = useAgentStore();
  // Convert the store's agent map back to an array and map the icon component
  const agentList = useMemo(() => Object.values(agents).map(a => ({...a, icon: a.iconComponent as LucideIcon})), [agents]);

  return { agents: agentList, isLoaded, isError: !!error };
}


type UseAgentOptions = Omit<
  UseQueryOptions<Agent | null, Error>,
  "queryKey" | "queryFn" | "enabled"
>;

/**
 * Custom hook to fetch a single agent by its ID.
 * @param agentId The ID of the agent to fetch.
 * @param options Optional React Query options to override defaults.
 * @returns The result of the useQuery hook.
 */
export function useAgent(agentId: string, options?: UseAgentOptions) {
  const { firebaseUser } = useAuth();
  return useQuery<Agent | null, Error>({
    queryKey: agentKeys.detail(agentId),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchAgentApi(agentId, token);
    },
    enabled: !!firebaseUser && !!agentId,
    ...options,
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

  return useMutation<Agent, Error, UpdateAgentVariables, { previousAgents: Record<string, AgentWithComponent> }>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateAgentApi(variables, token);
    },
    onMutate: async (newData) => {
        await queryClient.cancelQueries({ queryKey: agentKeys.detail(newData.agentId) });

        // Snapshot the previous value
        const previousAgents = useAgentStore.getState().agents;

        // Optimistically update to the new value
        useAgentStore.setState(state => {
            const agentToUpdate = state.agents[newData.agentId];
            if (!agentToUpdate) return state;

            const { icon: iconName, ...restOfPayload } = newData.payload;
            const updatedAgent = { ...agentToUpdate, ...restOfPayload };

            if (iconName && iconName !== agentToUpdate.icon) {
                updatedAgent.icon = iconName;
                updatedAgent.iconComponent = useAgentStore.getState().getIconComponent(iconName) || FileText;
            }

            return { agents: { ...state.agents, [newData.agentId]: updatedAgent as AgentWithComponent } };
        });

        return { previousAgents };
    },
    onSuccess: (data) => {
      toast({
        title: "Agent Updated",
        description: `Agent "${data.name}" has been successfully updated.`,
      });
    },
    onError: (error, newAgent, context) => {
      // Rollback on error
      if (context?.previousAgents) {
        useAgentStore.setState({ agents: context.previousAgents });
      }
      handleErrorUtility(error, "Update Agent Failed");
    },
    onSettled: (data, error, variables) => {
        // Always refetch after error or success to ensure data consistency
        queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.agentId) });
    }
  });
}

/**
 * Custom mutation hook to create a new agent.
 * @returns The result of the useMutation hook.
 */
export function useCreateAgent() {
    const { firebaseUser } = useAuth();

    return useMutation<Agent, Error, CreateAgentVariables, { previousAgents: Record<string, AgentWithComponent> }>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createAgentApi(variables, token);
        },
        onMutate: async (newAgent) => {
            // Snapshot the previous value from the Zustand store
            const previousAgents = useAgentStore.getState().agents;
            const { getIconComponent } = useAgentStore.getState();

            // Create a temporary agent object for the optimistic update
            const tempAgent: AgentWithComponent = {
                ...newAgent,
                isEnabled: true, // Assume enabled on creation
                iconComponent: getIconComponent(newAgent.icon) || FileText,
            };

            // Optimistically update the store
            useAgentStore.setState(state => ({
                agents: {
                    ...state.agents,
                    [newAgent.id]: tempAgent,
                }
            }));

            return { previousAgents };
        },
        onSuccess: (newAgent) => {
            toast({ title: 'Success', description: 'New AI agent created.' });
        },
        onError: (error, newAgent, context) => {
             // Rollback on error
             if (context?.previousAgents) {
                useAgentStore.setState({ agents: context.previousAgents });
             }
             handleErrorUtility(error, "Create Agent Failed");
             throw error; // Re-throw to be handled by the form
        },
        onSettled: () => {
            // Always refetch after error or success to ensure data consistency
            useAgentStore.getState().fetchAgents();
        }
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
            handleErrorUtility(error, "Delete Agent Failed");
        }
    });
}


export function useGenerateAgentConfig() {
    const { firebaseUser } = useAuth();

    return useMutation({
        mutationFn: async (variables: { prompt: string, includeJsonOutput: boolean, contextFiles: UploadedFile[] }) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return generateAgentConfigApi(variables.prompt, variables.includeJsonOutput, variables.contextFiles, token);
        }
    })
}
