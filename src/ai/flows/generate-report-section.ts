

'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateSectionInputSchema = z
  .object({
    flow: z.literal('generate-section'),
    sectionToGenerate: z.string(),
    prompt: z.string().min(10, 'Prompt must be at least 10 characters.'),
    otherSections: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        "A map of previously generated text sections and other textual context (like the proposal or plan). The key is the item's name and the value is the markdown/JSON content.",
      ),
    instructionText: z.string().optional().describe('A dynamically generated instruction string based on UI controls.'),
  })
  .merge(z.object({
    externalContext: z.array(z.object({
      fileName: z.string().min(1),
      content: z.string().min(1),
      type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
    })).optional().describe('An array of external documents (text or data URIs) provided by the user.'),
  }))
  .merge(z
    .object({
      guidelines: z.array(z.string()).optional().describe('A list of specific guidelines for the agent to follow.'),
      instructionText: z
        .string()
        .optional()
        .describe('Additional instructions for generation (e.g., tone, formality).'),
      targetAudience: z.enum([
        'general-public',
        'non-technical-users',
        'students',
        'academics',
        'professionals',
        'stakeholders',
        'investors',
        'vcs',
        'executives',
        'developers',
        'qa-engineers',
        'designers',
        'marketers',
        'sales',
        'customer-support',
        'product-managers',
        'project-managers',
        'healthcare-professionals',
      ]).optional().describe('The intended audience for the content.'),
      tone: z.enum([
        'professional',
        'formal',
        'neutral',
        'friendly',
        'casual',
        'persuasive',
        'informative',
        'confident',
        'empathetic',
        'enthusiastic',
        'authoritative',
        'approachable',
        'analytical',
        'conversational',
      ]).optional().describe('Desired tone (e.g., professional, casual, persuasive).'),
    }));

export type GenerateSectionInput = z.infer<typeof GenerateSectionInputSchema>;

const GenerateSectionOutputSchema = z.object({
  sectionName: z.string().describe("The name of the section that was generated. This must match the 'sectionToGenerate' from the input."),
  content: z.string().describe("The generated markdown content for the specified section."),
});
type GenerateSectionOutput = z.infer<typeof GenerateSectionOutputSchema>;

export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {

  const systemPrompt = `${input.prompt}

You are also an expert analyst. Before you begin writing, you must first review all the provided context sections (proposal, project plan, other report sections, diagrams, etc.). From this context, intelligently identify and synthesize only the most relevant information needed to create the requested report section. Do not simply list information; integrate it into a well-written, coherent narrative.`;

  const reportSectionPrompt = ai.definePrompt({
    name: 'generateReportSectionPrompt', // Static name
    input: { schema: GenerateSectionInputSchema },
    output: { schema: GenerateSectionOutputSchema },
    model: 'ollama/gemma:2b',
    system: systemPrompt,
    prompt: `
Write the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

Output ONLY the markdown content for this section. Do NOT wrap it in JSON or any other format. Just write the section content directly.

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
`,
    config: {
      temperature: 0.3,
    },
  });

  // Call the AI and get plain text response
  const result = await reportSectionPrompt(input);

  // Wrap the plain text in the expected output structure
  const output: GenerateSectionOutput = {
    sectionName: input.sectionToGenerate,
    content: typeof result === 'string' ? result : (result.text || (typeof result.output === 'string' ? result.output : '') || '')
  };

  if (!output.content || output.content.trim().length === 0) {
    throw new Error(`The AI failed to generate a response for the '${input.sectionToGenerate}' section. Please try again.`);
  }

  return output;
}
