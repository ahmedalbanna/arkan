
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
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/agents';


const GeneratePresentationInputSchema = z.object({
  proposal: ProjectProposalSchema.optional(),
  sections: z.record(SectionNameSchema, z.string()).optional(),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  guidelines: z.array(z.string()).optional(),
  externalContext: z.array(z.object({
      fileName: z.string(),
      content: z.string(),
  })).optional().describe("An array of external documents (text or data URIs) provided by the user."),
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
    const agent = await getAgent('generate-presentation');
    if (!agent) throw new Error("Presentation agent configuration not found.");
    const agentPrompt = agent.prompt as AgentPrompt;
    const basePrompt = agentPrompt.base;

    const stringifiedProposal = input.proposal ? JSON.stringify(input.proposal, null, 2) : '';

    // Separate media from text files for the prompt
    const textContext = input.externalContext?.filter(f => !f.content.startsWith('data:')) || [];
    const mediaContext = input.externalContext?.filter(f => f.content.startsWith('data:')) || [];

    const prompt = ai.definePrompt({
      name: 'generatePresentationPrompt',
      input: { schema: z.any() }, // Using any() since we are manually constructing the payload
      output: { schema: GeneratePresentationOutputSchema },
      prompt: `${basePrompt}

{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

--- Context from Project ---
{{#if textContext}}
--- ADDITIONAL TEXTUAL CONTEXT ---
{{#each textContext}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if mediaContext}}
--- ADDITIONAL MEDIA CONTEXT ---
{{#each mediaContext}}
File: {{this.fileName}}
{{media url=this.content}}
---
{{/each}}
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
{{#each diagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if proposal}}
--- Main Input: Project Proposal ---
\`\`\`json
${stringifiedProposal}
\`\`\`
{{/if}}
`,
    });

    const { output } = await prompt({ ...input, textContext, mediaContext });
    return output!;
  }
);
