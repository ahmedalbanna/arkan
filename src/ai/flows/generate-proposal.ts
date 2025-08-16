

'use server';

/**
 * @fileOverview An AI agent for generating detailed project proposals.
 *
 * - generateProposal - A function that handles the project proposal generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectProposalSchema, type ProjectProposal, GenerateProposalInputSchema, type GenerateProposalInput } from '@/ai/schemas';

export async function generateProposal(input: GenerateProposalInput): Promise<ProjectProposal> {
  const { projectIdea, prompt, guidelines, externalContext } = input;

  const textContext = externalContext?.filter(f => !f.content.startsWith('data:')) || [];
  const mediaContext = externalContext?.filter(f => f.content.startsWith('data:')) || [];
  
  const generateProposalPrompt = ai.definePrompt({
    name: 'generateProposalPrompt',
    input: { schema: z.any() }, // Use any since we construct it manually
    output: { schema: ProjectProposalSchema },
    model: 'googleai/gemini-1.5-flash',
    system: prompt,
    prompt: `
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
    config: {
        temperature: 0.8, // Higher temperature for more creative/detailed proposals
        maxOutputTokens: 8192, // Allow for very detailed proposals
    }
  });

  const { output } = await generateProposalPrompt({ projectIdea, guidelines, textContext, mediaContext });
  return output!;
}
