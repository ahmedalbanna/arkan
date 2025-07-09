'use server';

/**
 * @fileOverview AI agent for generating a Conclusion section for a project report.
 * - generateConclusion
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateConclusionInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
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
    const fullPrompt = `${input.prompt}

To ensure your response is consistent and well-integrated with the rest of the document, please consider the context from the sections and diagrams that have already been generated:
{{#if otherSections}}
--- PREVIOUSLY GENERATED SECTIONS ---
{{#each otherSections}}
--- Section: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}
{{#if otherDiagrams}}
--- PREVIOUSLY GENERATED DIAGRAMS (PlantUML) ---
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

--- Main Input: Project Proposal ---
\`\`\`json
{{{json proposal}}}
\`\`\`
`;
    const prompt = ai.definePrompt({
      name: 'generateConclusionPrompt',
      input: { schema: GenerateConclusionInputSchema },
      output: { schema: GenerateConclusionOutputSchema },
      prompt: fullPrompt,
    });

    const { output } = await prompt(input);
    return output!;
  }
);
