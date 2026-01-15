

'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import { ai } from '@/ai/genkit';
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput, type GenerateSectionOutput } from '@/ai/schemas';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';


export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {

  const systemPrompt = `${input.prompt}

You are also an expert analyst. Before you begin writing, you must first review all the provided context sections (proposal, project plan, other report sections, diagrams, etc.). From this context, intelligently identify and synthesize only the most relevant information needed to create the requested report section. Do not simply list information; integrate it into a well-written, coherent narrative.`;

  const reportSectionPrompt = ai.definePrompt({
    name: 'generateReportSectionPrompt', // Static name
    input: { schema: GenerateSectionInputSchema },
    output: { schema: GenerateSectionOutputSchema },
    model: 'ollama/phi3:mini-4k',

    system: systemPrompt,
    prompt: `
${getJsonPromptInstructions(`{
  "sectionName": "{{sectionToGenerate}}",
  "content": "Complete section content in markdown format"
}`)}

CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

{{#if guidelines}}
--- Guidelines ---\n
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if instructionText}}
--- Additional Instructions ---\n
{{{instructionText}}}
{{/if}}

--- AVAILABLE CONTEXT FROM PROJECT ---\n
You have access to the following documents. Review them and use the most relevant information to generate the requested section.

{{#if otherSections}}
--- Other Report Sections & Context ---\n
{{#each otherSections}}
--- Context Item: {{@key}} ---\n
{{{this}}}
---
{{/each}}
{{/if}}

{{#if otherDiagrams}}
--- Other Generated Diagrams (PlantUML) ---\n
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---\n
{{{this}}}
---
{{/each}}
{{/if}}

{{#if externalContext}}
--- Additional Context Files ---\n
{{#each externalContext}}
--- File: {{this.fileName}} (Type: {{this.type}}) ---\n
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if ragContext}}
--- RAG RETRIEVED CONTEXT (Most Relevant Information) ---\n
{{{ragContext}}}
---
{{/if}}

**JSON Output:**`,
    config: {
      responseSchema: GenerateSectionOutputSchema,
      temperature: RECOMMENDED_TEMPERATURES.BALANCED,
    },
  });

  try {
    const { output } = await reportSectionPrompt(input);

    if (!output) {
      throw new Error('No output received from the model.');
    }

    const validation = validateJsonOutput({
      schema: GenerateSectionOutputSchema,
      output,
      flowName: 'generateReportSection',
      attemptRecovery: true,
      enableLogging: true,
      fallbackFn: (rawOutput) => {
        if (typeof rawOutput === 'string') {
          return {
            sectionName: input.sectionToGenerate,
            content: rawOutput,
          };
        }
        return null;
      },
    });

    if (!validation.success) {
      throw new Error(validation.error || 'Failed to validate output');
    }

    return validation.data!;
  } catch (error) {
    console.error(`AI failed to generate content for section: ${input.sectionToGenerate}`, error);
    throw new Error(`The AI failed to generate a response for the '${input.sectionToGenerate}' section: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
