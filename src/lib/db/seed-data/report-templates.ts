
import type { ReportTemplateProperties } from '@/lib/types';

export const defaultReportTemplates: ReportTemplateProperties[] = [
    {
        id: 'technical-report',
        name: 'Comprehensive Technical Report',
        description: 'A full-fledged report template including all standard technical sections from abstract to appendices.',
        isDefault: true,
        sectionIds: [
            'abstract',
            'introduction',
            'acknowledgment',
            'literature-review',
            'system-analysis',
            'design-strategy',
            'system-design',
            'system-programming',
            'system-testing',
            'conclusion',
            'recommendations',
            'references',
            'appendices',
        ],
    },
    {
        id: 'simple-business-report',
        name: 'Simple Business Report',
        description: 'A concise report structure focused on analysis, conclusions, and key recommendations for business stakeholders.',
        sectionIds: [
            'introduction',
            'system-analysis',
            'conclusion',
            'recommendations',
        ],
    },
     {
        id: 'academic-research-paper',
        name: 'Academic Research Paper',
        description: 'A standard structure for academic papers, focusing on research, analysis, and findings.',
        sectionIds: [
            'abstract',
            'introduction',
            'literature-review',
            'system-analysis', // Represents Methodology
            'system-design',   // Represents Results/Findings
            'conclusion',
            'references',
        ],
    }
];
