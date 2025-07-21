import { BookMarked, Library, Waypoints, BookText, Code, TestTube2, Flag, GitGraph, Presentation, DatabaseZap } from 'lucide-react';
import type { DiagramType, SectionName } from '@/ai/schemas';

export const sectionConfig: { [key in SectionName]: { title: string; icon: React.ElementType, agentId: string } } = {
    introduction: { title: "builder.reportGenerator.sections.introduction", icon: BookMarked, agentId: "generate-introduction-section" },
    literatureReview: { title: "builder.reportGenerator.sections.literatureReview", icon: Library, agentId: "generate-literature-review-section" },
    systemAnalysis: { title: "builder.reportGenerator.sections.systemAnalysis", icon: Waypoints, agentId: "generate-system-analysis-section" },
    designStrategy: { title: "builder.reportGenerator.sections.designStrategy", icon: BookText, agentId: "generate-design-strategy-section" },
    systemDesign: { title: "builder.reportGenerator.sections.systemDesign", icon: Code, agentId: "generate-system-design-section" },
    systemProgramming: { title: "builder.reportGenerator.sections.systemProgramming", icon: Code, agentId: "generate-system-programming-section" },
    systemTesting: { title: "builder.reportGenerator.sections.systemTesting", icon: TestTube2, agentId: "generate-system-testing-section" },
    conclusion: { title: "builder.reportGenerator.sections.conclusion", icon: Flag, agentId: "generate-conclusion-section" },
};

export const diagramConfig: { [key in DiagramType]: { title: string; icon: React.ElementType, agentId: string; } } = {
    'use-case': { title: "builder.diagramGenerator.diagrams.useCase", icon: GitGraph, agentId: "generate-use-case-diagram" },
    class: { title: "builder.diagramGenerator.diagrams.class", icon: GitGraph, agentId: "generate-class-diagram" },
    sequence: { title: "builder.diagramGenerator.diagrams.sequence", icon: GitGraph, agentId: "generate-sequence-diagram" },
    activity: { title: "builder.diagramGenerator.diagrams.activity", icon: GitGraph, agentId: "generate-activity-diagram" },
    component: { title: "builder.diagramGenerator.diagrams.component", icon: GitGraph, agentId: "generate-component-diagram" },
    archimate: { title: "builder.diagramGenerator.diagrams.archimate", icon: GitGraph, agentId: "generate-archimate-diagram" },
    er: { title: "builder.diagramGenerator.diagrams.er", icon: DatabaseZap, agentId: "generate-er-diagram" },
};

export const presentationConfig = {
    presentation: { title: "Presentation", icon: Presentation, agentId: "generate-presentation" }
};
