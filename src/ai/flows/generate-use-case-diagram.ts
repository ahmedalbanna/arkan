
'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Use Case Diagram.
 * - generateUseCaseDiagram
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateUseCaseDiagramInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code."),
  prompt: z.string().describe("The prompt to use for generating the diagram.")
});
export type GenerateUseCaseDiagramInput = z.infer<typeof GenerateUseCaseDiagramInputSchema>;


const GenerateUseCaseDiagramOutputSchema = z.object({
  plantUmlCode: z.string().describe("The complete PlantUML code for the Use Case diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateUseCaseDiagramOutput = z.infer<typeof GenerateUseCaseDiagramOutputSchema>;

export async function generateUseCaseDiagram(input: GenerateUseCaseDiagramInput): Promise<GenerateUseCaseDiagramOutput> {
  return generateUseCaseDiagramFlow(input);
}

const generateUseCaseDiagramFlow = ai.defineFlow(
  {
    name: 'generateUseCaseDiagramFlow',
    inputSchema: GenerateUseCaseDiagramInputSchema,
    outputSchema: GenerateUseCaseDiagramOutputSchema,
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
      name: 'generateUseCaseDiagramPrompt',
      input: { schema: GenerateUseCaseDiagramInputSchema },
      output: { schema: GenerateUseCaseDiagramOutputSchema },
      prompt: fullPrompt,
    });
    const { output } = await prompt({ proposal, otherSections, otherDiagrams, prompt: basePrompt });
    return output!;
  }
);
