

'use server';

/**
 * @fileOverview AI agent for generating various PlantUML diagrams and their explanations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/types';
import { type GenerateDiagramInput, GenerateDiagramOutputSchema, type GenerateDiagramOutput } from '@/ai/schemas';

export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
    const agentId = `generate-${input.diagramToGenerate}-diagram`;
    const agent = await getAgent(agentId);
    if (!agent) {
        throw new Error(`Agent configuration for diagram type '${input.diagramToGenerate}' not found.`);
    }
    const agentPrompt = agent.prompt as AgentPrompt;
    const systemPrompt = `${agentPrompt.base}
You are also an expert analyst. Before you generate the diagram, you must first review all the provided context sections (proposal, other report sections, other diagrams). From this context, intelligently identify and synthesize only the most relevant information needed to create the requested diagram.
Your final output MUST be a JSON object containing two keys: 'plantUmlCode' and 'explanation'.`;

    const stringifiedProposal = input.proposal ? JSON.stringify(input.proposal, null, 2) : '';
    const stringifiedPlan = input.projectPlan ? JSON.stringify(input.projectPlan, null, 2) : '';

    // Separate media from text files for the prompt
    const textContext = input.externalContext?.filter(f => !f.content.startsWith('data:')) || [];
    const mediaContext = input.externalContext?.filter(f => f.content.startsWith('data:')) || [];

    const diagramPrompt = ai.definePrompt({
        name: `generate-${input.diagramToGenerate}-diagram-prompt`,
        input: { schema: z.any() }, // Using any() since we are manually constructing the payload
        output: { schema: GenerateDiagramOutputSchema },
        system: systemPrompt,
        prompt: `
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
You have access to the following documents. Review them and use the most relevant information to generate the diagram.

{{#if proposal}}
--- Main Input: Project Proposal ---
\`\`\`json
${stringifiedProposal}
\`\`\`
{{/if}}

{{#if projectPlan}}
--- Main Input: Project Plan ---
\`\`\`json
${stringifiedPlan}
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

{{#if textContext}}
--- Additional Textual Context ---
{{#each textContext}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if mediaContext}}
--- Additional Media Context ---
{{#each mediaContext}}
File: {{this.fileName}}
{{media url=this.content}}
---
{{/each}}
{{/if}}
`,
    config: {
        temperature: 0.2, // Low temp for precise PlantUML syntax
        maxOutputTokens: 8192, // Increased to accommodate explanation
    }
    });

    const { output } = await diagramPrompt({ ...input, textContext, mediaContext }, { model: agent.model || 'googleai/gemini-1.5-flash' });
    return output!;
}
