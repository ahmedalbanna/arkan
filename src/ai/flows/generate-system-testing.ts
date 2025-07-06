'use server';

/**
 * @fileOverview AI agent for generating a System Testing section for a project report.
 * - generateSystemTesting
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema } from '@/ai/schemas';

const GenerateSystemTestingInputSchema = z.object({
    proposal: ProjectProposalSchema,
    prompt: z.string().describe("The prompt to use for generating the system testing section.")
});
export type GenerateSystemTestingInput = z.infer<typeof GenerateSystemTestingInputSchema>;

const GenerateSystemTestingOutputSchema = z.object({
    systemTesting: z.string().describe("The complete, professionally written 'System Testing' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemTestingOutput = z.infer<typeof GenerateSystemTestingOutputSchema>;

export async function generateSystemTesting(input: GenerateSystemTestingInput): Promise<GenerateSystemTestingOutput> {
  return generateSystemTestingFlow(input);
}

const generateSystemTestingFlow = ai.defineFlow(
  {
    name: 'generateSystemTestingFlow',
    inputSchema: GenerateSystemTestingInputSchema,
    outputSchema: GenerateSystemTestingOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'generateSystemTestingPrompt',
        input: { schema: GenerateSystemTestingInputSchema },
        output: { schema: GenerateSystemTestingOutputSchema },
        prompt: input.prompt,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
