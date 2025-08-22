
export interface Feature {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

export const defaultFeatures: Feature[] = [
    { id: 'proposal', name: 'Proposal Mode', description: 'Allows users to generate full project proposals.', isEnabled: true },
    { id: 'plan', name: 'Project Planner', description: 'Enables the AI-powered project planning and task breakdown feature.', isEnabled: true },
    { id: 'report', name: 'Report Generator', description: 'Allows users to generate report sections.', isEnabled: true },
    { id: 'diagram', name: 'Diagram Generator', description: 'Allows users to generate various UML diagrams.', isEnabled: true },
    { id: 'code', name: 'Code Generator', description: 'Allows users to generate HTML/CSS/JS components.', isEnabled: true },
    { id: 'codebase', name: 'Codebase Scaffolding', description: 'Allows the AI to generate a boilerplate codebase from a proposal.', isEnabled: false },
    { id: 'presentation', name: 'Presentation Generator', description: 'Allows users to generate PPTX presentations.', isEnabled: true },
    { id: 'academic', name: 'Academic Solver', description: 'Enables the academic document analysis and solving tools.', isEnabled: true },
    { id: 'project-chat', name: 'AI Project Chat', description: 'Enables the interactive AI chat for refining projects.', isEnabled: false },
];
