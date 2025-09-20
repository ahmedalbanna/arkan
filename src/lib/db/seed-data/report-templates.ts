
// src/lib/report-generation-templates.ts

import type { ReportTemplate } from "../../types";

export const REPORT_GENERATION_TEMPLATES: ReportTemplate[] = [
    {
        id: 'software-report',
        name: 'Software Project Report',
        description: 'Generates a comprehensive technical report for software development projects, including analysis, design, programming, and testing sections.',
        sectionIds: [
            'introduction',
            'systemAnalysis',
            'designStrategy',
            'systemDesign',
            'systemProgramming',
            'systemTesting',
            'conclusion',
        ],
        isDefault: false
    },
    {
        id: 'training-report',
        name: 'Training Report',
        description: 'Generates a detailed report for an internship or training program, covering experience, skills, and recommendations.',
        sectionIds: [
            'abstract',
            'acknowledgment',
            'introduction',
            'trainingProgram',
            'technicalExperience',
            'conclusion',
            'recommendations',
            'references',
            'appendices',
        ],
        isDefault: false
    },
    {
        id: 'scientific-research-report',
        name: 'Scientific Research Report',
        description: 'Generates a report structure suitable for academic or scientific projects, emphasizing literature review and analysis.',
        sectionIds: [
            'introduction',
            'literatureReview',
            'systemAnalysis',
            'systemTesting',
            'conclusion',
        ],
        isDefault: false
    },
];
