'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Sequence Diagram.
 * - generateSequenceDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateSequenceDiagramInput = ProjectProposal;

const GenerateSequenceDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the Sequence diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateSequenceDiagramOutput = z.infer<typeof GenerateSequenceDiagramOutputSchema>;

export async function generateSequenceDiagram(input: GenerateSequenceDiagramInput): Promise<GenerateSequenceDiagramOutput> {
  return generateSequenceDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSequenceDiagramPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateSequenceDiagramOutputSchema },
  prompt: `You are an expert systems analyst specializing in PlantUML. Based on the project proposal below, generate a PlantUML **Sequence Diagram** for a key user flow.

The diagram should:
1.  Identify participants (actors and system components).
2.  Illustrate the step-by-step interactions between these participants for a primary use case (e.g., 'User logs in', 'User creates a project').
3.  Show the order of messages exchanged between participants.
4.  Use activation boxes to represent processing time.
5.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateSequenceDiagramFlow = ai.defineFlow(
  {
    name: 'generateSequenceDiagramFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateSequenceDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
