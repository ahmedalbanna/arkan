
'use server';

/**
 * @fileOverview An AI agent for generating PlantUML code from a text description.
 */

import { ai } from '@/ai/genkit';
import { GeneratePlantUMLInputSchema, GeneratePlantUMLOutputSchema, type GeneratePlantUMLInput, type GeneratePlantUMLOutput } from '@/ai/schemas';

const generatePlantUMLPrompt = ai.definePrompt({
  name: 'generatePlantUMLPrompt',
  input: { schema: GeneratePlantUMLInputSchema },
  output: { schema: GeneratePlantUMLOutputSchema },
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an expert in software architecture and diagramming. Your task is to generate PlantUML code based on a user's description.

**Diagram Type:** {{{diagramType}}}
**Description:**
---
{{{description}}}
---

**Instructions:**
1.  Analyze the description to understand the components, actors, relationships, and flows.
2.  Generate complete and syntactically correct PlantUML code for the specified diagram type.
3.  The code must start with '@startuml' and end with '@enduml'.
4.  Do not include any explanations, comments, or markdown formatting in your output. Return only the raw PlantUML code.
5.  If the diagramType is 'dfd' (Data Flow Diagram), you MUST include the following skin parameters to style the elements correctly:
    \`\`\`plantuml
    skinparam collections {
      BorderColor black
      BorderThickness 2
      BackgroundColor white
      ArrowColor Black
    }
    \`\`\`
    For DFDs, use \`collections\` for external entities, \`rectangle\` for processes, and \`database\` for data stores.
`,
  config: {
    temperature: 0.2, // Lower temperature for precise code generation
  }
});

const generatePlantUMLFlow = ai.defineFlow({
  name: 'generatePlantUMLFlow',
  inputSchema: GeneratePlantUMLInputSchema,
  outputSchema: GeneratePlantUMLOutputSchema
}, async (input) => {
  const { output } = await generatePlantUMLPrompt(input);
  if (!output) {
    throw new Error("PlantUML code generation failed.");
  }
  return output;
});

export async function generatePlantUML(input: GeneratePlantUMLInput): Promise<GeneratePlantUMLOutput> {
  const validation = GeneratePlantUMLInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generatePlantUML: ${validation.error.message}`);
  }
  return generatePlantUMLFlow(validation.data);
}
