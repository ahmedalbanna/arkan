'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Sequence Diagram.
 * - generateSequenceDiagram
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

const GenerateSequenceDiagramInputSchema = z.object({
    proposal: ProjectProposalSchema,
    otherDiagrams: z.record(DiagramTypeEnum, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code.")
});
export type GenerateSequenceDiagramInput = z.infer<typeof GenerateSequenceDiagramInputSchema>;


const GenerateSequenceDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the Sequence diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateSequenceDiagramOutput = z.infer<typeof GenerateSequenceDiagramOutputSchema>;

export async function generateSequenceDiagram(input: GenerateSequenceDiagramInput): Promise<GenerateSequenceDiagramOutput> {
  return generateSequenceDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSequenceDiagramPrompt',
  input: { schema: GenerateSequenceDiagramInputSchema },
  output: { schema: GenerateSequenceDiagramOutputSchema },
  prompt: `You are an expert systems analyst specializing in PlantUML. Based on the project proposal below, generate a PlantUML **Sequence Diagram** for a key user flow.

{{#if otherDiagrams}}
To ensure consistency and accuracy, consider the information from these previously generated diagrams. This context is crucial for creating a diagram that aligns with the rest of the system design. For example, a Class diagram provides the participants (classes), and a Use Case diagram defines the scenario to model.
{{#each otherDiagrams}}
--- {{ @key }} Diagram ---
\`\`\`plantuml
{{{this}}}
\`\`\`
---
{{/each}}
{{/if}}

The diagram should:
1.  Identify participants (actors and system components).
2.  Illustrate the step-by-step interactions between these participants for a primary use case (e.g., 'User logs in', 'User creates a project').
3.  Show the order of messages exchanged between participants.
4.  Use activation boxes to represent processing time.
5.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json proposal}}}
\`\`\`
`,
});

const generateSequenceDiagramFlow = ai.defineFlow(
  {
    name: 'generateSequenceDiagramFlow',
    inputSchema: GenerateSequenceDiagramInputSchema,
    outputSchema: GenerateSequenceDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
