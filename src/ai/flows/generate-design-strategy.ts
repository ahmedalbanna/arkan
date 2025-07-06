'use server';

/**
 * @fileOverview AI agent for generating a Design Strategy section for a project report.
 * - generateDesignStrategy
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateDesignStrategyInputSchema = z.object({
    proposal: ProjectProposalSchema,
    otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
    otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
    prompt: z.string().describe("The prompt to use for generating the design strategy.")
});
export type GenerateDesignStrategyInput = z.infer<typeof GenerateDesignStrategyInputSchema>;

const GenerateDesignStrategyOutputSchema = z.object({
    designStrategy: z.string().describe("The complete, professionally written 'Design Strategy' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateDesignStrategyOutput = z.infer<typeof GenerateDesignStrategyOutputSchema>;

export async function generateDesignStrategy(input: GenerateDesignStrategyInput): Promise<GenerateDesignStrategyOutput> {
  return generateDesignStrategyFlow(input);
}

const generateDesignStrategyFlow = ai.defineFlow(
  {
    name: 'generateDesignStrategyFlow',
    inputSchema: GenerateDesignStrategyInputSchema,
    outputSchema: GenerateDesignStrategyOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'generateDesignStrategyPrompt',
      input: { schema: GenerateDesignStrategyInputSchema },
      output: { schema: GenerateDesignStrategyOutputSchema },
      prompt: input.prompt,
    });

    const { output } = await prompt(input);
    return output!;
  }
);