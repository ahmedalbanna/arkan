'use server';

/**
 * @fileOverview AI agent for generating a System Analysis section for a project report.
 * - generateSystemAnalysis
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateSystemAnalysisInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
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
      name: 'generateSystemAnalysisPrompt',
      input: { schema: GenerateSystemAnalysisInputSchema },
      output: { schema: GenerateSystemAnalysisOutputSchema },
      prompt: fullPrompt,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
