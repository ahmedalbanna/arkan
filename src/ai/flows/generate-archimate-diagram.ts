'use server';

/**
 * @fileOverview AI agent for generating a PlantUML ArchiMate Diagram.
 * - generateArchimateDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema } from '@/ai/schemas';

const GenerateArchimateDiagramInputSchema = z.object({
    proposal: ProjectProposalSchema,
    otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code.")
});
export type GenerateArchimateDiagramInput = z.infer<typeof GenerateArchimateDiagramInputSchema>;


const GenerateArchimateDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the ArchiMate diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateArchimateDiagramOutput = z.infer<typeof GenerateArchimateDiagramOutputSchema>;

export async function generateArchimateDiagram(input: GenerateArchimateDiagramInput): Promise<GenerateArchimateDiagramOutput> {
  return generateArchimateDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateArchimateDiagramPrompt',
  input: { schema: GenerateArchimateDiagramInputSchema },
  output: { schema: GenerateArchimateDiagramOutputSchema },
  prompt: `You are an expert enterprise architect specializing in PlantUML and ArchiMate. Based on the project proposal below, generate a PlantUML **ArchiMate Diagram**.

{{#if otherDiagrams}}
To ensure consistency and accuracy, consider the information from these previously generated diagrams. This context is crucial for creating a diagram that aligns with the rest of the system design. For example, other diagrams can provide details on the application layer components and business processes.
{{#each otherDiagrams}}
--- {{ @key }} Diagram ---
\`\`\`plantuml
{{{this}}}
\`\`\`
---
{{/each}}
{{/if}}

The diagram should focus on the Business Layer and Application Layer:
1.  **Business Layer**: Identify Business Actors (from stakeholders), Business Roles, and Business Functions/Processes (from objectives).
2.  **Application Layer**: Identify Application Components (e.g., CRM System, Billing Service) and Application Functions that realize the business processes.
3.  **Relationships**: Show how business actors interact with business functions, and how application components support those business functions. Use proper ArchiMate relationships (e.g., assignment, realization, serving).
4.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Ensure you use ArchiMate syntax (e.g., 'archimate "Business Actor" as BA'). Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json proposal}}}
\`\`\`
`,
});

const generateArchimateDiagramFlow = ai.defineFlow(
  {
    name: 'generateArchimateDiagramFlow',
    inputSchema: GenerateArchimateDiagramInputSchema,
    outputSchema: GenerateArchimateDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
