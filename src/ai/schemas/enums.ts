import { z } from 'zod';

export const DiagramTypeSchema = z.enum([
  'useCase',
  'class',
  'sequence',
  'activity',
  'component',
  'archimate',
  'er',
  'dfd'
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

// Curated tone options for generation controls
export const ToneSchema = z.enum([
  'professional',
  'formal',
  'neutral',
  'friendly',
  'casual',
  'persuasive',
  'informative',
  'confident',
  'empathetic',
  'enthusiastic',
  'authoritative',
  'approachable',
  'analytical',
  'conversational',
]);
export type Tone = z.infer<typeof ToneSchema>;

// Curated target audiences for generation controls
export const TargetAudienceSchema = z.enum([
  'general-public',
  'non-technical-users',
  'students',
  'academics',
  'professionals',
  'stakeholders',
  'investors',
  'vcs',
  'executives',
  'developers',
  'qa-engineers',
  'designers',
  'marketers',
  'sales',
  'customer-support',
  'product-managers',
  'project-managers',
  'healthcare-professionals',
]);
export type TargetAudience = z.infer<typeof TargetAudienceSchema>;
export type ParaphraseMode = z.infer<typeof ParaphraseModeSchema>;

export const SummarizeLengthSchema = z.enum(['short', 'medium', 'long']);

// Reading levels for readability-related operations
export const TargetReadingLevelSchema = z.enum(['elementary', 'middle-school', 'high-school', 'college', 'graduate']);
export type TargetReadingLevel = z.infer<typeof TargetReadingLevelSchema>;
export type SummarizeLength = z.infer<typeof SummarizeLengthSchema>;

export const ExternalContextTypeSchema = z.enum(['context', 'example', 'question', 'textbook', 'guidelines']);
export type ExternalContextType = z.infer<typeof ExternalContextTypeSchema>;

export const TargetLanaguage = z.enum(['English', 'Arabic']);
export type TargetLanaguage = z.infer<typeof TargetLanaguage>;
