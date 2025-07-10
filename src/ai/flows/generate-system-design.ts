
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
  prompt: z.string().describe("The prompt to use for generating the system design.")
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
      name: 'generateSystemDesignPrompt',
      input: { schema: GenerateSystemDesignInputSchema },
      output: { schema: GenerateSystemDesignOutputSchema },
      prompt: fullPrompt,
    });
    const { output } = await prompt({ proposal, otherSections, otherDiagrams, prompt: basePrompt });
    return output!;
  }
);
