import { BookMarked, Library, Waypoints, BookText, Code, TestTube2, Flag, GitGraph, Presentation } from 'lucide-react';
import type { DiagramType, SectionName } from '@/ai/schemas';

export const sectionConfig: { [key in SectionName]: { title: string; icon: React.ElementType, agentId: string } } = {
    introduction: { title: "Introduction", icon: BookMarked, agentId: "generate-introduction" },
    literatureReview: { title: "Literature Review", icon: Library, agentId: "generate-literature-review" },
    systemAnalysis: { title: "System Analysis", icon: Waypoints, agentId: "generate-system-analysis" },
    designStrategy: { title: "Design Strategy", icon: BookText, agentId: "generate-design-strategy" },
    systemDesign: { title: "System Design", icon: Code, agentId: "generate-system-design" },
    systemProgramming: { title: "System Programming", icon: Code, agentId: "generate-system-programming" },
    systemTesting: { title: "System Testing", icon: TestTube2, agentId: "generate-system-testing" },
    conclusion: { title: "Conclusion", icon: Flag, agentId: "generate-conclusion" },
};

export const diagramConfig: { [key in DiagramType]: { title: string; icon: React.ElementType, agentId: string; } } = {
    useCase: { title: "Use Case Diagram", icon: GitGraph, agentId: "generate-use-case-diagram" },
    class: { title: "Class Diagram", icon: GitGraph, agentId: "generate-class-diagram" },
    sequence: { title: "Sequence Diagram", icon: GitGraph, agentId: "generate-sequence-diagram" },
    activity: { title: "Activity Diagram", icon: GitGraph, agentId: "generate-activity-diagram" },
    component: { title: "Component Diagram", icon: GitGraph, agentId: "generate-component-diagram" },
    archimate: { title: "ArchiMate Diagram", icon: GitGraph, agentId: "generate-archimate-diagram" },
};

export const presentationConfig = {
    presentation: { title: "Presentation", icon: Presentation, agentId: "generate-presentation" }
};
