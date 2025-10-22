
import { create } from 'zustand';
import { db } from '@/lib/firebase/client-init';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { AgentProperties } from '@/lib/models/agent';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export interface AgentWithComponent extends AgentProperties {
  id: string;
}

interface AgentState {
  agents: Record<string, AgentWithComponent>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AgentActions {
    fetchAgents: () => void;
    reset: () => void;
}

let unsubscribe: (() => void) | null = null;

const initialState: AgentState = {
    agents: {},
    isLoaded: false,
    isLoading: false,
    error: null,
};

export const useAgentStore = create<AgentState & AgentActions>((set, get) => ({
    ...initialState,
    fetchAgents: () => {
        const { isLoading, isLoaded } = get();
        if (isLoading || isLoaded) return; // Prevent re-fetching

        set({ isLoading: true, error: null });

        if (unsubscribe) unsubscribe(); // Ensure no lingering listeners

        try {
            const agentsCollectionRef = collection(db, 'agents');
            const q = query(agentsCollectionRef, where("isEnabled", "==", true));

            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedAgents: Record<string, AgentWithComponent> = {};
                querySnapshot.forEach((doc) => {
                    const data = doc.data() as Omit<AgentWithComponent, 'id'>;
                    fetchedAgents[doc.id] = { id: doc.id, ...data };
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
    reset: () => {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
        set(initialState);
    }
}));

/**
 * Manages the agent data subscription based on authentication state.
 * This function should be called once, high up in the component tree.
 */
export function initializeAgentListener() {
    const auth = getAuth();
    const { fetchAgents, reset } = useAgentStore.getState();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, safe to fetch data.
            fetchAgents();
        } else {
            // User is signed out, clear the data and unsubscribe.
            reset();
        }
    });
}
