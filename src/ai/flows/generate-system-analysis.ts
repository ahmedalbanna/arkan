'use server';

/**
 * @fileOverview AI agent for generating a System Analysis section for a project report.
 * - generateSystemAnalysis
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema } from '@/ai/schemas';

const GenerateSystemAnalysisInputSchema = z.object({
    proposal: ProjectProposalSchema,
    prompt: z.string().describe("The prompt to use for generating the system analysis.")
});
export type GenerateSystemAnalysisInput = z.infer<typeof GenerateSystemAnalysisInputSchema>;

const GenerateSystemAnalysisOutputSchema = z.object({
    systemAnalysis: z.string().describe("The complete, professionally written 'System Analysis' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemAnalysisOutput = z.infer<typeof GenerateSystemAnalysisOutputSchema>;

export async function generateSystemAnalysis(input: GenerateSystemAnalysisInput): Promise<GenerateSystemAnalysisOutput> {
  return generateSystemAnalysisFlow(input);
}

const generateSystemAnalysisFlow = ai.defineFlow(
  {
    name: 'generateSystemAnalysisFlow',
    inputSchema: GenerateSystemAnalysisInputSchema,
    outputSchema: GenerateSystemAnalysisOutputSchema,
  },
  async (input) => {
     const prompt = ai.definePrompt({
        name: 'generateSystemAnalysisPrompt',
        input: { schema: GenerateSystemAnalysisInputSchema },
        output: { schema: GenerateSystemAnalysisOutputSchema },
        prompt: input.prompt,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
