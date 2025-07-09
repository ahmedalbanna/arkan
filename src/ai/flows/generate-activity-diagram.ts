'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Activity Diagram.
 * - generateActivityDiagram
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateActivityDiagramInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code."),
  prompt: z.string().describe("The prompt to use for generating the diagram.")
});
export type GenerateActivityDiagramInput = z.infer<typeof GenerateActivityDiagramInputSchema>;


const GenerateActivityDiagramOutputSchema = z.object({
  plantUmlCode: z.string().describe("The complete PlantUML code for the Activity diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateActivityDiagramOutput = z.infer<typeof GenerateActivityDiagramOutputSchema>;

export async function generateActivityDiagram(input: GenerateActivityDiagramInput): Promise<GenerateActivityDiagramOutput> {
  return generateActivityDiagramFlow(input);
}

const generateActivityDiagramFlow = ai.defineFlow(
  {
    name: 'generateActivityDiagramFlow',
    inputSchema: GenerateActivityDiagramInputSchema,
    outputSchema: GenerateActivityDiagramOutputSchema,
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
      name: 'generateActivityDiagramPrompt',
      input: { schema: GenerateActivityDiagramInputSchema },
      output: { schema: GenerateActivityDiagramOutputSchema },
      prompt: fullPrompt,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
