
'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import { ai } from '@/ai/genkit';
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput, type GenerateSectionOutput } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/types';
import { z } from 'genkit';
import {
    ContextAnalyzer,
    AdaptiveModelSelector,
    IntelligentPromptBuilder,
} from '@/ai/core';

// This is the main flow that will be called by the API
export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {
    const { sectionToGenerate } = input;
    const agentId = `generate-${sectionToGenerate}-section`;

    const agent = await getAgent(agentId);
    if (!agent) {
        console.error(`Agent configuration not found for ID: '${agentId}'`);
        throw new Error(`Configuration for the report section '${sectionToGenerate}' is missing or invalid.`);
    }

    const agentPrompt = agent.prompt as AgentPrompt;
    const basePrompt = agentPrompt.base;

    // 1. Analyze Context
    const contextAnalysis = await ContextAnalyzer.analyzeContext({
        userInput: `Generate the ${sectionToGenerate} section. ${input.instructionText || ''}`,
        externalContext: input.externalContext,
        guidelines: input.guidelines
    });

    // 2. Select Model
    const modelConfig = AdaptiveModelSelector.selectOptimalModel(contextAnalysis, 'technical');

    // 3. Build Intelligent Prompt
    const intelligentPromptTemplate = IntelligentPromptBuilder.buildPrompt({
        taskType: 'technical',
        domain: `report-generation-${sectionToGenerate}`,
        contextAnalysis,
        userInput: `Please generate the content for the '${sectionToGenerate}' section of the report.`,
        externalContext: input.externalContext,
    });

    const finalSystemPrompt = `${basePrompt}\n\n${intelligentPromptTemplate.system}`;
    const stringifiedProposal = input.proposal ? JSON.stringify(input.proposal, null, 2) : '';
    const stringifiedPlan = input.projectPlan ? JSON.stringify(input.projectPlan, null, 2) : '';

    const textContext = input.externalContext?.filter(f => !f.content.startsWith('data:')) || [];
    const mediaContext = input.externalContext?.filter(f => f.content.startsWith('data:')) || [];

    // Define the prompt dynamically within the flow
    const reportSectionPrompt = ai.definePrompt({
        name: `generate-report-section-prompt-${sectionToGenerate}`, // Dynamic name to avoid conflicts
        input: { schema: z.any() },
        output: { schema: GenerateSectionOutputSchema },
        system: finalSystemPrompt,
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

--- Intelligent Context Analysis ---
${intelligentPromptTemplate.context}
${intelligentPromptTemplate.instructions}
---

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

    const promptVariables = {
        ...input,
        stringifiedProposal,
        stringifiedPlan,
        exampleFiles: input.exampleFiles,
        contextFiles: input.contextFiles,
    };

    const { output } = await reportSectionPrompt(
        promptVariables,
        { model: agent.model || modelConfig.modelId, ...modelConfig }
    );

    if (!output) {
        console.error(`AI failed to generate content for section: ${sectionToGenerate}`);
        throw new Error(`The AI failed to generate a response for the '${sectionToGenerate}' section. Please try again.`);
    }

    return output;
}
