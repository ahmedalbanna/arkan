

'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import { ai } from '@/ai/genkit';
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput, type GenerateSectionOutput } from '@/ai/schemas';
import { z } from 'genkit';


export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {

  const systemPrompt = `${input.prompt}

You are also an expert analyst. Before you begin writing, you must first review all the provided context sections (proposal, project plan, other report sections, diagrams, etc.). From this context, intelligently identify and synthesize only the most relevant information needed to create the requested report section. Do not simply list information; integrate it into a well-written, coherent narrative.`;

  const reportSectionPrompt = ai.definePrompt({
    name: 'generateReportSectionPrompt', // Static name
    input: { schema: GenerateSectionInputSchema },
    output: { schema: GenerateSectionOutputSchema },
    model: 'googleai/gemini-2.5-flash-lite',
    system: systemPrompt,
    prompt: `
CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

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

--- AVAILABLE CONTEXT FROM PROJECT ---
You have access to the following documents. Review them and use the most relevant information to generate the requested section.

{{#if otherSections}}
--- Other Report Sections & Context ---
{{#each otherSections}}
--- Context Item: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if otherDiagrams}}
--- Other Generated Diagrams (PlantUML) ---
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if externalContext}}
--- Additional Context Files ---
{{#each externalContext}}
--- File: {{this.fileName}} (Type: {{this.type}}) ---
{{{this.content}}}
---
{{/each}}
{{/if}}
`,
    config: {
      temperature: 0.3,
    },
  });

  const { output } = await reportSectionPrompt(input);

  if (!output) {
    console.error(`AI failed to generate content for section: ${input.sectionToGenerate}`);
    throw new Error(`The AI failed to generate a response for the '${input.sectionToGenerate}' section. Please try again.`);
  }

  return output;
}
