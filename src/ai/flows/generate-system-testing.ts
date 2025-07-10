
'use server';

/**
 * @fileOverview AI agent for generating a System Testing section for a project report.
 * - generateSystemTesting
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateSystemTestingInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  prompt: z.string().describe("The prompt to use for generating the system testing section.")
});
export type GenerateSystemTestingInput = z.infer<typeof GenerateSystemTestingInputSchema>;

const GenerateSystemTestingOutputSchema = z.object({
  systemTesting: z.string().describe("The complete, professionally written 'System Testing' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemTestingOutput = z.infer<typeof GenerateSystemTestingOutputSchema>;

export async function generateSystemTesting(input: GenerateSystemTestingInput): Promise<GenerateSystemTestingOutput> {
  return generateSystemTestingFlow(input);
}

const generateSystemTestingFlow = ai.defineFlow(
  {
    name: 'generateSystemTestingFlow',
    inputSchema: GenerateSystemTestingInputSchema,
    outputSchema: GenerateSystemTestingOutputSchema,
  },
  async ({ proposal, otherSections, otherDiagrams, prompt: basePrompt }) => {

    const contextContent = [];
    if (otherSections && Object.keys(otherSections).length > 0) {
        contextContent.push('--- PREVIOUSLY GENERATED SECTIONS ---');
        for (const [sectionName, content] of Object.entries(otherSections)) {
            contextContent.push(`--- Section: ${sectionName} ---\n${content}\n---`);
        }
    }
    if (otherDiagrams && Object.keys(otherDiagrams).length > 0) {
        contextContent.push('--- PREVIOUSLY GENERATED DIAGRAMS (PlantUML) ---');
        for (const [diagramType, diagramCode] of Object.entries(otherDiagrams)) {
            contextContent.push(`--- Diagram: ${diagramType} ---\n${diagramCode}\n---`);
        }
    }
    const contextString = contextContent.join('\n\n');

    const fullPrompt = `${basePrompt}
    
${contextString}

--- Main Input: Project Proposal ---
\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`
`;
    const prompt = ai.definePrompt({
      name: 'generateSystemTestingPrompt',
      input: { schema: GenerateSystemTestingInputSchema },
      output: { schema: GenerateSystemTestingOutputSchema },
      prompt: fullPrompt,
    });
    const { output } = await prompt({ proposal, otherSections, otherDiagrams, prompt: basePrompt });
    return output!;
  }
);
