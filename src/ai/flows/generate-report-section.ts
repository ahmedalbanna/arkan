
'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AnyProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/agents';

// This input schema is generic and can handle any section generation.
// The `sectionToGenerate` field tells the flow which agent's prompt to use.
const GenerateSectionInputSchema = z.object({
  proposal: AnyProjectProposalSchema,
  sectionToGenerate: SectionNameSchema,
  otherSections: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => SectionNameSchema.safeParse(key).success);
  }, "All keys must be a valid SectionName").optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => DiagramTypeSchema.safeParse(key).success);
  }, "All keys must be a valid DiagramType").optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  externalContextContent: z.string().optional().describe("Content from an external document (e.g., a PDF) to use as additional context."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  instructionText: z.string().optional().describe("Additional specific instructions for the generation, derived from user controls like tone and formality."),
});
export type GenerateSectionInput = z.infer<typeof GenerateSectionInputSchema>;

// The output is now a static structure, which is more reliable for the AI model.
const GenerateSectionOutputSchema = z.object({
  sectionName: SectionNameSchema.describe("The name of the section that was generated. This must match the 'sectionToGenerate' from the input."),
  content: z.string().describe("The generated markdown content for the specified section."),
});
export type GenerateSectionOutput = z.infer<typeof GenerateSectionOutputSchema>;

export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {
  const { sectionToGenerate } = input;
  const agentId = `generate-${sectionToGenerate}-section`;
  
  const agent = await getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent configuration not found for '${agentId}'.`);
  }
  
  const agentPrompt = agent.prompt as AgentPrompt;
  const basePrompt = agentPrompt.base;

  const stringifiedProposal = JSON.stringify(input.proposal, null, 2);
  
  // A single, dynamic prompt definition.
  const prompt = ai.definePrompt({
    name: 'generateReportSectionPrompt',
    input: { schema: GenerateSectionInputSchema },
    output: { schema: GenerateSectionOutputSchema },
    prompt: `${basePrompt}

CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '${sectionToGenerate}'.

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
{{#if externalContextContent}}
--- ADDITIONAL EXTERNAL CONTEXT ---
{{{externalContextContent}}}
---
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

--- Main Input: Project Proposal ---
\`\`\`json
${stringifiedProposal}
\`\`\`
`,
  });

  const { output } = await prompt(input);
  return output!;
}
