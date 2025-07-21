
'use server';

/**
 * @fileOverview AI agent for generating a System Analysis section for a project report.
 * - generateSystemAnalysis
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/agents';

const GenerateSystemAnalysisInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  externalContextContent: z.string().optional().describe("Content from an external document (e.g., a PDF) to use as additional context."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  instructionText: z.string().optional().describe("Additional specific instructions for the generation, derived from user controls like tone and formality."),
});
export type GenerateSystemAnalysisInput = z.infer<typeof GenerateSystemAnalysisInputSchema>;

const GenerateSystemAnalysisOutputSchema = z.object({
  systemAnalysis: z.string().describe("The complete, professionally written 'System Analysis' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemAnalysisOutput = z.infer<typeof GenerateSystemAnalysisOutputSchema>;

export async function generateSystemAnalysis(input: GenerateSystemAnalysisInput): Promise<GenerateSystemAnalysisOutput> {
  return generateSystemAnalysisFlow(input);
}

const generateSystemAnalysisFlow = ai.defineFlow(
  {
    name: 'generateSystemAnalysisFlow',
    inputSchema: GenerateSystemAnalysisInputSchema,
    outputSchema: GenerateSystemAnalysisOutputSchema,
  },
  async (input) => {
    const agent = await getAgent('generate-system-analysis-section');
    if (!agent) throw new Error("Agent configuration not found for 'generate-system-analysis-section'.");
    const agentPrompt = agent.prompt as AgentPrompt;
    const basePrompt = agentPrompt.base;

    const stringifiedProposal = JSON.stringify(input.proposal, null, 2);

    const prompt = ai.definePrompt({
      name: 'generateSystemAnalysisPrompt',
      input: { schema: GenerateSystemAnalysisInputSchema },
      output: { schema: GenerateSystemAnalysisOutputSchema },
      prompt: `${basePrompt}

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
);
