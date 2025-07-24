// code explantion in docs/hooks/use-agents.md

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { agentKeys } from "@/lib/query-keys";
import type {
  Agent,
  UpdateAgentPayload,
  UpdateAgentVariables,
} from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { UseQueryOptions } from "@tanstack/react-query";
import { handleErrorUtility } from "@/lib/errorUtils";
import { getAuthenticatedToken } from "@/lib/authUtils";
import {
  fetchAgent,
  fetchAgents,
  updateAgent as updateAgentApi,
} from "@/services/agent-service";

/**
 * Custom hook to fetch the list of all AI agents.
 * Caches the data and provides loading and error states.
 * Requires admin authentication.
 *
 * @returns An object containing the list of agents, loading status, and error status.
 */
export function useAgents() {
  const { firebaseUser } = useAuth();

  const {
    data: agents,
    isLoading,
    isError,
  } = useQuery<Agent[]>({
    queryKey: agentKeys.lists(),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchAgents(token);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) =>
        handleErrorUtility(error, "Failed to fetch agents"),
    },
  });

  /**
   * Finds and returns a single agent from the cached list by its ID.
   * @param id The ID of the agent to find.
   * @returns The agent object if found, otherwise undefined.
   */
  const getAgent = (id: string): Agent | undefined => {
    return agents?.find((agent) => agent.id === id);
  };

  return { agents: agents || [], isLoaded: !isLoading, isError, getAgent };
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
      return fetchAgent(agentId, token);
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
      queryClient.invalidateQueries({
        queryKey: agentKeys.detail(variables.agentId),
      });

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
