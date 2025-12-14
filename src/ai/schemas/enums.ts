
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
export type ParaphraseMode = z.infer<typeof ParaphraseModeSchema>;


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

export const SummarizeLengthSchema = z.enum(['short', 'medium', 'long']);
export type SummarizeLength = z.infer<typeof SummarizeLengthSchema>;

// Reading levels for readability-related operations
export const TargetReadingLevelSchema = z.enum(['elementary', 'middle-school', 'high-school', 'college', 'graduate']);
export type TargetReadingLevel = z.infer<typeof TargetReadingLevelSchema>;

export const ExternalContextTypeSchema = z.enum(['context', 'example', 'question', 'textbook', 'guidelines']);
export type ExternalContextType = z.infer<typeof ExternalContextTypeSchema>;

export const TargetLanaguage = z.enum(['English', 'Arabic']);
export type TargetLanaguage = z.infer<typeof TargetLanaguage>;

export const ResearchDepthSchema = z.enum(['basic', 'comprehensive', 'in-depth']);
export type ResearchDepth = z.infer<typeof ResearchDepthSchema>;

export const ProjectComplexitySchema = z.enum(['Simple', 'Medium', 'Complex', 'Enterprise']);
export type ProjectComplexity = z.infer<typeof ProjectComplexitySchema>;

export const ConfidenceLevelSchema = z.enum(['high', 'medium', 'low']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const BiasTypeSchema = z.enum(['Gender', 'Racial', 'Age-related', 'Ableism', 'Cultural', 'General Stereotype']);
export type BiasType = z.infer<typeof BiasTypeSchema>;

export const SentenceVarietySchema = z.enum(['low', 'medium', 'high']);
export type SentenceVariety = z.infer<typeof SentenceVarietySchema>;

export const CorrectionTypeSchema = z.enum(['grammar', 'spelling', 'punctuation']);
export type CorrectionType = z.infer<typeof CorrectionTypeSchema>;

export const FeedbackStatusSchema = z.enum(["Acceptable", "Weak", "Not Present"]);
export type FeedbackStatus = z.infer<typeof FeedbackStatusSchema>;

export const DesignTypeSchema = z.enum(['website', 'mobile']);
export type DesignType = z.infer<typeof DesignTypeSchema>;

export const MultipleChoiceTypeSchema = z.enum(['multiple-choice']);
export type MultipleChoiceType = z.infer<typeof MultipleChoiceTypeSchema>;

export const TrueFalseTypeSchema = z.enum(['true-false']);
export type TrueFalseType = z.infer<typeof TrueFalseTypeSchema>;

export const DirectQuestionTypeSchema = z.enum(['direct-question']);
export type DirectQuestionType = z.infer<typeof DirectQuestionTypeSchema>;

export const TrueFalseAnswerSchema = z.enum(['True', 'False']);
export type TrueFalseAnswer = z.infer<typeof TrueFalseAnswerSchema>;
