
import { SectionProperties } from '@/lib/models/section';

export const defaultSections: SectionProperties[] = [
    { id: 'abstract', title: 'Abstract', agentId: 'generate-abstract-section', type: 'report', icon: 'FileText' },
    { id: 'introduction', title: 'Introduction', agentId: 'generate-introduction-section', type: 'report', icon: 'FileText' },
    { id: 'acknowledgment', title: 'Acknowledgment', agentId: 'generate-acknowledgment-section', type: 'report', icon: 'Heart' },
    { id: 'literature-review', title: 'Literature Review', agentId: 'generate-literatureReview-section', type: 'report', icon: 'BookOpen' },
    { id: 'system-analysis', title: 'System Analysis', agentId: 'generate-systemAnalysis-section', type: 'report', icon: 'Search' },
    { id: 'design-strategy', title: 'Design Strategy', agentId: 'generate-designStrategy-section', type: 'report', icon: 'PencilRuler' },
    { id: 'system-design', title: 'System Design', agentId: 'generate-systemDesign-section', type: 'report', icon: 'Architecture' },
    { id: 'system-programming', title: 'System Programming', agentId: 'generate-systemProgramming-section', type: 'report', icon: 'Code' },
    { id: 'system-testing', title: 'System Testing', agentId: 'generate-systemTesting-section', type: 'report', icon: 'TestTube2' },
    { id: 'conclusion', title: 'Conclusion', agentId: 'generate-conclusion-section', type: 'report', icon: 'FileCheck' },
    { id: 'recommendations', title: 'Recommendations', agentId: 'generate-recommendations-section', type: 'report', icon: 'Lightbulb' },
    { id: 'references', title: 'References', agentId: 'generate-references-section', type: 'report', icon: 'Quote' },
    { id: 'appendices', title: 'Appendices', agentId: 'generate-appendices-section', type: 'report', icon: 'Paperclip' },
    { id: 'use-case-diagram', title: 'Use Case Diagram', agentId: 'generate-useCase-diagram', type: 'diagram', icon: 'Users' },
    { id: 'class-diagram', title: 'Class Diagram', agentId: 'generate-class-diagram', type: 'diagram', icon: 'Box' },
    { id: 'sequence-diagram', title: 'Sequence Diagram', agentId: 'generate-sequence-diagram', type: 'diagram', icon: 'GitCommitVertical' },
    { id: 'activity-diagram', title: 'Activity Diagram', agentId: 'generate-activity-diagram', type: 'diagram', icon: 'Workflow' },
    { id: 'component-diagram', title: 'Component Diagram', agentId: 'generate-component-diagram', type: 'diagram', icon: 'BoxSelect' },
    { id: 'archimate-diagram', title: 'ArchiMate Diagram', agentId: 'generate-archimate-diagram', type: 'diagram', icon: 'Layers' },
    { id: 'er-diagram', title: 'ER Diagram', agentId: 'generate-er-diagram', type: 'diagram', icon: 'Database' }
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
