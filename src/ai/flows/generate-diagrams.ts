

'use server';

/**
 * @fileOverview AI agent for generating various PlantUML diagrams.
 */

import { ai } from '@/ai/genkit';
import { GenerateDiagramOutputSchema, type GenerateDiagramInput, type GenerateDiagramOutput, SectionName } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/types';
import { z } from 'genkit';
import {
    ContextAnalyzer,
    AdaptiveModelSelector,
    IntelligentPromptBuilder,
} from '@/ai/core';


export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
    const agentId = `generate-${input.diagramToGenerate}-diagram`;
    const agent = await getAgent(agentId);
    if (!agent) {
        throw new Error(`Agent configuration for diagram type '${input.diagramToGenerate}' not found.`);
    }

    const agentPrompt = agent.prompt as AgentPrompt;
    const basePrompt = agentPrompt.base;

    // 1. Analyze Context
    const contextAnalysis = await ContextAnalyzer.analyzeContext({
        userInput: `Generate a ${input.diagramToGenerate} diagram. ${input.instructionText || ''}`,
        externalContext: input.externalContext,
        guidelines: input.guidelines
    });

    // 2. Select Model
    const modelConfig = AdaptiveModelSelector.selectOptimalModel(contextAnalysis, 'technical');

    // 3. Build Intelligent Prompt
    const intelligentPromptTemplate = IntelligentPromptBuilder.buildPrompt({
        taskType: 'technical',
        domain: 'diagram-generation',
        contextAnalysis,
        userInput: `Please generate a ${input.diagramToGenerate} diagram. ${input.instructionText || ''}`,
        externalContext: input.externalContext,
    });

    const finalSystemPrompt = `${basePrompt}\n\n${intelligentPromptTemplate.system}`;
    
    const stringifiedProposal = input.proposal ? JSON.stringify(input.proposal, null, 2) : '';
    const stringifiedPlan = input.projectPlan ? JSON.stringify(input.projectPlan, null, 2) : '';

    const textContext = input.externalContext?.filter(f => !f.content.startsWith('data:')) || [];
    const mediaContext = input.externalContext?.filter(f => f.content.startsWith('data:')) || [];

    const diagramPrompt = ai.definePrompt({
        name: `generate-${input.diagramToGenerate}-diagram-prompt`,
        input: { schema: z.any() },
        output: { schema: GenerateDiagramOutputSchema },
        system: finalSystemPrompt,
        prompt: `
{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

--- Intelligent Context Analysis ---
${intelligentPromptTemplate.context}
${intelligentPromptTemplate.instructions}

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
            temperature: modelConfig.temperature,
            maxOutputTokens: modelConfig.maxOutputTokens,
        }
    });

    const { output } = await diagramPrompt({ ...input, textContext, mediaContext }, { model: agent.model || modelConfig.modelId });
    if (!output) {
        throw new Error('Diagram generation failed to produce output.');
    }
    return output;
}
