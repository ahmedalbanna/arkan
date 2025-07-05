'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Activity Diagram.
 * - generateActivityDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateActivityDiagramInput = ProjectProposal;

const GenerateActivityDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the Activity diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateActivityDiagramOutput = z.infer<typeof GenerateActivityDiagramOutputSchema>;

export async function generateActivityDiagram(input: GenerateActivityDiagramInput): Promise<GenerateActivityDiagramOutput> {
  return generateActivityDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActivityDiagramPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateActivityDiagramOutputSchema },
  prompt: `You are an expert process analyst specializing in PlantUML. Based on the project proposal below, generate a PlantUML **Activity Diagram** illustrating a key workflow.

The diagram should:
1.  Define a start and end point for the process.
2.  Detail the sequence of activities based on a primary workflow described in the 'objective' or 'methodology'.
3.  Incorporate decision points (conditionals) and forks/joins (parallel activities) where appropriate.
4.  Optionally use partitions (swimlanes) to assign activities to different actors or system components.
5.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateActivityDiagramFlow = ai.defineFlow(
  {
    name: 'generateActivityDiagramFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateActivityDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
