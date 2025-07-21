
'use server';

/**
 * @fileOverview AI agent for generating various PlantUML diagrams.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { AGENTS } from '@/lib/agents';

// Define a generic input schema that can be used by all diagram generation flows.
const GenerateDiagramInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context."),
  externalContextContent: z.string().optional().describe("Content from an external document to use as additional context."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  instructionText: z.string().optional().describe("Additional instructions for generation (e.g., tone, formality)."),
  diagramType: DiagramTypeSchema.describe("The type of diagram to generate."),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

const GenerateDiagramOutputSchema = z.object({
  plantUmlCode: z.string().describe("The complete PlantUML code for the diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;


export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
    const agent = AGENTS.find(a => a.id === `generate-${input.diagramType}-diagram`);
    if (!agent) {
        throw new Error(`Agent configuration for diagram type '${input.diagramType}' not found.`);
    }
    const basePrompt = typeof agent.prompt === 'string' ? agent.prompt : agent.prompt.base;

    const diagramPrompt = ai.definePrompt({
        name: `${input.diagramType}DiagramPrompt`,
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

--- Main Input: Project Proposal ---
\`\`\`json
{{{jsonEncode proposal}}}
\`\`\`
`
    });
    
    const { output } = await diagramPrompt(input);
    return output!;
}
