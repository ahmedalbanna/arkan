'use client';

import { create } from 'zustand';
import type { Agent } from '@/types/agent';
import { localAgentService } from '@/services/local-agent-service';
import { initialAgents } from '@/lib/db/seed-data/agents';

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

  // Actions
  loadInitialAgents: () => Promise<void>;
  addAgent: (agent: Agent) => Promise<void>;
  updateAgent: (agent: Agent) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  selectAgent: (agentId: string | null) => void;
  setSelectedCommandId: (commandId: string) => void;
  setResponse: (agentId: string, commandId: string, response: AgentResponse) => void;
  clearResponses: (agentId: string, commandId?: string) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  selectedAgent: null,
  selectedCommandId: null,
  responses: {},

  loadInitialAgents: async () => {
    let agentsFromDb = await localAgentService.getAllAgents();
    if (agentsFromDb.length === 0) {
      // Seed with initial data if DB is empty
      await Promise.all(initialAgents.map(agent => localAgentService.saveAgent(agent)));
      agentsFromDb = await localAgentService.getAllAgents();
    }
    set({ agents: agentsFromDb });
    // Automatically select the first agent if none is selected
    if (!get().selectedAgent && agentsFromDb.length > 0) {
      get().selectAgent(agentsFromDb[0].id);
    }
  },

  addAgent: async (agent) => {
    await localAgentService.saveAgent(agent);
    set(state => ({ agents: [...state.agents, agent] }));
  },

  updateAgent: async (agent) => {
    await localAgentService.saveAgent(agent);
    set(state => ({
      agents: state.agents.map(a => (a.id === agent.id ? agent : a)),
      selectedAgent: state.selectedAgent?.id === agent.id ? agent : state.selectedAgent,
    }));
  },

  deleteAgent: async (agentId) => {
    await localAgentService.deleteAgent(agentId);
    set(state => {
      const newAgents = state.agents.filter(a => a.id !== agentId);
      const newSelectedAgent = state.selectedAgent?.id === agentId ? (newAgents[0] || null) : state.selectedAgent;
      const newSelectedCommandId = newSelectedAgent ? (newSelectedAgent.data.commands[0]?.id || null) : null;
      return {
        agents: newAgents,
        selectedAgent: newSelectedAgent,
        selectedCommandId: newSelectedCommandId,
      };
    });
  },

  selectAgent: (agentId) => {
    if (agentId === null) {
      set({ selectedAgent: null, selectedCommandId: null });
      return;
    }
    const agent = get().agents.find(a => a.id === agentId);
    if (agent) {
      const firstCommandId = agent.data.commands[0]?.id || null;
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
}));
