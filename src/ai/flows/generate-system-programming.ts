'use server';

/**
 * @fileOverview AI agent for generating a System Programming section for a project report.
 * - generateSystemProgramming
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema } from '@/ai/schemas';

const GenerateSystemProgrammingInputSchema = z.object({
    proposal: ProjectProposalSchema,
    prompt: z.string().describe("The prompt to use for generating the system programming section.")
});
export type GenerateSystemProgrammingInput = z.infer<typeof GenerateSystemProgrammingInputSchema>;

const GenerateSystemProgrammingOutputSchema = z.object({
    systemProgramming: z.string().describe("The complete, professionally written 'System Programming and Implementation' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemProgrammingOutput = z.infer<typeof GenerateSystemProgrammingOutputSchema>;

export async function generateSystemProgramming(input: GenerateSystemProgrammingInput): Promise<GenerateSystemProgrammingOutput> {
  return generateSystemProgrammingFlow(input);
}

const generateSystemProgrammingFlow = ai.defineFlow(
  {
    name: 'generateSystemProgrammingFlow',
    inputSchema: GenerateSystemProgrammingInputSchema,
    outputSchema: GenerateSystemProgrammingOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'generateSystemProgrammingPrompt',
        input: { schema: GenerateSystemProgrammingInputSchema },
        output: { schema: GenerateSystemProgrammingOutputSchema },
        prompt: input.prompt,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
