
'use server';

/**
 * @fileOverview AI agent for generating a System Design section for a project report.
 * - generateSystemDesign
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateSystemDesignInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  prompt: z.string().describe("The full prompt to use for generating the system design, including context.")
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
      input: { schema: GenerateSystemDesignInputSchema },
      output: { schema: GenerateSystemDesignOutputSchema },
      prompt: input.prompt, // Use the fully composed prompt passed from the API layer
    });
    const { output } = await prompt(input);
    return output!;
  }
);
