
// code explantion in docs/hooks/use-agents.md

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { agentKeys } from "@/lib/query-keys";
import { AGENTS as defaultAgents, type Agent, type AgentData, type AgentPrompt, type AgentKnowledgeSource } from '@/lib/agents';
import { useAuth } from "@/context/AuthContext";
import { UseQueryOptions } from "@tanstack/react-query";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import {
  fetchAgents,
  fetchAgent as fetchAgentApi,
  updateAgent as updateAgentApi,
  createAgent as createAgentApi,
  deleteAgent as deleteAgentApi,
  generateAgentConfigApi
} from "@/services/agent-service";
import { AgentEditorFormValues } from "@/components/admin/agent-editor/AgentEditor";
import { UploadedFile } from '@/components/admin/agent-editor/GenerateAgentView';

export { Agent };
export type UpdateAgentPayload = Partial<AgentEditorFormValues>;


export interface UpdateAgentVariables {
    agentId: string;
    payload: UpdateAgentPayload;
}

export type CreateAgentVariables = Omit<AgentData, 'isEnabled'> & { knowledge?: AgentKnowledgeSource[] };


/**
 * Custom hook to fetch the list of all AI agents.
 * Caches the data and provides loading and error states.
 * For regular users, it returns the static default agents.
 * For admin users, it fetches the latest configurations from the database.
 *
 * @returns An object containing the list of agents, loading status, and error status.
 */
export function useAgents() {
  const { firebaseUser, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const {
    data: agents,
    isLoading,
    isError,
  } = useQuery<Agent[]>({
    queryKey: agentKeys.lists(),
    queryFn: async () => {
      // Admins fetch from the API to get the latest editable data
      if (isAdmin) {
          const token = await getAuthenticatedToken(firebaseUser);
          return fetchAgents(token);
      }
      // Regular users get the static default agent configurations
      return Promise.resolve(defaultAgents);
    },
    enabled: !!firebaseUser, // Only run when the user is known
    staleTime: isAdmin ? 1000 * 60 * 5 : Infinity, // Cache forever for regular users, 5 mins for admins
    meta: {
      onError: (error: Error) => {
        if(isAdmin) {
            handleErrorUtility(error, "Failed to fetch agents");
        }
        // Don't show error for regular users, as they have a fallback.
      }
    },
  });

  return { agents: agents || defaultAgents, isLoaded: !isLoading, isError };
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

  return useMutation<Agent, Error, UpdateAgentVariables>({
    mutationFn: async (variables) => {
      const token = await getAuthenticatedToken(firebaseUser);
      return updateAgentApi(variables, token);
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.agentId) });


      toast({
        title: "Agent Updated",
        description: `Agent "${data.name}" has been successfully updated.`,
      });
    },
    onError: (error: Error) => {
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

    return useMutation<Agent, Error, CreateAgentVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return createAgentApi(variables, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
            toast({ title: 'Success', description: 'New AI agent created.' });
        },
        onError: (error: Error) => {
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


