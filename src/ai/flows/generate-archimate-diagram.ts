'use server';

/**
 * @fileOverview AI agent for generating a PlantUML ArchiMate Diagram.
 * - generateArchimateDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateArchimateDiagramInput = ProjectProposal;

const GenerateArchimateDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the ArchiMate diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateArchimateDiagramOutput = z.infer<typeof GenerateArchimateDiagramOutputSchema>;

export async function generateArchimateDiagram(input: GenerateArchimateDiagramInput): Promise<GenerateArchimateDiagramOutput> {
  return generateArchimateDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateArchimateDiagramPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateArchimateDiagramOutputSchema },
  prompt: `You are an expert enterprise architect specializing in PlantUML and ArchiMate. Based on the project proposal below, generate a PlantUML **ArchiMate Diagram**.

The diagram should focus on the Business Layer and Application Layer:
1.  **Business Layer**: Identify Business Actors (from stakeholders), Business Roles, and Business Functions/Processes (from objectives).
2.  **Application Layer**: Identify Application Components (e.g., CRM System, Billing Service) and Application Functions that realize the business processes.
3.  **Relationships**: Show how business actors interact with business functions, and how application components support those business functions. Use proper ArchiMate relationships (e.g., assignment, realization, serving).
4.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Ensure you use ArchiMate syntax (e.g., 'archimate "Business Actor" as BA'). Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateArchimateDiagramFlow = ai.defineFlow(
  {
    name: 'generateArchimateDiagramFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateArchimateDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
