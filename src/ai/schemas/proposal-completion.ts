
import { z } from 'zod';
import { advancedProposalFieldsSchema } from './project';

/**
 * Defines the input schema for the proposal completion AI flow.
 * It accepts a partial representation of the proposal fields.
 */
export const proposalCompletionInputSchema = z.object({
  projectIdea: z.string().optional(),
  advancedFields: advancedProposalFieldsSchema.partial().optional(),
});

/**
 * Defines the output schema for the proposal completion AI flow.
 * It ensures the AI returns a complete set of fields.
 */
export const proposalCompletionOutputSchema = z.object({
  projectIdea: z.string().nonempty({ message: "Project idea cannot be empty." }),
  advancedFields: advancedProposalFieldsSchema,
});

export type ProposalCompletionInput = z.infer<typeof proposalCompletionInputSchema>;
export type ProposalCompletionOutput = z.infer<typeof proposalCompletionOutputSchema>;
