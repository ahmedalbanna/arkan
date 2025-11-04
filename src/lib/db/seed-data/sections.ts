import { SectionProperties } from '@/lib/models/section';

export const defaultSections: Omit<SectionProperties, 'agent'>[] = [
    { id: 'abstract', title: 'Abstract', agentId: 'generate-abstract-section', type: 'report' },
    { id: 'introduction', title: 'Introduction', agentId: 'generate-introduction-section', type: 'report' },
    { id: 'acknowledgment', title: 'Acknowledgment', agentId: 'generate-acknowledgment-section', type: 'report' },
    { id: 'literature-review', title: 'Literature Review', agentId: 'generate-literatureReview-section', type: 'report' },
    { id: 'system-analysis', title: 'System Analysis', agentId: 'generate-systemAnalysis-section', type: 'report' },
    { id: 'design-strategy', title: 'Design Strategy', agentId: 'generate-designStrategy-section', type: 'report' },
    { id: 'system-design', title: 'System Design', agentId: 'generate-systemDesign-section', type: 'report' },
    { id: 'system-programming', title: 'System Programming', agentId: 'generate-systemProgramming-section', type: 'report' },
    { id: 'system-testing', title: 'System Testing', agentId: 'generate-systemTesting-section', type: 'report' },
    { id: 'conclusion', title: 'Conclusion', agentId: 'generate-conclusion-section', type: 'report' },
    { id: 'recommendations', title: 'Recommendations', agentId: 'generate-recommendations-section', type: 'report' },
    { id: 'references', title: 'References', agentId: 'generate-references-section', type: 'report' },
    { id: 'appendices', title: 'Appendices', agentId: 'generate-appendices-section', type: 'report' },
    { id: 'use-case-diagram', title: 'Use Case Diagram', agentId: 'generate-useCase-diagram', type: 'diagram' },
    { id: 'class-diagram', title: 'Class Diagram', agentId: 'generate-class-diagram', type: 'diagram' },
    { id: 'sequence-diagram', title: 'Sequence Diagram', agentId: 'generate-sequence-diagram', type: 'diagram' },
    { id: 'activity-diagram', title: 'Activity Diagram', agentId: 'generate-activity-diagram', type: 'diagram' },
    { id: 'component-diagram', title: 'Component Diagram', agentId: 'generate-component-diagram', type: 'diagram' },
    { id: 'archimate-diagram', title: 'ArchiMate Diagram', agentId: 'generate-archimate-diagram', type: 'diagram' },
    { id: 'er-diagram', title: 'ER Diagram', agentId: 'generate-er-diagram', type: 'diagram' }
];

export const defaultReportSectionsOrder = [
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
];

export const defaultDiagramSectionsOrder = [
    'use-case-diagram',
    'class-diagram',
    'sequence-diagram',
    'activity-diagram',
    'component-diagram',
    'archimate-diagram',
    'er-diagram'
];
