
import { create } from 'zustand';
import { db } from '@/lib/firebase/client-init';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { AgentProperties } from '@/lib/models/agent';

export interface AgentWithComponent extends AgentProperties {
  id: string;
}

interface AgentState {
  agents: Record<string, AgentWithComponent>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchAgents: () => void;
}

let unsubscribe: (() => void) | null = null;

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: {},
  isLoaded: false,
  isLoading: false,
  error: null,
  fetchAgents: () => {
    const { isLoading, isLoaded } = get();
    // Prevent re-fetching if already loading.
    // Allow re-fetching if already loaded to get fresh data.
    if (isLoading) return;

    set({ isLoading: true, error: null });

    // If a listener is already active, unsubscribe first.
    if (unsubscribe) {
      unsubscribe();
    }

    try {
      const agentsCollectionRef = collection(db, 'agents');
      const q = query(agentsCollectionRef, where("isEnabled", "==", true));

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedAgents: Record<string, AgentWithComponent> = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<AgentWithComponent, 'id'>;
          const agent: AgentWithComponent = {
            id: doc.id,
            ...data,
          };
          fetchedAgents[doc.id] = agent;
        });
        set({ agents: fetchedAgents, isLoaded: true, isLoading: false });
      }, (error) => {
        console.error("Error fetching agents with real-time listener:", error);
        set({ isLoaded: false, isLoading: false, error: error.message });
      });
    } catch (e: any) {
      console.error("Error setting up agent listener:", e);
      set({ isLoaded: false, isLoading: false, error: e.message });
    }
  },
}));

// Automatically fetch agents when the store is initialized
useAgentStore.getState().fetchAgents();
