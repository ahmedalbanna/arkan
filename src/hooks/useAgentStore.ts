
import { create } from 'zustand';
import { fetchAgentsApi } from '@/services'; // NEW: Import the API service
import { getAuthenticatedToken } from '@/lib/authUtils'; // NEW: Import auth util
import { auth } from '@/lib/firebase/client-init'; // NEW: Import Firebase auth
import type { AgentProperties } from '@/lib/models/agent';

export interface AgentWithComponent extends AgentProperties {
  id: string;
}

interface AgentState {
  agents: Record<string, AgentWithComponent>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>; // Make it async
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: {},
  isLoaded: false,
  isLoading: false,
  error: null,
  fetchAgents: async () => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const user = auth.currentUser;
      const token = await getAuthenticatedToken(user);
      const fetchedAgents = await fetchAgentsApi(token);

      const agentMap = fetchedAgents.reduce((acc, agent) => {
        acc[agent.id] = agent as AgentWithComponent;
        return acc;
      }, {} as Record<string, AgentWithComponent>);

      set({ agents: agentMap, isLoaded: true, isLoading: false });
    } catch (e: any) {
      console.error("Error fetching agents:", e);
      set({ isLoaded: false, isLoading: false, error: e.message });
    }
  },
}));

// Automatically fetch agents when the store is initialized for the first time.
useAgentStore.getState().fetchAgents();
