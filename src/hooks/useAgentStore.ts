import { create } from 'zustand';
import { db } from '@/lib/firebase/client-init';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import {
  LucideIcon, FileSpreadsheet, FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, BookText as BookTextIcon, Presentation, DatabaseZap, History, FileHeart, Hand, DraftingCompass, Files, LayoutGrid, Scale, Megaphone, PencilRuler, Users
} from 'lucide-react';
import type { Agent, AgentPrompt } from '@/lib/types';

const iconMap: Record<string, LucideIcon> = {
  FileSpreadsheet, FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, BookText: BookTextIcon, Presentation, DatabaseZap, History, FileHeart, Hand, DraftingCompass, Files, LayoutGrid, Scale, Megaphone, PencilRuler, Users
};

export interface DynamicAgent extends Omit<Agent, 'icon'> {
  id: string;
  icon: string;
}

export interface AgentWithComponent extends DynamicAgent {
    iconComponent: LucideIcon;
}

interface AgentState {
  agents: Record<string, AgentWithComponent>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchAgents: () => void;
  getIconComponent: (iconName: string) => LucideIcon | undefined;
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
          const data = doc.data() as Omit<DynamicAgent, 'id'>;
          const agent: AgentWithComponent = {
            id: doc.id,
            ...data,
            iconComponent: iconMap[data.icon] || FileText,
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
  getIconComponent: (iconName: string) => {
      return iconMap[iconName];
  },
}));

// Automatically fetch agents when the store is initialized
useAgentStore.getState().fetchAgents();
