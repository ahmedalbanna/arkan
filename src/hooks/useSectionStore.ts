// C:\Users\ahmed\source\repos\arkan\src\hooks\useSectionStore.ts
import { create } from 'zustand';
import { db } from '@/lib/firebase/client-init'; // Assuming you have a client-side Firebase init
import { collection, getDocs, query } from 'firebase/firestore';
import { LucideIcon, FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, Hand, DraftingCompass, Files, Presentation, DatabaseZap } from 'lucide-react';

// Map string icon names to LucideIcon components for dynamic rendering
const iconMap: Record<string, LucideIcon> = {
    FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, Hand, DraftingCompass, Files, Presentation, DatabaseZap
};

export type SectionType = 'report' | 'diagram' | 'presentation';

export interface DynamicSection {
    id: string; // Document ID from Firestore (e.g., 'introduction', 'useCase')
    title: string;
    icon: string; // Stored as string in Firestore (e.g., 'BookMarked', 'GitGraph')
    agentId: string; // The agent ID associated with this section
    type: SectionType; // To categorize sections (report, diagram, presentation)
}

interface SectionState {
    sections: Record<string, DynamicSection>; // All fetched sections by their Firestore document ID
    reportSections: Record<string, DynamicSection>; // Filtered report sections
    diagramSections: Record<string, DynamicSection>; // Filtered diagram sections
    presentationSection: DynamicSection | null; // The presentation section
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
    loading: false,
    error: null,

    fetchSections: async () => {
        set({ loading: true, error: null });
        try {
            const sectionsCollectionRef = collection(db, 'sections'); // Assuming 'sections' is your Firestore collection name
            const q = query(sectionsCollectionRef);
            const querySnapshot = await getDocs(q);

            const fetchedSections: Record<string, DynamicSection> = {};
            const fetchedReportSections: Record<string, DynamicSection> = {};
            const fetchedDiagramSections: Record<string, DynamicSection> = {};
            let fetchedPresentationSection: DynamicSection | null = null;

            querySnapshot.forEach((doc) => {
                const data = doc.data() as Omit<DynamicSection, 'id'>;
                const section: DynamicSection = { id: doc.id, ...data };
                fetchedSections[doc.id] = section;

                if (section.type === 'report') {
                    fetchedReportSections[doc.id] = section;
                } else if (section.type === 'diagram') {
                    fetchedDiagramSections[doc.id] = section;
                } else if (section.type === 'presentation') {
                    fetchedPresentationSection = section;
                }
            });

            set({
                sections: fetchedSections,
                reportSections: fetchedReportSections,
                diagramSections: fetchedDiagramSections,
                presentationSection: fetchedPresentationSection,
                loading: false,
            });
        } catch (e: any) {
            console.error("Error fetching sections:", e);
            set({ loading: false, error: e.message });
        }
    },

    getIconComponent: (iconName: string) => {
        return iconMap[iconName];
    },
}));

// Automatically fetch sections when the store is initialized
useSectionStore.getState().fetchSections();

