'use server';

/**
 * @fileOverview AI agent for generating a PlantUML Activity Diagram.
 * - generateActivityDiagram
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema } from '@/ai/schemas';

const GenerateActivityDiagramInputSchema = z.object({
    proposal: ProjectProposalSchema,
    otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams (if any) to provide context. The key is the diagram type and the value is the PlantUML code.")
});
export type GenerateActivityDiagramInput = z.infer<typeof GenerateActivityDiagramInputSchema>;


const GenerateActivityDiagramOutputSchema = z.object({
    plantUmlCode: z.string().describe("The complete PlantUML code for the Activity diagram, starting with @startuml and ending with @enduml.")
});
export type GenerateActivityDiagramOutput = z.infer<typeof GenerateActivityDiagramOutputSchema>;

export async function generateActivityDiagram(input: GenerateActivityDiagramInput): Promise<GenerateActivityDiagramOutput> {
  return generateActivityDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActivityDiagramPrompt',
  input: { schema: GenerateActivityDiagramInputSchema },
  output: { schema: GenerateActivityDiagramOutputSchema },
  prompt: `You are an expert process analyst specializing in PlantUML. Based on the project proposal below, generate a PlantUML **Activity Diagram** illustrating a key workflow.

{{#if otherDiagrams}}
To ensure consistency and accuracy, consider the information from these previously generated diagrams. This context is crucial for creating a diagram that aligns with the rest of the system design. For example, a Use Case or Sequence diagram can help define the flow of activities.
{{#each otherDiagrams}}
--- {{ @key }} Diagram ---
\`\`\`plantuml
{{{this}}}
\`\`\`
---
{{/each}}
{{/if}}

The diagram should:
1.  Define a start and end point for the process.
2.  Detail the sequence of activities based on a primary workflow described in the 'objective' or 'methodology'.
3.  Incorporate decision points (conditionals) and forks/joins (parallel activities) where appropriate.
4.  Optionally use partitions (swimlanes) to assign activities to different actors or system components.
5.  Structure the output strictly as PlantUML code, enclosed within '@startuml' and '@enduml' tags. Do not add any other text or explanation.

Project Proposal Data:
\`\`\`json
{{{json proposal}}}
\`\`\`
`,
});

const generateActivityDiagramFlow = ai.defineFlow(
  {
    name: 'generateActivityDiagramFlow',
    inputSchema: GenerateActivityDiagramInputSchema,
    outputSchema: GenerateActivityDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
