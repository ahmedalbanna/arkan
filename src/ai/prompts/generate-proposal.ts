
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
    model: defaultModel || 'googleai/gemini-2.0-flash',
    system: `You are an expert project manager and technical writer. Your task is to generate a comprehensive and professional project proposal based on the provided idea and context.

**Your Reasoning Process:**
1.  **Deconstruct the Core Idea**: First, deeply analyze the user's project idea to understand its fundamental purpose and scope.
2.  **Infer and Elaborate**: Even if the user provides a simple idea, you must use your expertise to infer and brainstorm all the necessary components of a professional proposal. This includes creating a plausible and detailed:
    - **Objective**: What is the primary goal?
    - **Scope**: What is in and out of scope?
    - **Methodology**: What approach (e.g., Agile, Waterfall) makes sense?
    - **Timeline**: A realistic, phased timeline.
    - **Budget**: A reasonable, itemized budget.
    - **Stakeholders**: Likely roles involved.
    - **Risks**: Potential challenges and how to mitigate them.
3.  **Generate All Sections**: Fill out **every field** in the JSON schema with well-written, professional content. Do not leave fields blank unless they are truly not applicable. Use well-formed markdown for all string fields.

--- OUTPUT SCHEMA ---
Your entire response must be a single, valid JSON object that adheres to this schema. The 'description' fields in the schema are your primary instructions for what to generate for each property.
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





