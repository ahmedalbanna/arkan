import { z } from 'zod';

export const DiagramTypeSchema = z.enum([
    'useCase',
    'class',
    'sequence',
    'activity',
    'component',
    'archimate',
    'er',
    'gantt',
    'mindmap',
    'network',
    'wireframe',
    'er',
    'activity',
    'component',
    'deployment',
    'state',
    'object',
    'communication',
    'interaction',
    'timing',
    'flowchart',
    'mindmap',
    'network',
    'wireframe',
    'er',
    'activity',
]);
export type DiagramType = z.infer<typeof DiagramTypeSchema>;

export const SectionNameSchema = z.enum([
    'introduction',
    'literatureReview',
    'systemAnalysis',
    'designStrategy',
    'systemDesign',
    'systemProgramming',
    'systemTesting',
    'conclusion',
    'abstract',
    'acknowledgment',
    'recommendations',
    'references',
    'appendices'
]);
export type SectionName = z.infer<typeof SectionNameSchema>;

export const AcademicDocumentTypeSchema = z.enum(['exam', 'homework']);
export type AcademicDocumentType = z.infer<typeof AcademicDocumentTypeSchema>;

export const ClaimStatusSchema = z.enum(['Verified', 'False', 'Inconclusive']);
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;

export const CitationStyleSchema = z.enum(['apa', 'mla', 'chicago', 'ieee']);
export type CitationStyle = z.infer<typeof CitationStyleSchema>;

export const QuestionTypeSchema = z.enum([
    'multiple-choice',
    'true-false',
    'direct-question',
]);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

export const ParaphraseModeSchema = z.enum(['standard', 'fluent', 'formal', 'creative', 'simplify']);
export type ParaphraseMode = z.infer<typeof ParaphraseModeSchema>;

export const SummarizeLengthSchema = z.enum(['short', 'medium', 'long']);
export type SummarizeLength = z.infer<typeof SummarizeLengthSchema>;

export const ExternalContextTypeSchema = z.enum(['context', 'example', 'question', 'textbook', 'guidelines']);

export const ProposalSectionTypeSchema = z.enum(['executive_summary', 'problem_statement', 'objectives', 'scope',
    'methodology', 'timeline', 'budget', 'team', 'deliverables',
    'risk_assessment', 'success_criteria', 'conclusion', 'appendices']);
export type ProposalSectionType = z.infer<typeof ProposalSectionTypeSchema>;
