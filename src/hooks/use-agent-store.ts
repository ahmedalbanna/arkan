'use client';

import { create } from 'zustand';
import { type AgentProperties } from '@/modules/ai/domain/entities/Agent';
import { AgentApiClient } from '@/modules/ai/adapters/api-client/AgentApiClient';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from './util/use-toast';
import { agentKeys } from '@/infrastructure/api/query-keys';
import { getFromCache, saveToCache } from "@/infrastructure/cache/BrowserCache";
import { container } from '@/infrastructure/di/container';

const AGENTS_CACHE_KEY = 'agents-list';

interface AgentState {
  selectedAgentId: string | null;
  responses: Record<string, Record<string, { prompt: string; response: string }[]>>;
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
  setResponse: (agentId, commandId, response) =>
    set((state) => {
      const newResponses = { ...state.responses };
      if (!newResponses[agentId]) newResponses[agentId] = {};
      if (!newResponses[agentId][commandId]) newResponses[agentId][commandId] = [];
      newResponses[agentId][commandId].push(response);
      return { responses: newResponses };
    }),
  clearResponses: (agentId, commandId) =>
    set((state) => {
      const newResponses = { ...state.responses };
      if (newResponses[agentId]) {
        if (commandId) delete newResponses[agentId][commandId];
        else delete newResponses[agentId];
      }
      return { responses: newResponses };
    }),
}));

export function useAgentManager() {
  const { firebaseUser } = useAuth();
  const queryClient = useQueryClient();
  const { selectedAgentId, selectAgent, ...uiState } = useAgentUIState();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: agentKeys.all(),
    queryFn: async () => {
      if (!firebaseUser) return [];
      const client = container.resolve(AgentApiClient);
      const result = await client.fetchAgentsApi();
      if (result.isFailure) throw result.error;
      
      const fetchedAgents = result.getValue();
      saveToCache(AGENTS_CACHE_KEY, fetchedAgents);
      return fetchedAgents;
    },
    initialData: () => getFromCache<AgentProperties[]>(AGENTS_CACHE_KEY),
    enabled: Boolean(firebaseUser),
    staleTime: 1000 * 60 * 5,
  });

  const agents = data || [];

  useEffect(() => {
    if (agents.length > 0 && !agents.find((agent) => agent.id === selectedAgentId)) {
      selectAgent(agents[0]?.id || null);
    }
  }, [agents, selectedAgentId, selectAgent]);

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) || null;

  const createMutation = useMutation({
    mutationFn: async (data: Omit<AgentProperties, 'id'> & { id: string }) => {
      const client = container.resolve(AgentApiClient);
      const result = await client.createAgentApi(data);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: (newAgent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all() });
      selectAgent(newAgent.id);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AgentProperties> }) => {
      const client = container.resolve(AgentApiClient);
      const result = await client.updateAgentApi({ id, data });
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const client = container.resolve(AgentApiClient);
      const result = await client.deleteAgentApi(id);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all() });
      if (selectedAgentId === id) {
        selectAgent(null);
      }
    },
  });

  const createAgent = async (data: Omit<AgentProperties, 'id'> & { id: string }) => {
    try {
      const newAgent = await createMutation.mutateAsync(data);
      toast({ title: 'Agent Created', description: `"${newAgent.name}" has been created.` });
      return newAgent;
    } catch (error: any) {
      toast({ title: 'Creation Failed', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const updateAgent = async (id: string, data: Partial<AgentProperties>) => {
    try {
      const updatedAgent = await updateMutation.mutateAsync({ id, data });
      toast({ title: 'Agent Updated', description: `"${updatedAgent.name}" has been updated.` });
      return updatedAgent;
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Agent Deleted', description: 'The agent has been removed.' });
    } catch (error: any) {
      toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
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
    error: error instanceof Error ? error.message : null,
    createAgent,
    updateAgent,
    deleteAgent,
    fetchAgents,
    ...uiState,
  };
}
