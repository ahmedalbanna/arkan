// src/lib/presentation-generation-templates.ts

// Potentially reuse or define a similar interface if needed
export interface PresentationGenerationTemplate {
    id: string;
    name: string;
    description: string;
    // For presentations, you might primarily use the 'generate-presentation' agent
    // but the template can guide *which* sections/data that agent should prioritize
    primaryAgentId: string; // Likely 'generate-presentation'
    relevantReportSectionIds?: string[]; // Indicate which report sections are most important for this presentation type
    // Optional: Add specific instructions or context for the presentation type
    // promptContext?: string;
}

export const PRESENTATION_GENERATION_TEMPLATES: PresentationGenerationTemplate[] = [
    {
        id: 'software-presentation',
        name: 'Software Project Presentation',
        description: 'Generates a presentation emphasizing the technical aspects and system design of a software project.',
        primaryAgentId: 'generate-presentation',
        relevantReportSectionIds: [
            'generate-introduction-section',
            'generate-system-analysis-section',
            'generate-system-design-section',
            'generate-system-programming-section',
            'generate-system-testing-section',
            'generate-conclusion-section',
        ]
    },
    {
        id: 'research-presentation',
        name: 'Research Project Presentation',
        description: 'Generates a presentation focusing on the research problem, methodology, and findings.',
        primaryAgentId: 'generate-presentation',
        relevantReportSectionIds: [
            'generate-introduction-section',
            'generate-literature-review-section',
            'generate-system-analysis-section', // Adapted for research
            'generate-conclusion-section',
            // Add IDs for new agents like results, methodology etc.
        ]
    },
    // Add other presentation templates as needed
];
