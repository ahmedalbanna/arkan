import { create } from 'zustand';
import { db } from '@/lib/firebase/client-init';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  LucideIcon, FileSpreadsheet, FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, BookText as BookTextIcon, Presentation, DatabaseZap, History, FileHeart, Hand, DraftingCompass, Files, LayoutGrid, Scale, Megaphone, PencilRuler, Users
} from 'lucide-react';
import type { AgentData, AgentPrompt } from '@/lib/types';

const iconMap: Record<string, LucideIcon> = {
  FileSpreadsheet, FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, BookText: BookTextIcon, Presentation, DatabaseZap, History, FileHeart, Hand, DraftingCompass, Files, LayoutGrid, Scale, Megaphone, PencilRuler, Users
};

export interface DynamicAgentData extends Omit<AgentData, 'icon'> {
  id: string;
  icon: string;
}

export interface AgentWithComponent extends DynamicAgentData {
    iconComponent: LucideIcon;
}

interface AgentState {
  agents: Record<string, AgentWithComponent>;
  isLoaded: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: {},
  isLoaded: false,
  error: null,
  fetchAgents: async () => {
    // Prevent re-fetching if already loaded
    if (useAgentStore.getState().isLoaded && !useAgentStore.getState().error) return;
    set({ isLoaded: false, error: null });
    try {
      const agentsCollectionRef = collection(db, 'agents');
      const q = query(agentsCollectionRef, where("isEnabled", "==", true));
      const querySnapshot = await getDocs(q);

      const fetchedAgents: Record<string, AgentWithComponent> = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<DynamicAgentData, 'id'>;
        const agent: AgentWithComponent = {
          id: doc.id,
          ...data,
          iconComponent: iconMap[data.icon] || FileText,
        };
        fetchedAgents[doc.id] = agent;
      });

      set({ agents: fetchedAgents, isLoaded: true });
    } catch (e: any) {
      console.error("Error fetching agents:", e);
      set({ isLoaded: true, error: e.message });
    }
  },
}));

// Automatically fetch agents when the store is initialized
useAgentStore.getState().fetchAgents();
