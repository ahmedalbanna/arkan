/**
 * Barrel for ai schemas
 *
 * Centralized exports for ai schema / type modules.
 */

export * from './base-schemas';
export * from './flows';
export * from './lecture-generator';
export * from './template-schemas';
export * from './project-documentation';

// Explicit re-exports to handle name conflicts
export type { CitationStyle, DiagramType, ParaphraseMode, SummarizeLength, SectionName, ClaimStatus, Tone } from './enums';
export { CitationStyleSchema, DiagramTypeSchema, ParaphraseModeSchema, SummarizeLengthSchema, SectionNameSchema, ClaimStatusSchema, ToneSchema } from './enums';
export { ProjectTypeSchema } from './graduation-project';
