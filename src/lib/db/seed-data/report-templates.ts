
import type { ReportTemplateProperties } from '@/lib/models';

export const defaultReportTemplates: ReportTemplateProperties[] = [
    {
        id: 'technical-report',
        name: 'Comprehensive Technical Report',
        description: 'A full-fledged report template including all standard technical sections from abstract to appendices.',
        isDefault: true,
        sectionIds: [
            'abstract',
            'acknowledgment',
            'introduction',
            'literature-review',
            'system-analysis',
            'system-design',
            'system-programming',
            'system-testing',
            'conclusion',
            'recommendations',
            'references',
            'appendices',
        ]
    },
    {
        id: 'simple-business-report',
        name: 'Simple Business Report',
        description: 'A concise report structure focused on analysis, conclusions, and key recommendations for business stakeholders.',
        sectionIds: [
            'introduction',
            'system-analysis', // Re-using for key analysis
            'conclusion',
            'recommendations'
        ]
    },
    {
        id: 'graduation-project',
        name: 'Graduation Project',
        description: 'A standard template for university final year or graduation projects.',
        sectionIds: [
            'abstract',
            'acknowledgment',
            'introduction', // This would cover problem statement, objectives, scope
            'literature-review',
            'system-analysis',
            'system-design',
            'system-programming', // Could cover implementation
            'system-testing',
            'conclusion', // Can include results & discussion
            'references',
            'appendices'
        ]
    },
];
