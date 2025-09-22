
// src/ai/prompts/generate-proposal.ts
'use server';

import { defaultModel } from '@/ai/config/models';
import { ai } from '@/ai/genkit';
import { GenerateProposalInputSchema, ProjectProposalSchema } from '@/ai/schemas';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const jsonSchema = zodToJsonSchema(ProjectProposalSchema, "ProjectProposal");
const schemaString = JSON.stringify(jsonSchema, null, 2);

export const generateProposalPrompt = ai.definePrompt(
  {
    name: 'generateProposalPrompt',
    input: { schema: GenerateProposalInputSchema }, // Use the updated schema
    output: { schema: z.any() },
    model: defaultModel,
    system: `You are an expert project manager and technical writer. Your task is to generate a comprehensive and professional project proposal based on the provided idea and context.
Your entire response must be a valid JSON object that adheres to the provided output schema.
For all string fields in the schema, you MUST use well-formed markdown syntax. This includes properly formatted lists, bold text, etc., where appropriate.
The 'description' fields in the JSON schema below are your primary instructions for what to generate for each property.

--- OUTPUT SCHEMA ---
${schemaString}
---`,
    prompt: `
{{#if advancedFields}}
--- DETAILED PROJECT REQUIREMENTS ---
The user has provided the following structured details for the project. Use this as the primary source of information to construct the full proposal object.
- **Project Title**: '''{{advancedFields.projectTitle}}'''
- **Project Objective**: '''{{advancedFields.projectObjective}}'''
- **Expected Outcomes**: '''{{advancedFields.expectedOutcomes}}'''
- **Methodology**: '''{{advancedFields.methodology}}'''
- **Timeline**: '''{{advancedFields.timeline}}'''
- **Knowledge & Context**: '''{{advancedFields.knowledge}}'''
{{else}}
--- Main Input: Project Idea ---
{{{projectIdea}}}
{{/if}}

{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if externalContext}}
--- IMPORTANT EXTERNAL CONTEXT ---
Analyze the following files as a primary source of truth and context.
{{#each externalContext}}
--- File: {{this.fileName}} (Type: {{this.type}}) ---
{{#if this.content}}
{{media url=this.content}}
{{/if}}
---
{{/each}}
{{/if}}
`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  },
);



