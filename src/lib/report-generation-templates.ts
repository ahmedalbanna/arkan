
// src/lib/report-generation-templates.ts

export interface ReportGenerationTemplate {
    id: string;
    name: string;
    description: string;
    agentIds: string[]; // List of agent IDs included in this report type
}

export const REPORT_GENERATION_TEMPLATES: ReportGenerationTemplate[] = [
    {
        id: 'software-report',
        name: 'Software Project Report',
        description: 'Generates a comprehensive technical report for software development projects, including analysis, design, programming, and testing sections.',
        agentIds: [
            'generate-introduction-section',
            'generate-systemAnalysis-section',
            'generate-designStrategy-section',
            'generate-systemDesign-section',
            'generate-systemProgramming-section',
            'generate-systemTesting-section',
            'generate-conclusion-section',
        ]
    },
    {
        id: 'scientific-research-report',
        name: 'Scientific Research Report',
        description: 'Generates a report structure suitable for academic or scientific projects, emphasizing literature review and analysis.',
        agentIds: [
            'generate-introduction-Section',
            'generate-literatureReview-section',
            'generate-systemAnalysis-section',
            'generate-systemTesting-section',
            'generate-conclusion-section',
        ]
    },
];
