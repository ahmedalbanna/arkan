
'use client';

import { z } from 'zod';

// Enums for various control options
export const ExternalContextTypeSchema = z.enum(['context', 'example', 'question', 'textbook', 'guidelines', 'dataset']);
export type ExternalContextType = z.infer<typeof ExternalContextTypeSchema>;

export const SectionTypeSchema = z.enum(['report', 'diagram', 'presentation', 'code', 'math']);
export type SectionType = z.infer<typeof SectionTypeSchema>;

export const ToneSchema = z.enum(['professional', 'academic', 'casual', 'persuasive', 'technical', 'explanatory']);
export type Tone = z.infer<typeof ToneSchema>;

export const LanguageSchema = z.enum(['default', 'en', 'ar', 'es', 'fr', 'de']);
export type Language = z.infer<typeof LanguageSchema>;

export const DiagramTypeSchema = z.enum(['useCase', 'class', 'sequence', 'activity', 'component', 'archimate', 'er', 'dfd', 'mindmap', 'gantt']);
export type DiagramType = z.infer<typeof DiagramTypeSchema>;

// Behaviors
export const BehaviorTypeSchema = z.enum(['behavior', 'persona']);
export type BehaviorType = z.infer<typeof BehaviorTypeSchema>;

export const BehaviorSchema = z.object({
  name: z.string(),
  type: BehaviorTypeSchema,
  description: z.string().optional()
});
export type Behavior = z.infer<typeof BehaviorSchema>;

// Citation Styles
export const CitationStyleSchema = z.enum([
    'APA7',
    'MLA9',
    'Chicago17',
    'Harvard',
    'IEEE',
    'Vancouver',
    'OSCOLA',
    'AMA',
    'ASA',
    'Turabian'
]);
export type CitationStyle = z.infer<typeof CitationStyleSchema>;

// Control State Schemas
export const OutputStyleSchema = z.object({
  heading: z.boolean(),
  paragraph: z.boolean(),
  list: z.boolean(),
  table: z.boolean(),
  code: z.boolean(),
  diagram: z.boolean(),
  math: z.boolean(),
  includeCitations: z.boolean().optional(),
});
export type OutputStyle = z.infer<typeof OutputStyleSchema>;

export const GenerationControlStateSchema = z.object({
  formality: z.number().min(0).max(100),
  complexity: z.number().min(0).max(100),
  tone: ToneSchema,
  language: LanguageSchema,
  outputStyle: OutputStyleSchema,
  wordCount: z.string().optional(),
  diagramType: DiagramTypeSchema.optional(),
  programmingLanguage: z.string().optional(),
  tableCaption: z.string().optional(),
  includedHeadings: z.array(z.string()).optional(),
  citationStyle: CitationStyleSchema.optional()
});
export type GenerationControlState = z.infer<typeof GenerationControlStateSchema>;

export const defaultControls: GenerationControlState = {
  formality: 70,
  complexity: 50,
  tone: 'professional',
  language: 'default',
  outputStyle: { 
    heading: true, 
    paragraph: true, 
    list: false, 
    table: false, 
    code: false, 
    diagram: false, 
    math: false,
    includeCitations: false,
  },
  wordCount: '',
  diagramType: 'useCase',
  citationStyle: 'APA7'
};

// Context Definition
export const SectionContextSchema = z.object({
  sections: z.record(z.string(), ExternalContextTypeSchema), // sectionId -> Usage Type
  externalContext: z.record(z.string(), ExternalContextTypeSchema) // externalContextId -> Usage Type
});
export type SectionContext = z.infer<typeof SectionContextSchema>;
