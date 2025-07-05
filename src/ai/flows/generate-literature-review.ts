'use server';

/**
 * @fileOverview AI agent for generating a Literature Review section for a project report.
 * - generateLiteratureReview
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

const GenerateLiteratureReviewInputSchema = z.object({
    proposal: ProjectProposalSchema,
    prompt: z.string().describe("The prompt to use for generating the literature review.")
});
export type GenerateLiteratureReviewInput = z.infer<typeof GenerateLiteratureReviewInputSchema>;

const GenerateLiteratureReviewOutputSchema = z.object({
    literatureReview: z.string().describe("The complete, professionally written 'Literature Review' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateLiteratureReviewOutput = z.infer<typeof GenerateLiteratureReviewOutputSchema>;

export async function generateLiteratureReview(input: GenerateLiteratureReviewInput): Promise<GenerateLiteratureReviewOutput> {
  return generateLiteratureReviewFlow(input);
}

const generateLiteratureReviewFlow = ai.defineFlow(
  {
    name: 'generateLiteratureReviewFlow',
    inputSchema: GenerateLiteratureReviewInputSchema,
    outputSchema: GenerateLiteratureReviewOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'generateLiteratureReviewPrompt',
        input: { schema: ProjectProposalSchema },
        output: { schema: GenerateLiteratureReviewOutputSchema },
        prompt: input.prompt,
    });
    const { output } = await prompt(input.proposal);
    return output!;
  }
);
