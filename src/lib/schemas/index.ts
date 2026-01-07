/**
 * Barrel for ai schemas
 *
 * Centralized exports for ai schema / type modules.
 */

export * from './enums';
export * from './flows';
export * from './base-schemas';
export { SolveAssignmentsInputSchema, SolveAssignmentsOutputSchema } from './flows';
export type { SolveAssignmentsInput, SolveAssignmentsOutput } from './flows';
export { GenerateProjectBlueprintInputSchema, GenerateProjectBlueprintOutputSchema } from './flows';
export type { GenerateProjectBlueprintInput, GenerateProjectBlueprintOutput } from './flows';
export * from './lecture-generator';
export * from './template-schemas';
export { GenerateUIDescriptionInputSchema, GenerateUIDescriptionOutputSchema } from './flows';
export type { GenerateUIDescriptionInput, GenerateUIDescriptionOutput } from './flows';

    