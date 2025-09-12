
// C:\Users\ahmed\source\repos\arkan\src\hooks\useSectionStore.ts
import { create } from 'zustand';
import { db } from '@/lib/firebase/client-init'; // Assuming you have a client-side Firebase init
import { collection, getDocs, query } from 'firebase/firestore';
import { LucideIcon, FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, Hand, DraftingCompass, Files, Presentation, DatabaseZap } from 'lucide-react';
import type { Section } from '@/lib/models'; // NEW: Import our class
import { SectionProperties } from '@/lib/models/section';

// This store is now deprecated, but we keep the file and an empty
// store definition to avoid breaking imports in files that have not yet been
// refactored. The `fetchSections` and other logic has been moved to `use-sections.ts` hook.

export interface DynamicSection extends SectionProperties {}

interface SectionState {
  sections: Record<string, DynamicSection>;
  reportSections: Record<string, DynamicSection>;
  diagramSections: Record<string, DynamicSection>;
  presentationSection: DynamicSection | null;
  loading: boolean;
  error: string | null;
  fetchSections: () => Promise<void>;
  getIconComponent: (iconName: string) => LucideIcon | undefined;
}

export const useSectionStore = create<SectionState>((set, get) => ({
    sections: {},
    reportSections: {},
    diagramSections: {},
    presentationSection: null,
    loading: true,
    error: null,
    fetchSections: async () => {}, // This is a no-op now
    getIconComponent: (iconName: string) => {
        return FileText; // Return a default icon
    },
}));
