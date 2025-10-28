
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { agentKeys, categoryKeys } from '@/lib/query-keys';
import {
    fetchAgentsApi,
    fetchAgentCategoriesApi,
    createAgentCategoryApi,
    updateAgentCategoryApi,
    deleteAgentCategoryApi,
    fetchAgentApi,
    updateAgentApi,
    createAgentApi,
    deleteAgentApi,
    generateAgentConfigApi,
    importAgentsApi
} from '@/services/api/agentService';
import { toast } from '@/hooks/util/use-toast';
import type { Agent, AgentProperties, AgentCategoryDetails, CreateAgentVariables, UpdateAgentVariables, UploadedFile } from '@/lib/types';
import { GenerateAgentConfigOutput } from '@/ai/schemas';

// ============================================================================
// Agent Category Queries & Mutations
// ============================================================================

/**
 * Fetches all agent categories.
 */
export function useAgentCategories() {
    const { firebaseUser } = useAuth();
    return useQuery<AgentCategoryDetails[]>({
        queryKey: categoryKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchAgentCategoriesApi(token);
        },
        enabled: !!firebaseUser,
        staleTime: Infinity, // Categories rarely change
    });
}

/**
 * Mutation hook for creating a new agent category.
 */
export function useCreateAgentCategory() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (data: { id: string; name: string }) => {
            if (!firebaseUser) throw new Error("Admin not authenticated");
            const token = await firebaseUser.getIdToken();
            return createAgentCategoryApi(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
        },
        onError: (error: any) => {
            toast({ title: 'Creation Failed', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
        }
    });
}

/**
 * Mutation hook for updating an agent category.
 */
export function useUpdateAgentCategory() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (data: { id: string; name: string }) => {
            if (!firebaseUser) throw new Error("Admin not authenticated");
            const token = await firebaseUser.getIdToken();
            return updateAgentCategoryApi(data, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
        },
         onError: (error: any) => {
            toast({ title: 'Update Failed', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
        }
    });
}

/**
 * Mutation hook for deleting an agent category.
 */
export function useDeleteAgentCategory() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (id: string) => {
            if (!firebaseUser) throw new Error("Admin not authenticated");
            const token = await firebaseUser.getIdToken();
            return deleteAgentCategoryApi(id, token);
        },
        onSuccess: () => {
            toast({ title: 'Category Deleted' });
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
        },
        onError: (error: any) => {
            toast({ title: 'Delete Failed', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
        }
    });
}


// ============================================================================
// Agent Queries & Mutations
// ============================================================================

/**
 * Fetches all agents from the API.
 */
export function useAgents() {
    const { firebaseUser } = useAuth();
    const { data: agents, isPending: isLoading, isError, isFetched: isLoaded, ...rest } = useQuery<Agent[]>({
        queryKey: agentKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) return [];
            const token = await firebaseUser.getIdToken();
            return fetchAgentsApi(token);
        },
        enabled: !!firebaseUser,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return { agents: agents || [], isLoaded, isLoading, isError, ...rest };
}

/**
 * Fetches the configuration for a single agent.
 */
export function useAgent(agentId: string) {
    const { firebaseUser } = useAuth();
    return useQuery<Agent | null>({
        queryKey: agentKeys.detail(agentId),
        queryFn: async () => {
            if (!firebaseUser) return null;
            const token = await firebaseUser.getIdToken();
            return fetchAgentApi(agentId, token);
        },
        enabled: !!firebaseUser && !!agentId,
    });
}

/**
 * Mutation hook for updating an agent's configuration.
 */
export function useUpdateAgent() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (variables: UpdateAgentVariables) => {
            if (!firebaseUser) throw new Error("Admin not authenticated");
            const token = await firebaseUser.getIdToken();
            return updateAgentApi(variables, token);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: agentKeys.detail(variables.agentId) });
            toast({ title: "Agent Updated", description: `Successfully updated "${data.name}".` });
        },
        onError: (error: any) => {
            toast({ title: "Update Failed", description: error.message, variant: 'destructive' });
        },
    });
}

/**
 * Mutation hook for creating a new agent.
 */
export function useCreateAgent(options?: { onSuccess?: (data: AgentProperties) => void }) {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  return useMutation({
    mutationFn: async (data: CreateAgentVariables) => {
      if (!firebaseUser) throw new Error("Admin not authenticated");
      const token = await firebaseUser.getIdToken();
      return createAgentApi(data, token);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
      toast({ title: "Agent Created", description: `Successfully created agent "${data.name}".` });
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      toast({ title: "Creation Failed", description: error.message || 'Could not create agent.', variant: "destructive" });
    },
  });
}

/**
 * Mutation hook for deleting an agent.
 */
export function useDeleteAgent() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (agentId: string) => {
            if (!firebaseUser) throw new Error("Admin not authenticated");
            const token = await firebaseUser.getIdToken();
            return deleteAgentApi(agentId, token);
        },
        onSuccess: (data, agentId) => {
            toast({ title: "Agent Deleted", description: `Successfully deleted agent.` });
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
            queryClient.removeQueries({ queryKey: agentKeys.detail(agentId) });
        },
        onError: (error: any) => {
            toast({ title: "Delete Failed", description: error.message, variant: 'destructive' });
        }
    });
}


/**
 * Mutation hook for generating an agent configuration from a prompt.
 */
export function useGenerateAgentConfig() {
    const { firebaseUser } = useAuth();
    return useMutation<GenerateAgentConfigOutput, Error, { prompt: string, includeJsonOutput: boolean, contextFiles: UploadedFile[] }>({
        mutationFn: async (variables) => {
            if (!firebaseUser) throw new Error("Admin not authenticated");
            const token = await firebaseUser.getIdToken();
            return generateAgentConfigApi(variables, token);
        }
    });
}

/**
 * Mutation hook for importing a list of agents.
 */
export function useImportAgents() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (agents: AgentProperties[]) => {
            if (!firebaseUser) throw new Error("Admin not authenticated");
            const token = await firebaseUser.getIdToken();
            return importAgentsApi(agents, token);
        },
        onSuccess: (data) => {
            toast({ title: 'Import Successful', description: `Successfully imported ${data.count} agents.`});
            queryClient.invalidateQueries({ queryKey: agentKeys.lists() });
        },
        onError: (error: any) => {
            toast({ title: 'Import Failed', description: error.message, variant: 'destructive' });
        }
    });
}
