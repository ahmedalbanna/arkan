// f:\arkan\src\ai\flows\generate-proposal.ts

'use server';

/**
 * @fileOverview An AI agent for generating detailed project proposals.
 *
 * - generateProposal - A function that handles the project proposal generation.
 */

import { ai } from '@/ai/genkit';
import { GenerateProposalInputSchema, ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const PromptInputSchema = z.object({
  projectIdea: z.string(),
  guidelines: z.array(z.string()).optional(),
  textContext: z.array(z.object({ fileName: z.string(), content: z.string() })).optional(),
  mediaContext: z.array(z.object({ fileName: z.string(), content: z.string() })).optional(),
});

const jsonSchema = zodToJsonSchema(ProjectProposalSchema, "ProjectProposal");
const schemaString = JSON.stringify(jsonSchema, null, 2);

export const generateProposalPrompt = ai.definePrompt(
  {
    name: 'generateProposalPrompt',
    input: { schema: PromptInputSchema },
    output: { schema: ProjectProposalSchema },
    model: 'googleai/gemini-2.0-flash',
    system: `You are an expert project manager and technical writer. Your task is to generate a comprehensive and professional project proposal based on the provided idea and context.
Your entire response must be a valid JSON object that adheres to the provided output schema.
For all string fields in the schema, you MUST use well-formed markdown syntax. This includes properly formatted lists, bold text, etc., where appropriate.
The 'description' fields in the JSON schema below are your primary instructions for what to generate for each property.

--- OUTPUT SCHEMA ---
${schemaString}
---`,
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
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  },
);

// We wrap the prompt in a flow to handle input processing and ensure a clean interface.
export const generateProposal = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: ProjectProposalSchema,
  },
  async (input): Promise<ProjectProposal> => {
    const { projectIdea, guidelines, externalContext } = input;

    const textContext = externalContext?.filter(f => !f.content.startsWith('data:')) || [];
    const mediaContext = externalContext?.filter(f => f.content.startsWith('data:')) || [];

    const { output } = await generateProposalPrompt({
      projectIdea,
      guidelines,
      textContext,
      mediaContext,
    });

    if (!output) {
      throw new Error("Proposal generation failed to produce an output. The AI may not have had enough context. Please try adding more detail.");
    }

    return output;
  }
);
