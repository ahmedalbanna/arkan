
'use server';

/**
 * @fileOverview An AI agent for generating a project introduction from a full proposal.
 *
 * - generateIntroduction - A function that handles the project introduction generation.
 * - GenerateIntroductionInput - The input type for the generateIntroduction function (the full proposal).
 * - GenerateIntroductionOutput - The return type for the generateIntroduction function (the introduction text).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/agents';

const GenerateIntroductionInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  externalContextContent: z.string().optional().describe("Content from an external document (e.e., a PDF) to use as additional context."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  instructionText: z.string().optional().describe("Additional specific instructions for the generation, derived from user controls like tone and formality."),
});
export type GenerateIntroductionInput = z.infer<typeof GenerateIntroductionInputSchema>;

const GenerateIntroductionOutputSchema = z.object({
  introduction: z.string().describe("The complete, professionally written introduction for the project proposal document, formatted as a single string with markdown for paragraphs.")
});
export type GenerateIntroductionOutput = z.infer<typeof GenerateIntroductionOutputSchema>;

export async function generateIntroduction(input: GenerateIntroductionInput): Promise<GenerateIntroductionOutput> {
  return generateIntroductionFlow(input);
}

const generateIntroductionFlow = ai.defineFlow(
  {
    name: 'generateIntroductionFlow',
    inputSchema: GenerateIntroductionInputSchema,
    outputSchema: GenerateIntroductionOutputSchema,
  },
  async (input) => {
    const agent = await getAgent('generate-introduction-section');
    if (!agent) throw new Error("Agent configuration not found for 'generate-introduction-section'.");
    const agentPrompt = agent.prompt as AgentPrompt;
    const basePrompt = agentPrompt.base;

    // Stringify the proposal object before including it in the prompt
    const stringifiedProposal = JSON.stringify(input.proposal, null, 2);

    const generateIntroductionPrompt = ai.definePrompt({
      name: 'generateIntroductionPrompt',
      input: { schema: GenerateIntroductionInputSchema },
      output: { schema: GenerateIntroductionOutputSchema },
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
```json
${stringifiedProposal}
```
`,
    });

    const { output } = await generateIntroductionPrompt(input);
    return output!;
  }
);
