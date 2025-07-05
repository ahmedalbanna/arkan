'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Use Case Diagram.
 * - generateUseCaseDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema } from '@/ai/schemas';

const DiagramTypeEnum = z.enum([
    'useCase',
    'class',
    'sequence',
    'activity',
    'component',
    'archimate',
]);

const GenerateUseCaseDiagramInputSchema = z.object({
    proposal: ProjectProposalSchema,
    otherDiagrams: z.record(DiagramTypeEnum, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code.")
});
export type GenerateUseCaseDiagramInput = z.infer<typeof GenerateUseCaseDiagramInputSchema>;


const GenerateUseCaseDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the Use Case diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateUseCaseDiagramOutput = z.infer<typeof GenerateUseCaseDiagramOutputSchema>;

export async function generateUseCaseDiagram(input: GenerateUseCaseDiagramInput): Promise<GenerateUseCaseDiagramOutput> {
  return generateUseCaseDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUseCaseDiagramPrompt',
  input: { schema: GenerateUseCaseDiagramInputSchema },
  output: { schema: GenerateUseCaseDiagramOutputSchema },
  prompt: `You are an expert systems analyst specializing in PlantUML. Based on the project proposal below, generate a PlantUML **Use Case Diagram**.

{{#if otherDiagrams}}
To ensure consistency and accuracy, consider the information from these previously generated diagrams. This context is crucial for creating a diagram that aligns with the rest of the system design.
{{#each otherDiagrams}}
--- {{ @key }} Diagram ---
\`\`\`plantuml
{{{this}}}
\`\`\`
---
{{/each}}
{{/if}}

The diagram should:
1.  Identify the primary actors from the 'stakeholders' section (e.g., 'Primary User', 'Sponsor').
2.  Define use cases based on the 'objective', 'expected_outcome', and 'functional requirements' (which you can infer from the objectives).
3.  Connect actors to their relevant use cases.
4.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json proposal}}}
\`\`\`
`,
});

const generateUseCaseDiagramFlow = ai.defineFlow(
  {
    name: 'generateUseCaseDiagramFlow',
    inputSchema: GenerateUseCaseDiagramInputSchema,
    outputSchema: GenerateUseCaseDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
