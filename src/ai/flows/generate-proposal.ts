

'use server';

/**
 * @fileOverview An AI agent for generating detailed project proposals.
 *
 * - generateProposal - A function that handles the project proposal generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

const GenerateProposalInputSchema = z.object({
  projectIdea: z.string().describe('A short description of the project idea.'),
  prompt: z.string().describe('The base prompt to use for generating the proposal.'),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  externalContext: z.array(z.object({
      fileName: z.string(),
      content: z.string(),
  })).optional().describe("An array of external documents (text or data URIs) provided by the user."),
});

export type GenerateProposalInput = z.infer<typeof GenerateProposalInputSchema>;


export async function generateProposal(input: GenerateProposalInput): Promise<ProjectProposal> {
  const { projectIdea, prompt, guidelines, externalContext } = input;

  const textContext = externalContext?.filter(f => !f.content.startsWith('data:')) || [];
  const mediaContext = externalContext?.filter(f => f.content.startsWith('data:')) || [];
  
  const generateProposalPrompt = ai.definePrompt({
    name: 'generateProposalPrompt',
    input: { schema: z.any() }, // Use any since we construct it manually
    output: { schema: ProjectProposalSchema },
    prompt: `${prompt}

{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if textContext}}
--- IMPORTANT CONTEXT ---
Use the following text as the primary source of truth and context for generating the proposal.
{{#each textContext}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if mediaContext}}
--- IMPORTANT MEDIA CONTEXT ---
Analyze the following files as the primary source of truth and context.
{{#each mediaContext}}
File: {{this.fileName}}
{{media url=this.content}}
---
{{/each}}
{{/if}}

--- Main Input: Project Idea ---
{{{projectIdea}}}
`,
  });

  const { output } = await generateProposalPrompt({ projectIdea, guidelines, textContext, mediaContext });
  return output!;
}
