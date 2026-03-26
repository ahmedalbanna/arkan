

import { defaultControls, ReportTemplateProperties, SectionProperties } from '@/infrastructure/utils/types';
import { defaultSections } from './sections';

const getSection = (id: string): SectionProperties => {
    const section = defaultSections.find(s => s.id === id);
    if (!section) throw new Error(`Section with id "${id}" not found.`);
    return section;
};

export const defaultReportTemplates: ReportTemplateProperties[] = [
    {
        id: 'technical-report',
        name: 'Comprehensive Technical Report',
        description: 'A full-fledged report template including all standard technical sections from abstract to appendices.',
        isDefault: true,
        projectType: 'Technical Report',
        educationalLevel: 'Professional',
        content: [
            {
                title: 'Front Matter',
                sections: [
                    getSection('abstract'),
                    getSection('acknowledgment'),
                ]
            },
            {
                title: 'Main Body',
                sections: [
                    getSection('introduction'),
                    getSection('literature-review'),
                    getSection('system-analysis'),
                    getSection('system-design'),
                ]
            },
            {
                title: 'Conclusion & Appendices',
                sections: [
                    getSection('conclusion'),
                    getSection('recommendations'),
                    getSection('references'),
                    getSection('appendices'),
                ]
            }
        ]
    },
    {
        id: 'simple-business-report',
        name: 'Simple Business Report',
        description: 'A concise report structure focused on analysis, conclusions, and key recommendations for business stakeholders.',
        projectType: 'Business Report',
        educationalLevel: 'Professional',
        content: [
            {
                title: 'Executive Summary & Recommendations',
                sections: [
                    getSection('introduction'),
                    getSection('system-analysis'), // Simplified to 'Key Analysis' in spirit
                    getSection('conclusion'),
                    getSection('recommendations'),
                ]
            }
        ]
    },
    {
        id: 'graduation-project',
        name: 'Graduation Project',
        description: 'A standard template for university final year or graduation projects.',
        projectType: 'Graduation Project',
        educationalLevel: 'Undergraduate',
        content: [
            { 
                title: 'Front Matter', 
                sections: [ 
                    getSection('abstract'), 
                    getSection('acknowledgment') 
                ] 
            },
            { 
                title: 'Chapter 1: Introduction', 
                sections: [ 
                    getSection('introduction'), 
                    // These would need to be created as distinct sections if needed
                    // For now, we map to existing ones
                    getSection('introduction'), // Problem Statement
                    getSection('introduction'), // Project Objectives
                    getSection('introduction'), // Project Scope
                ] 
            },
            { 
                title: 'Chapter 2: Literature Review', 
                sections: [ getSection('literature-review') ] 
            },
            { 
                title: 'Chapter 3: Methodology & Design', 
                sections: [ 
                    getSection('system-analysis'), 
                    getSection('system-design') 
                ] 
            },
            { 
                title: 'Chapter 4: Implementation & Testing', 
                sections: [ 
                    getSection('system-programming'), 
                    getSection('system-testing') 
                ] 
            },
            { 
                title: 'Chapter 7: Conclusion & Future Work', 
                sections: [ 
                    getSection('conclusion'), 
                    getSection('recommendations') 
                ] 
            },
            {
                title: 'Back Matter',
                sections: [
                    getSection('references'),
                    getSection('appendices')
                ]
            }
        ]
    },
];
