'use server';

/**
 * @fileOverview AI agent for generating a System Design section for a project report.
 * - generateSystemDesign
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

const GenerateSystemDesignInputSchema = z.object({
    proposal: ProjectProposalSchema,
    prompt: z.string().describe("The prompt to use for generating the system design.")
});
export type GenerateSystemDesignInput = z.infer<typeof GenerateSystemDesignInputSchema>;

const GenerateSystemDesignOutputSchema = z.object({
    systemDesign: z.string().describe("The complete, professionally written 'System Design' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemDesignOutput = z.infer<typeof GenerateSystemDesignOutputSchema>;

export async function generateSystemDesign(input: GenerateSystemDesignInput): Promise<GenerateSystemDesignOutput> {
  return generateSystemDesignFlow(input);
}

const generateSystemDesignFlow = ai.defineFlow(
  {
    name: 'generateSystemDesignFlow',
    inputSchema: GenerateSystemDesignInputSchema,
    outputSchema: GenerateSystemDesignOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateSystemDesignPrompt',
      input: { schema: ProjectProposalSchema },
      output: { schema: GenerateSystemDesignOutputSchema },
      prompt: input.prompt,
    });
    const { output } = await prompt(input.proposal);
    return output!;
  }
);
