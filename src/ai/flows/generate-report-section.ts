

'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import { ai } from '@/ai/genkit';
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput, type GenerateSectionOutput } from '@/ai/schemas';
import { AgentPrompt } from '@/lib/models/agent';
import { z } from 'genkit';

// Define a specific schema for the prompt's input variables for better type safety and clarity.
const ReportSectionPromptInputSchema = GenerateSectionInputSchema.extend({
  stringifiedProposal: z.string(),
  stringifiedPlan: z.string(),
  agentPrompt: z.any(), // The full agent prompt object
});

export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {

  const agentPrompt = input.agentPrompt as AgentPrompt;
  const systemPrompt = `${agentPrompt.base}

You are also an expert analyst. Before you begin writing, you must first review all the provided context sections (proposal, project plan, other report sections, diagrams, etc.). From this context, intelligently identify and synthesize only the most relevant information needed to create the requested report section. Do not simply list information; integrate it into a well-written, coherent narrative.`;

  const reportSectionPrompt = ai.definePrompt({
    name: 'generateReportSectionPrompt', // Static name
    input: { schema: ReportSectionPromptInputSchema },
    output: { schema: GenerateSectionOutputSchema },
    model: input.model || 'googleai/gemini-2.0-flash',
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

{{#if proposal}}
--- Main Input: Project Proposal ---
\`\`\`json
{{{stringifiedProposal}}}
\`\`\`
{{else}}
(No project proposal is being used for this generation. Rely on other provided context.)
{{/if}}

{{#if projectPlan}}
--- Main Input: Project Plan ---
\`\`\`json
{{{stringifiedPlan}}}
\`\`\`
{{/if}}

{{#if otherSections}}
--- Other Report Sections ---
{{#each otherSections}}
--- Section: {{@key}} ---
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

{{#if exampleFiles}}
--- IMPORTANT EXAMPLES (STYLE REFERENCE) ---
You MUST heavily reference the following content for style, tone, and structure.
{{#each exampleFiles}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if contextFiles}}
--- FACTUAL CONTEXT ---
Use the following content for information and data.
{{#each contextFiles}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}
`,
    config: {
      temperature: 0.3,
    },
  });

  const promptVariables = {
    ...input,
    stringifiedProposal: input.proposal ? JSON.stringify(input.proposal, null, 2) : '',
    stringifiedPlan: input.projectPlan ? JSON.stringify(input.projectPlan, null, 2) : '',
    agentPrompt: agentPrompt,
  };

  const { output } = await reportSectionPrompt(promptVariables);

  if (!output) {
    console.error(`AI failed to generate content for section: ${input.sectionToGenerate}`);
    throw new Error(`The AI failed to generate a response for the '${input.sectionToGenerate}' section. Please try again.`);
  }

  return output;
}
