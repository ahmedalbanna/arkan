

'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/agents';
import { GenerateSectionInputSchema, type GenerateSectionInput, GenerateSectionOutputSchema, type GenerateSectionOutput } from '@/ai/schemas';

// Define the prompt outside the flow to prevent re-registration
const reportSectionPrompt = ai.definePrompt({
    name: 'generateReportSectionPrompt', // Static name
    input: { schema: z.any() }, // Input is manually constructed
    output: { schema: GenerateSectionOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    system: '{{systemPrompt}}', // System prompt will be passed in
    prompt: `
CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

{{#if tableOfContents}}
--- SECTION REPORT STRUCTURE (TABLE OF CONTENTS) ---
{{#each tableOfContents}}
- {{{this}}}
{{/each}}
Your section, '{{sectionToGenerate}}', fits into this overall structure. Write your content accordingly.
---
{{/if}}

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

--- Context from Project ---
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

{{#if otherSections}}
--- PREVIOUSLY GENERATED SECTIONS ---
{{#each otherSections}}
--- Section: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}
{{#if otherDiagrams}}
--- PREVIOUSLY GENERATED DIAGRAMS (PlantUML) ---
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

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
`,
  });


export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {
  const { sectionToGenerate } = input;
  const agentId = `generate-${sectionToGenerate}-section`;
  
  const agent = await getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent configuration not found for '${agentId}'.`);
  }
  
  const agentPrompt = agent.prompt as AgentPrompt;
  const systemPrompt = agentPrompt.base;

  const stringifiedProposal = input.proposal ? JSON.stringify(input.proposal, null, 2) : '';
  const stringifiedPlan = input.projectPlan ? JSON.stringify(input.projectPlan, null, 2) : '';
  
  const { output } = await reportSectionPrompt({ 
    ...input, 
    systemPrompt, 
    stringifiedProposal,
    stringifiedPlan
  });
  
  return output!;
}
