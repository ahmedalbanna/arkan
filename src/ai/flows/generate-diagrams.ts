
'use server';

/**
 * @fileOverview AI agent for generating various PlantUML diagrams.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/agents';

// Define a generic input schema that can be used by all diagram generation flows.
const GenerateDiagramInputSchema = z.object({
  proposal: ProjectProposalSchema.optional(),
  diagramToGenerate: DiagramTypeSchema.describe("The type of diagram to generate."),
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context."),
  externalContextContent: z.string().optional().describe("Content from an external document to use as additional context."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  instructionText: z.string().optional().describe("Additional instructions for generation (e.g., tone, formality)."),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

const GenerateDiagramOutputSchema = z.object({
  plantUmlCode: z.string().describe("The complete PlantUML code for the diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;


export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
    const agentId = `generate-${input.diagramToGenerate}-diagram`;
    const agent = await getAgent(agentId);
    if (!agent) {
        throw new Error(`Agent configuration for diagram type '${input.diagramToGenerate}' not found.`);
    }
    const agentPrompt = agent.prompt as AgentPrompt;
    const basePrompt = agentPrompt.base;

    const stringifiedProposal = input.proposal ? JSON.stringify(input.proposal, null, 2) : '';

    const diagramPrompt = ai.definePrompt({
        name: `generate-${input.diagramToGenerate}-diagram-prompt`,
        input: { schema: GenerateDiagramInputSchema },
        output: { schema: GenerateDiagramOutputSchema },
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

{{#if proposal}}
--- Main Input: Project Proposal ---
\`\`\`json
${stringifiedProposal}
\`\`\`
{{/if}}
`
    });
    
    const { output } = await diagramPrompt(input);
    return output!;
}
