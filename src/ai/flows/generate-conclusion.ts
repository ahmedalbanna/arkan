'use server';

/**
 * @fileOverview AI agent for generating a Conclusion section for a project report.
 * - generateConclusion
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema } from '@/ai/schemas';

const GenerateConclusionInputSchema = z.object({
    proposal: ProjectProposalSchema,
    prompt: z.string().describe("The prompt to use for generating the conclusion.")
});
export type GenerateConclusionInput = z.infer<typeof GenerateConclusionInputSchema>;


const GenerateConclusionOutputSchema = z.object({
    conclusion: z.string().describe("The complete, professionally written 'Conclusion' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateConclusionOutput = z.infer<typeof GenerateConclusionOutputSchema>;

export async function generateConclusion(input: GenerateConclusionInput): Promise<GenerateConclusionOutput> {
  return generateConclusionFlow(input);
}

const generateConclusionFlow = ai.defineFlow(
  {
    name: 'generateConclusionFlow',
    inputSchema: GenerateConclusionInputSchema,
    outputSchema: GenerateConclusionOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateConclusionPrompt',
      input: { schema: GenerateConclusionInputSchema },
      output: { schema: GenerateConclusionOutputSchema },
      prompt: input.prompt,
    });

    const { output } = await prompt(input);
    return output!;
  }
);
