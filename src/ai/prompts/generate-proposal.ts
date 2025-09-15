// src/ai/prompts/generate-proposal.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ProjectProposalSchema } from '@/ai/schemas';
import { defaultModel } from '@/ai/config/models';

export const PromptInputSchema = z.object({
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
    model: defaultModel,
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
