
'use client';

import { create } from 'zustand';
import type { AgentProperties } from '@/lib/models';
import { fetchAgentsApi, createAgentApi, updateAgentApi, deleteAgentApi } from '@/services/api/agentService';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase/client-init';

interface AgentResponse {
  prompt: string;
  response: string;
}

type ResponseMap = Record<string, Record<string, AgentResponse[]>>;

interface AgentState {
  agents: AgentProperties[];
  selectedAgent: AgentProperties | null;
  responses: ResponseMap;
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean; // Add a flag to track if initial fetch has happened
  fetchAgents: (token: string) => Promise<void>;
  selectAgent: (agentId: string | null) => void;
  setResponse: (agentId: string, commandId: string, response: AgentResponse) => void;
  clearResponses: (agentId: string, commandId?: string) => void;
  addAgent: (agent: AgentProperties) => void;
  updateAgentInStore: (agent: AgentProperties) => void;
  removeAgentFromStore: (agentId: string) => void;
}

const useAgentStore = create<AgentState>((set, get) => ({
      agents: [],
      selectedAgent: null,
      responses: {},
      isLoading: false, // Start with false, set to true only during fetch
      error: null,
      hasFetched: false, // Initialize as false

      fetchAgents: async (token: string) => {
        // Prevent re-fetching if already fetched or currently fetching
        if (get().hasFetched || get().isLoading) {
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const agents = await fetchAgentsApi(token);
          set({ agents, isLoading: false, hasFetched: true });
        } catch (error: any) {
          set({ error: error.message, isLoading: false, hasFetched: false });
        }
      },

      selectAgent: (agentId) => {
        const agent = get().agents.find(a => a.id === agentId);
        set({ selectedAgent: agent || null });
      },

      setResponse: (agentId, commandId, response) => {
        set(state => {
          const newResponses = { ...state.responses };
          if (!newResponses[agentId]) newResponses[agentId] = {};
          if (!newResponses[agentId][commandId]) newResponses[agentId][commandId] = [];
          newResponses[agentId][commandId].push(response);
          return { responses: newResponses };
        });
      },

      clearResponses: (agentId, commandId) => {
        set(state => {
            const newResponses = { ...state.responses };
            if (newResponses[agentId]) {
              if (commandId) {
                delete newResponses[agentId][commandId];
              } else {
                delete newResponses[agentId];
              }
            }
            return { responses: newResponses };
        });
      },
      
      addAgent: (agent) => set(state => ({ agents: [...state.agents, agent] })),

      updateAgentInStore: (updatedAgent) => set(state => ({
        agents: state.agents.map(a => a.id === updatedAgent.id ? updatedAgent : a),
        selectedAgent: state.selectedAgent?.id === updatedAgent.id ? updatedAgent : state.selectedAgent
      })),

      removeAgentFromStore: (agentId) => set(state => ({
        agents: state.agents.filter(a => a.id !== agentId),
        selectedAgent: state.selectedAgent?.id === agentId ? null : state.selectedAgent
      })),
    })
);

// Initialize auth outside the hook to avoid re-declarations
const auth = getAuth(app);

// This custom hook is now primarily for interacting with the store's actions
// and ensuring the initial data load happens correctly.
export function useAgentManager() {
    const store = useAgentStore();

    useEffect(() => {
        const loadInitialAgents = async () => {
            const user = auth.currentUser;
            if (user && !store.hasFetched) {
                const token = await user.getIdToken();
                await store.fetchAgents(token);
            }
        };

        loadInitialAgents();
    }, [store.hasFetched, store.fetchAgents]);


    const getToken = async () => {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated.");
        return user.getIdToken();
    };

    const createAgent = async (data: Omit<AgentProperties, 'id'>) => {
        const token = await getToken();
        const newAgent = await createAgentApi(data as any, token);
        store.addAgent(newAgent);
        return newAgent;
    };

    const updateAgent = async (id: string, data: Partial<AgentProperties>) => {
        const token = await getToken();
        const updatedAgent = await updateAgentApi(id, data, token);
        store.updateAgentInStore(updatedAgent);
        return updatedAgent;
    };

    const deleteAgent = async (id: string) => {
        const token = await getToken();
        await deleteAgentApi(id, token);
        store.removeAgentFromStore(id);
    };

    return { ...store, createAgent, updateAgent, deleteAgent };
}
