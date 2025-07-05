'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Component Diagram.
 * - generateComponentDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateComponentDiagramInput = ProjectProposal;

const GenerateComponentDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the Component diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateComponentDiagramOutput = z.infer<typeof GenerateComponentDiagramOutputSchema>;

export async function generateComponentDiagram(input: GenerateComponentDiagramInput): Promise<GenerateComponentDiagramOutput> {
  return generateComponentDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComponentDiagramPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateComponentDiagramOutputSchema },
  prompt: `You are an expert software architect specializing in PlantUML. Based on the project proposal below, generate a high-level PlantUML **Component Diagram**.

The diagram should:
1.  Identify the main software components of the system (e.g., 'Frontend App', 'API Gateway', 'User Service', 'Database'). Infer these from the project objective and potential architecture.
2.  Show the interfaces provided and required by the components.
3.  Illustrate the dependencies and relationships between these components.
4.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateComponentDiagramFlow = ai.defineFlow(
  {
    name: 'generateComponentDiagramFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateComponentDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
