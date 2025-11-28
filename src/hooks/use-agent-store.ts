'use client';

import type { Agent } from '@/types/agent';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AgentResponse {
  prompt: string;
  response: string;
}

// Maps: AgentID -> CommandID -> Responses[]
type ResponseMap = Record<string, Record<string, AgentResponse[]>>;

interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  selectedCommandId: string | null;
  responses: ResponseMap;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadInitialAgents: () => Promise<void>;
  selectAgent: (agentId: string | null) => void;
  setSelectedCommandId: (commandId: string) => void;
  setResponse: (agentId: string, commandId: string, response: AgentResponse) => void;
  clearResponses: (agentId: string, commandId?: string) => void;
}

const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => {
      const loadAgents = async () => {
        try {
          const response = await fetch('/api/agents');
          if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
          }
          const agentsFromApi = await response.json();
          const agents = Array.isArray(agentsFromApi) ? agentsFromApi : [];

          set({
            agents,
            isLoading: false,
            error: null,
          });

          // Auto-select first agent if none selected or if current selection is invalid
          const { selectedAgent } = get();
          if ((!selectedAgent || !agents.some(a => a.id === selectedAgent.id)) && agents.length > 0) {
            get().selectAgent(agents[0].id);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load agents';
          console.error('Error loading agents:', errorMessage);
          set({ agents: [], isLoading: false, error: errorMessage });
        }
      };

      // Automatically load agents when the store is initialized on the client
      if (typeof window !== 'undefined') {
        loadAgents();
      }

      return {
        agents: [],
        selectedAgent: null,
        selectedCommandId: null,
        responses: {},
        isLoading: true,
        error: null,

        loadInitialAgents: async () => {
          if (!get().isLoading) {
            set({ isLoading: true, error: null });
          }
          await loadAgents();
        },

        selectAgent: (agentId) => {
          if (agentId === null) {
            set({ selectedAgent: null, selectedCommandId: null });
            return;
          }
          const agent = get().agents.find(a => a.id === agentId);
          if (agent) {
            const commands = agent.commands || agent.data?.commands || [];
            const firstCommandId = commands[0]?.id || null;
            set({ selectedAgent: agent, selectedCommandId: firstCommandId });
          }
        },

        setSelectedCommandId: (commandId) => {
          set({ selectedCommandId: commandId });
        },

        setResponse: (agentId, commandId, response) => {
          set(state => {
            const newResponses = { ...state.responses };
            if (!newResponses[agentId]) {
              newResponses[agentId] = {};
            }
            if (!newResponses[agentId][commandId]) {
              newResponses[agentId][commandId] = [];
            }
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
      };
    },
    {
      name: 'agent-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedAgent: state.selectedAgent,
        selectedCommandId: state.selectedCommandId,
        responses: state.responses,
      }),
    }
  )
);

export { useAgentStore };
