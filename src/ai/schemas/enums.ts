import { z } from 'zod';

export const DiagramTypeSchema = z.enum([
    'useCase',
    'class',
    'sequence',
    'activity',
    'component',
    'archimate',
    'er'
]);
export type DiagramType = z.infer<typeof DiagramTypeSchema>;

export const SectionNameSchema = z.string().min(1).max(100);
export type SectionName = z.infer<typeof SectionNameSchema>;

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
export type ExternalContextType = z.infer<typeof ExternalContextTypeSchema>;
