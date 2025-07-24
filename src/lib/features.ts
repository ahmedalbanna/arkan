
export interface Feature {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

export const defaultFeatures: Feature[] = [
    { id: 'proposal', name: 'Proposal Mode', description: 'Allows users to generate full project proposals.', isEnabled: true },
    { id: 'report', name: 'Report Generator', description: 'Allows users to generate report sections.', isEnabled: true },
    { id: 'diagram', name: 'Diagram Generator', description: 'Allows users to generate various UML diagrams.', isEnabled: true },
    { id: 'code', name: 'Code Generator', description: 'Allows users to generate HTML/CSS/JS components.', isEnabled: true },
    { id: 'presentation', name: 'Presentation Generator', description: 'Allows users to generate PPTX presentations.', isEnabled: true },
];
