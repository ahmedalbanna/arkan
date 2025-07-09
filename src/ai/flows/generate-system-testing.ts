'use server';

/**
 * @fileOverview AI agent for generating a System Testing section for a project report.
 * - generateSystemTesting
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateSystemTestingInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
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
      name: 'generateSystemTestingPrompt',
      input: { schema: GenerateSystemTestingInputSchema },
      output: { schema: GenerateSystemTestingOutputSchema },
      prompt: fullPrompt,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
