'use server';

import { ai } from '@/ai/genkit';
import { GeneratePlantUMLInputSchema, GeneratePlantUMLOutputSchema } from '@/ai/schemas';

export const generatePlantUMLPrompt = ai.definePrompt({
    name: 'generatePlantUMLPrompt',
    input: { schema: GeneratePlantUMLInputSchema },
    output: { schema: GeneratePlantUMLOutputSchema },
    model: 'googleai/gemini-2.0-flash',
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
`,
    config: {
        temperature: 0.2, // Lower temperature for precise code generation
    }
});
