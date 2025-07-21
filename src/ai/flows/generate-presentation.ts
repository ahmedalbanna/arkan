
'use server';

/**
 * @fileOverview An AI agent for generating presentation slides from a project proposal and report.
 * - generatePresentation
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ProjectProposalSchema,
  DiagramTypeSchema,
  SectionNameSchema,
  PresentationSlideSchema,
} from '@/ai/schemas';

const GeneratePresentationInputSchema = z.object({
  proposal: ProjectProposalSchema,
  sections: z.record(SectionNameSchema, z.string()).optional(),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  externalContextContent: z.string().optional(),
  templateId: z.string(), // The ID of the template which contains the primary agent and other config
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

const GeneratePresentationOutputSchema = z.object({
  slides: z.array(PresentationSlideSchema),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;


export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async (input) => {
    const agent = AGENTS.find(a => a.id === 'generate-presentation');
    if (!agent) throw new Error("Presentation agent configuration not found.");
    const basePrompt = typeof agent.prompt === 'string' ? agent.prompt : agent.prompt.base;

    const stringifiedProposal = JSON.stringify(input.proposal, null, 2);

    const prompt = ai.definePrompt({
      name: 'generatePresentationPrompt',
      input: { schema: GeneratePresentationInputSchema },
      output: { schema: GeneratePresentationOutputSchema },
      prompt: `${basePrompt}

{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

--- Context from Project ---
{{#if externalContextContent}}
--- ADDITIONAL EXTERNAL CONTEXT ---
{{{externalContextContent}}}
---
{{/if}}
{{#if sections}}
--- REPORT SECTIONS ---
{{#each sections}}
--- Section: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}
{{#if diagrams}}
--- DIAGRAMS (PlantUML) ---
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

--- Main Input: Project Proposal ---
\`\`\`json
${stringifiedProposal}
\`\`\`
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);
// Import must be at the bottom to avoid circular dependency issues
import { AGENTS } from '@/lib/agents';
