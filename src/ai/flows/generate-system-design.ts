
'use server';

/**
 * @fileOverview AI agent for generating a System Design section for a project report.
 * - generateSystemDesign
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateSystemDesignInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  externalContextContent: z.string().optional().describe("Content from an external document (e.g., a PDF) to use as additional context."),
  guidelines: z.array(z.string()).optional().describe("A list of specific guidelines for the agent to follow."),
  instructionText: z.string().optional().describe("Additional specific instructions for the generation, derived from user controls like tone and formality."),
});
export type GenerateSystemDesignInput = z.infer<typeof GenerateSystemDesignInputSchema>;

const GenerateSystemDesignOutputSchema = z.object({
  systemDesign: z.string().describe("The complete, professionally written 'System Design' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemDesignOutput = z.infer<typeof GenerateSystemDesignOutputSchema>;

export async function generateSystemDesign(input: GenerateSystemDesignInput): Promise<GenerateSystemDesignOutput> {
  return generateSystemDesignFlow(input);
}

const generateSystemDesignFlow = ai.defineFlow(
  {
    name: 'generateSystemDesignFlow',
    inputSchema: GenerateSystemDesignInputSchema,
    outputSchema: GenerateSystemDesignOutputSchema,
  },
  async (input) => {
    const agent = AGENTS.find(a => a.id === 'generate-system-design-section');
    if (!agent) throw new Error("Agent configuration not found.");
    const basePrompt = typeof agent.prompt === 'string' ? agent.prompt : agent.prompt.base;

    const prompt = ai.definePrompt({
      name: 'generateSystemDesignPrompt',
      input: { schema: GenerateSystemDesignInputSchema },
      output: { schema: GenerateSystemDesignOutputSchema },
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
`,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
import { AGENTS } from '@/lib/agents';
