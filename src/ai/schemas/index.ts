/**
 * Barrel for ai schemas
 *
 * Centralized exports for ai schema / type modules.
 */

export * from './enums';
export * from './flows';
export { SolveAssignmentsInputSchema, SolveAssignmentsOutputSchema } from './flows';
export type { SolveAssignmentsInput, SolveAssignmentsOutput } from './flows';
export * from './lecture-generator';
export * from './template-schemas';
