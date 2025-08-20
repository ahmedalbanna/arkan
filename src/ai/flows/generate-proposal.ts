

'use server';

/**
 * @fileOverview An AI agent for generating detailed project proposals.
 *
 * - generateProposal - A function that handles the project proposal generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateProposalInputSchema, type GenerateProposalInput } from '@/ai/schemas';

export async function generateProposal(input: GenerateProposalInput): Promise<string> {
  const { projectIdea, prompt, guidelines, externalContext } = input;

  const textContext = externalContext?.filter(f => !f.content.startsWith('data:')) || [];
  const mediaContext = externalContext?.filter(f => f.content.startsWith('data:')) || [];

  const systemPrompt = `${'\'\'\''}${prompt}'\'\'\''}\n\nYour entire response must be a single, well-formatted markdown document. Do not include any conversational text or explanations.`;
  
  let userPrompt = `
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
`;
  
  const llmResponse = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    system: systemPrompt,
    prompt: userPrompt,
    context: { guidelines, textContext, mediaContext, projectIdea },
    config: {
      temperature: 0.8,
      maxOutputTokens: 8192,
    }
  });

  const output = llmResponse.text;

  if (!output) {
      throw new Error("Proposal generation failed to produce an output. The AI may not have had enough context. Please try adding more detail.");
  }

  // Clean up the output to remove any potential markdown code fences
  return output.replace(/```markdown/g, '').replace(/```/g, '').trim();
}
