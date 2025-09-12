

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
    const basePrompt = agentPrompt.base;

    const stringifiedProposal = input.proposal ? JSON.stringify(input.proposal, null, 2) : '';
    const stringifiedPlan = input.projectPlan ? JSON.stringify(input.projectPlan, null, 2) : '';

    // Separate media from text files for the prompt
    const textContext = input.externalContext?.filter(f => !f.content.startsWith('data:')) || [];
    const mediaContext = input.externalContext?.filter(f => f.content.startsWith('data:')) || [];

    const diagramPrompt = ai.definePrompt({
        name: `generate-${input.diagramToGenerate}-diagram-prompt`,
        input: { schema: z.any() }, // Using any() since we are manually constructing the payload
        output: { schema: GenerateDiagramOutputSchema },
        system: `${basePrompt}
You will also provide a detailed explanation of the generated diagram.
Your final output MUST be a JSON object containing two keys: 'plantUmlCode' and 'explanation'.`,
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

--- Context from Project ---
{{#if textContext}}
--- ADDITIONAL TEXTUAL CONTEXT ---
{{#each textContext}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if mediaContext}}
--- ADDITIONAL MEDIA CONTEXT ---
{{#each mediaContext}}
File: {{this.fileName}}
{{media url=this.content}}
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
${stringifiedProposal}
\`\`\`
{{/if}}

{{#if projectPlan}}
--- Main Input: Project Plan ---
\`\`\`json
${stringifiedPlan}
\`\`\`
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
