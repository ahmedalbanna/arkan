// src/lib/report-generation-templates.ts

import { AgentData } from './agents'; // Assuming AgentData is exported

export interface ReportGenerationTemplate {
    id: string;
    name: string;
    description: string;
    agentIds: string[]; // List of agent IDs included in this report type
    // Optional: Add specific instructions or context for the overall report type
    // promptContext?: string;
}

export const REPORT_GENERATION_TEMPLATES: ReportGenerationTemplate[] = [
    {
        id: 'software-report',
        name: 'Software Project Report',
        description: 'Generates a comprehensive technical report for software development projects, including analysis, design, programming, and testing sections.',
        agentIds: [
            'generate-introduction-section',
            'generate-system-analysis-section',
            'generate-design-strategy-section', // Can be optional depending on template
            'generate-system-design-section',
            'generate-system-programming-section',
            'generate-system-testing-section',
            'generate-conclusion-section',
            // You might include diagram agents here if diagrams are generated as part of the report flow
            // e.g., 'generate-use-case-diagram', 'generate-class-diagram', etc.
        ]
    },
    {
        id: 'scientific-research-report',
        name: 'Scientific Research Report',
        description: 'Generates a report structure suitable for academic or scientific projects, emphasizing literature review and analysis.',
        agentIds: [
            'generate-introduction-section',
            'generate-literature-review-section', // Include literature review
            'generate-system-analysis-section', // Analysis might focus on methodology/experiment design
            // Exclude design/programming sections if not relevant
            'generate-system-testing-section', // Testing might focus on experiment validation
            'generate-conclusion-section',
            // Add new agents here for methodology, results, discussion if needed
        ]
    },
    // Add other report templates as needed
];
