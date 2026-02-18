
'use client';

import { create } from 'zustand';
import type { AgentProperties } from '@/lib/models';
import { fetchAgentsApi, createAgentApi, updateAgentApi, deleteAgentApi } from '@/services/api/agentService';
import { useAuth } from '@/context/NextAuthContext';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from './util/use-toast';
import { agentKeys } from '@/lib/query-keys';
import { getFromCache, saveToCache } from '@/lib/utils/cache';

const AGENTS_CACHE_KEY = 'agents-list';

interface AgentState {
  selectedAgentId: string | null;
  responses: Record<string, Record<string, { prompt: string; response: string }[]>>;
  // Keeping selectedCommandId for now to avoid breaking other parts, but it's deprecated
  selectedCommandId: string | null; 
  selectAgent: (agentId: string | null) => void;
  setSelectedCommandId: (commandId: string | null) => void;
  setResponse: (agentId: string, commandId: string, response: { prompt: string; response: string }) => void;
  clearResponses: (agentId: string, commandId?: string) => void;
}

const useAgentUIState = create<AgentState>((set) => ({
  selectedAgentId: null,
  responses: {},
  selectedCommandId: null,
  selectAgent: (agentId) => set({ selectedAgentId: agentId, selectedCommandId: null, responses: {} }),
  setSelectedCommandId: (commandId) => set({ selectedCommandId: commandId }),
  setResponse: (agentId, commandId, response) => set((state) => {
    const newResponses = { ...state.responses };
    if (!newResponses[agentId]) newResponses[agentId] = {};
    if (!newResponses[agentId][commandId]) newResponses[agentId][commandId] = [];
    newResponses[agentId][commandId].push(response);
    return { responses: newResponses };
  }),
  clearResponses: (agentId, commandId) => set((state) => {
    const newResponses = { ...state.responses };
    if (newResponses[agentId]) {
      if (commandId) delete newResponses[agentId][commandId];
      else delete newResponses[agentId];
    }
    return { responses: newResponses };
  }),
}));

export function useAgentManager() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const {
    selectedAgentId,
    selectAgent,
    ...uiState
  } = useAgentUIState();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: agentKeys.all,
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      const token = session.user.id;
      const fetchedAgents = await fetchAgentsApi(token);
      saveToCache(AGENTS_CACHE_KEY, fetchedAgents);
      return fetchedAgents;
    },
    initialData: () => {
        // Try to get data from cache first
        const cachedAgents = getFromCache<AgentProperties[]>(AGENTS_CACHE_KEY);
        return cachedAgents;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // Data is stale after 5 minutes
  });

  const agents = data || [];

  useEffect(() => {
    if (agents.length > 0 && !agents.find(a => a.id === selectedAgentId)) {
      selectAgent(agents[0]?.id || null);
    }
  }, [agents, selectedAgentId, selectAgent]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || null;

  const createMutation = useMutation({
    mutationFn: async (data: Omit<AgentProperties, 'id'>) => {
        if (!session?.user?.id) throw new Error("Not authenticated");
        const token = session.user.id;
        // The API now expects the `id` in the body
        return createAgentApi(data as any, token);
    },
    onSuccess: (newAgent) => {
        queryClient.invalidateQueries({ queryKey: agentKeys.all });
        selectAgent(newAgent.id);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<AgentProperties> }) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      const token = session.user.id;
      return updateAgentApi(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      const token = session.user.id;
      return deleteAgentApi(id, token);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      if (selectedAgentId === id) {
        selectAgent(null);
      }
    }
  });

  const createAgent = async (data: Omit<AgentProperties, 'id'> & { id: string }) => {
    try {
      const newAgent = await createMutation.mutateAsync(data);
      toast({ title: "Agent Created", description: `"${newAgent.name}" has been created.` });
      return newAgent;
    } catch (error: any) {
      toast({ title: "Creation Failed", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const updateAgent = async (id: string, data: Partial<AgentProperties>) => {
    try {
      const updatedAgent = await updateMutation.mutateAsync({ id, data });
      toast({ title: "Agent Updated", description: `"${updatedAgent.name}" has been updated.` });
      return updatedAgent;
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Agent Deleted", description: "The agent has been removed." });
    } catch (error: any) {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
      throw error;
    }
  };
  
  const fetchAgents = () => {
    refetch();
  };

  return {
    agents,
    selectedAgent,
    selectAgent,
    isLoading,
    error: error?.message || null,
    createAgent,
    updateAgent,
    deleteAgent,
    fetchAgents,
    ...uiState,
  };
}
