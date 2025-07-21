
'use server';

/**
 * @fileOverview AI agent for generating a Conclusion section for a project report.
 * - generateConclusion
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/agents';

const GenerateConclusionInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  externalContextContent: z.string().optional().describe("Content from an external document (e.g., a PDF) to use as additional context."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  instructionText: z.string().optional().describe("Additional specific instructions for the generation, derived from user controls like tone and formality."),
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
    const agent = await getAgent('generate-conclusion-section');
    if (!agent) throw new Error("Agent configuration not found for 'generate-conclusion-section'.");
    const agentPrompt = agent.prompt as AgentPrompt;
    const basePrompt = agentPrompt.base;

    const prompt = ai.definePrompt({
      name: 'generateConclusionPrompt',
      input: { schema: GenerateConclusionInputSchema },
      output: { schema: GenerateConclusionOutputSchema },
      prompt: `${basePrompt}

{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if instructionText}}
--- Additional Instructions ---
{{{instructionText}}}
{{/if}}

--- Context from Project ---
{{#if externalContextContent}}
--- ADDITIONAL EXTERNAL CONTEXT ---
{{{externalContextContent}}}
---
{{/if}}
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
{{{jsonEncode proposal}}}
\`\`\`
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);
