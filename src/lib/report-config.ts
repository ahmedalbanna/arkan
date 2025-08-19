
// This file is deprecated and will be removed.
// All configuration is now fetched dynamically from the database.
// The content is kept here temporarily only to prevent build errors in other files
// that have not yet been refactored.

import { FileText, GitGraph, BrainCircuit, Library, TestTube2, Waypoints, Code, Flag, BookMarked, Hand, DraftingCompass, Files, Presentation, DatabaseZap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Config {
    title: string;
    icon: LucideIcon;
    agentId: string;
}

export const sectionConfig: Record<string, Config> = {
    introduction: { title: 'Introduction', icon: BookMarked, agentId: 'generate-introduction-section' },
    literatureReview: { title: 'Literature Review', icon: Library, agentId: 'generate-literatureReview-section' },
    systemAnalysis: { title: 'System Analysis', icon: Waypoints, agentId: 'generate-systemAnalysis-section' },
    designStrategy: { title: 'Design Strategy', icon: BrainCircuit, agentId: 'generate-designStrategy-section' },
    systemDesign: { title: 'System Design', icon: Code, agentId: 'generate-systemDesign-section' },
    systemProgramming: { title: 'System Programming', icon: Code, agentId: 'generate-systemProgramming-section' },
    systemTesting: { title: 'System Testing', icon: TestTube2, agentId: 'generate-systemTesting-section' },
    conclusion: { title: 'Conclusion', icon: Flag, agentId: 'generate-conclusion-section' },
    abstract: { title: 'Abstract', icon: FileText, agentId: 'generate-abstract-section' },
    acknowledgment: { title: 'Acknowledgment', icon: Hand, agentId: 'generate-acknowledgment-section' },
    trainingProgram: { title: 'Training Program', icon: Library, agentId: 'generate-trainingProgram-section' },
    technicalExperience: { title: 'Technical Experience', icon: TestTube2, agentId: 'generate-technicalExperience-section' },
    recommendations: { title: 'Recommendations', icon: Hand, agentId: 'generate-recommendations-section' },
    references: { title: 'References', icon: DraftingCompass, agentId: 'generate-references-section' },
    appendices: { title: 'Appendices', icon: Files, agentId: 'generate-appendices-section' },
};

export const diagramConfig: Record<string, Config> = {
    "use-case": { title: 'Use Case Diagram', icon: GitGraph, agentId: 'generate-use-case-diagram' },
    "class": { title: 'Class Diagram', icon: GitGraph, agentId: 'generate-class-diagram' },
    "sequence": { title: 'Sequence Diagram', icon: GitGraph, agentId: 'generate-sequence-diagram' },
    "activity": { title: 'Activity Diagram', icon: GitGraph, agentId: 'generate-activity-diagram' },
    "component": { title: 'Component Diagram', icon: GitGraph, agentId: 'generate-component-diagram' },
    "archimate": { title: 'ArchiMate Diagram', icon: DatabaseZap, agentId: 'generate-archimate-diagram' },
    "er": { title: 'ER Diagram', icon: GitGraph, agentId: 'generate-er-diagram' },
}

export const presentationConfig: Config = {
    title: 'Presentation',
    icon: Presentation,
    agentId: 'generate-presentation'
}
