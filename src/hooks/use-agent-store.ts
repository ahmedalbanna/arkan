
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AgentProperties } from '@/lib/models';
import { fetchAgentsApi, createAgentApi, updateAgentApi, deleteAgentApi } from '@/services/api/agentService';
import { useAuth } from '@/context/AuthContext';

interface AgentResponse {
  prompt: string;
  response: string;
}

type ResponseMap = Record<string, Record<string, AgentResponse[]>>;

interface AgentState {
  agents: AgentProperties[];
  selectedAgent: AgentProperties | null;
  selectedCommandId: string | null; // This might be deprecated if commands are just guidelines
  responses: ResponseMap;
  isLoading: boolean;
  error: string | null;
  fetchAgents: (token: string) => Promise<void>;
  selectAgent: (agentId: string | null) => void;
  setSelectedCommandId: (commandId: string | null) => void;
  setResponse: (agentId: string, commandId: string, response: AgentResponse) => void;
  clearResponses: (agentId: string, commandId?: string) => void;
  createAgent: (data: Omit<AgentProperties, 'id'>, token: string) => Promise<void>;
  updateAgent: (id: string, data: Partial<AgentProperties>, token: string) => Promise<void>;
  deleteAgent: (id: string, token: string) => Promise<void>;
}

const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agents: [],
      selectedAgent: null,
      selectedCommandId: null,
      responses: {},
      isLoading: true,
      error: null,

      fetchAgents: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const agents = await fetchAgentsApi(token);
          set({ agents, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      selectAgent: (agentId) => {
        const agent = get().agents.find(a => a.id === agentId);
        set({ selectedAgent: agent || null, selectedCommandId: null });
      },

      setSelectedCommandId: (commandId) => {
        set({ selectedCommandId: commandId });
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
      
      createAgent: async (data, token) => {
          const newAgent = await createAgentApi(data, token);
          set(state => ({ agents: [...state.agents, newAgent] }));
      },

      updateAgent: async (id, data, token) => {
          const updatedAgent = await updateAgentApi(id, data, token);
          set(state => ({
              agents: state.agents.map(a => a.id === id ? updatedAgent : a),
              selectedAgent: state.selectedAgent?.id === id ? updatedAgent : state.selectedAgent
          }));
      },

      deleteAgent: async (id, token) => {
          await deleteAgentApi(id, token);
          set(state => ({
              agents: state.agents.filter(a => a.id !== id),
              selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent
          }));
      },
    }),
    {
      name: 'agent-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        selectedAgent: state.selectedAgent,
        selectedCommandId: state.selectedCommandId,
      }),
    }
  )
);

export function useAgentManager() {
    const store = useAgentStore();
    const { firebaseUser } = useAuth();

    const getToken = async () => {
        if (!firebaseUser) throw new Error("User not authenticated.");
        return firebaseUser.getIdToken();
    };

    const createAgent = async (data: Omit<AgentProperties, 'id'>) => {
        const token = await getToken();
        await store.createAgent(data, token);
    };

    const updateAgent = async (id: string, data: Partial<AgentProperties>) => {
        const token = await getToken();
        await store.updateAgent(id, data, token);
    };

    const deleteAgent = async (id: string) => {
        const token = await getToken();
        await store.deleteAgent(id, token);
    };
    
    const fetchAgents = async () => {
        const token = await getToken();
        await store.fetchAgents(token);
    };

    return { ...store, createAgent, updateAgent, deleteAgent, fetchAgents };
}
