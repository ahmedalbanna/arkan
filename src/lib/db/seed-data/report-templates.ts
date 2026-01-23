/**
 * Default Report Templates Seed Data
 */

import type { ReportTemplateProperties } from '@/lib/models';

export const defaultReportTemplates: ReportTemplateProperties[] = [
  {
    id: 'academic-research-paper',
    name: 'Academic Research Paper',
    description: 'Structured template for academic research papers with standard sections',
    category: 'academic',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      { id: 'abstract', title: 'Abstract', order: 0, isRequired: true },
      { id: 'introduction', title: 'Introduction', order: 1, isRequired: true },
      { id: 'literature-review', title: 'Literature Review', order: 2, isRequired: true },
      { id: 'methodology', title: 'Methodology', order: 3, isRequired: true },
      { id: 'results', title: 'Results', order: 4, isRequired: true },
      { id: 'discussion', title: 'Discussion', order: 5, isRequired: true },
      { id: 'conclusion', title: 'Conclusion', order: 6, isRequired: true },
      { id: 'references', title: 'References', order: 7, isRequired: true },
    ],
  },
  {
    id: 'business-proposal',
    name: 'Business Proposal',
    description: 'Professional business proposal template',
    category: 'business',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      { id: 'executive-summary', title: 'Executive Summary', order: 0, isRequired: true },
      { id: 'problem-statement', title: 'Problem Statement', order: 1, isRequired: true },
      { id: 'proposed-solution', title: 'Proposed Solution', order: 2, isRequired: true },
      { id: 'methodology', title: 'Methodology', order: 3, isRequired: false },
      { id: 'timeline', title: 'Timeline', order: 4, isRequired: true },
      { id: 'budget', title: 'Budget', order: 5, isRequired: true },
      { id: 'conclusion', title: 'Conclusion', order: 6, isRequired: true },
    ],
  },
  {
    id: 'technical-documentation',
    name: 'Technical Documentation',
    description: 'Template for software and technical documentation',
    category: 'technical',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      { id: 'overview', title: 'Overview', order: 0, isRequired: true },
      { id: 'architecture', title: 'Architecture', order: 1, isRequired: true },
      { id: 'installation', title: 'Installation', order: 2, isRequired: true },
      { id: 'configuration', title: 'Configuration', order: 3, isRequired: false },
      { id: 'api-reference', title: 'API Reference', order: 4, isRequired: false },
      { id: 'troubleshooting', title: 'Troubleshooting', order: 5, isRequired: false },
    ],
  },
  {
    id: 'project-report',
    name: 'Project Report',
    description: 'General project documentation and reporting template',
    category: 'general',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      { id: 'introduction', title: 'Introduction', order: 0, isRequired: true },
      { id: 'objectives', title: 'Objectives', order: 1, isRequired: true },
      { id: 'scope', title: 'Scope', order: 2, isRequired: true },
      { id: 'methodology', title: 'Methodology', order: 3, isRequired: false },
      { id: 'results', title: 'Results', order: 4, isRequired: true },
      { id: 'recommendations', title: 'Recommendations', order: 5, isRequired: false },
      { id: 'conclusion', title: 'Conclusion', order: 6, isRequired: true },
    ],
  },
];
