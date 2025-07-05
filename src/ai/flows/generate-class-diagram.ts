'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Class Diagram.
 * - generateClassDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateClassDiagramInput = ProjectProposal;

const GenerateClassDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the Class diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateClassDiagramOutput = z.infer<typeof GenerateClassDiagramOutputSchema>;

export async function generateClassDiagram(input: GenerateClassDiagramInput): Promise<GenerateClassDiagramOutput> {
  return generateClassDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClassDiagramPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateClassDiagramOutputSchema },
  prompt: `You are an expert software architect specializing in PlantUML. Based on the project proposal below, generate a PlantUML **Class Diagram**.

The diagram should:
1.  Identify key classes (entities) from the project's 'objective' and 'expected_outcome'. Think about major nouns like User, Project, Order, etc.
2.  Define attributes for each class.
3.  Define methods (operations) for each class that represent its behavior.
4.  Establish relationships (associations, aggregations, inheritance) between the classes.
5.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateClassDiagramFlow = ai.defineFlow(
  {
    name: 'generateClassDiagramFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateClassDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
