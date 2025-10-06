import { db } from '@/lib/firebase/client-init';
import type { AgentData } from '@/lib/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  BookMarked, BookText as BookTextIcon,
  BrainCircuit,
  Code,
  DatabaseZap,
  DraftingCompass,
  FileHeart,
  Files,
  FileSpreadsheet, FileText,
  Flag,
  GitGraph,
  Hand,
  History,
  LayoutGrid,
  Library,
  LucideIcon,
  Megaphone, PencilRuler,
  Presentation,
  Scale,
  TestTube2,
  Users,
  Waypoints
} from 'lucide-react';
import { create } from 'zustand';

const iconMap: Record<string, LucideIcon> = {
  FileSpreadsheet, FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, BookText: BookTextIcon, Presentation, DatabaseZap, History, FileHeart, Hand, DraftingCompass, Files, LayoutGrid, Scale, Megaphone, PencilRuler, Users
};

export interface DynamicAgentData extends AgentData {
  icon: string;
}

export interface AgentWithComponent extends DynamicAgentData {
  iconComponent: LucideIcon;
}

interface AgentState {
  agents: Record<string, AgentWithComponent>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  getIconComponent: (iconName: string) => LucideIcon | undefined;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: {},
  isLoaded: false,
  isLoading: false,
  error: null,
  fetchAgents: async () => {
    // Prevent re-fetching if already loaded or currently fetching.
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true, error: null });
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

      set({ agents: fetchedAgents, isLoaded: true, isLoading: false });
    } catch (e: any) {
      console.error("Error fetching agents:", e);
      set({ isLoaded: false, isLoading: false, error: e.message });
    }
  },
  getIconComponent: (iconName: string) => {
    return iconMap[iconName];
  },
}));

// Automatically fetch agents when the store is initialized
useAgentStore.getState().fetchAgents();
