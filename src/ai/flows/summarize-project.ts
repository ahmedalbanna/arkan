'use server';

/**
 * @fileOverview A flow for summarizing uploaded projects using AI.
 *
 * - summarizeProject - A function that handles the project summarization process.
 * - SummarizeProjectInput - The input type for the summarizeProject function.
 * - SummarizeProjectOutput - The return type for the summarizeProject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeProjectInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('The detailed description of the project that needs to be summarized.'),
  prompt: z.string().describe('The prompt to use for generating the summary.')
});
export type SummarizeProjectInput = z.infer<typeof SummarizeProjectInputSchema>;

const SummarizeProjectOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the project.'),
  progress: z.string().describe('Details on the summarization progress'),
});
export type SummarizeProjectOutput = z.infer<typeof SummarizeProjectOutputSchema>;

export async function summarizeProject(input: SummarizeProjectInput): Promise<SummarizeProjectOutput> {
  return summarizeProjectFlow(input);
}

const summarizeProjectFlow = ai.defineFlow(
  {
    name: 'summarizeProjectFlow',
    inputSchema: SummarizeProjectInputSchema,
    outputSchema: SummarizeProjectOutputSchema,
  },
  async input => {
    const summarizeProjectPrompt = ai.definePrompt({
        name: 'summarizeProjectPrompt',
        input: {schema: SummarizeProjectInputSchema},
        output: {schema: SummarizeProjectOutputSchema},
        prompt: input.prompt,
    });

    const {output} = await summarizeProjectPrompt(input);
    return {
      ...output!,
      progress: 'Generated a concise summary of the project.',
    };
  }
);
