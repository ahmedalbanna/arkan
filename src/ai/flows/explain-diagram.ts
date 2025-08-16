
'use server';

/**
 * @fileOverview An AI agent for explaining a diagram from an image.
 */

import { ai } from '@/ai/genkit';
import { ExplainDiagramInputSchema, type ExplainDiagramInput, ExplainDiagramOutputSchema, type ExplainDiagramOutput } from '@/ai/schemas';

const explainDiagramPrompt = ai.definePrompt({
    name: 'explainDiagramPrompt',
    input: { schema: ExplainDiagramInputSchema },
    output: { schema: ExplainDiagramOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert systems analyst. Your task is to provide a detailed explanation of the provided diagram.

Follow these guidelines:
1.  **Identify Type**: First, identify the type of diagram (e.g., Class Diagram, Use Case, Flowchart, ERD).
2.  **Describe Purpose**: Explain the overall purpose of the diagram in the context of a software project.
3.  **Detail Components**: Break down and describe each key component or symbol shown in the diagram.
4.  **Explain Relationships**: Describe the relationships and interactions between the components.
5.  **Format**: Format the entire explanation as clean, well-structured markdown.

Diagram Image:
---
{{media url=imageDataUri}}
---
`,
});

const explainDiagramFlow = ai.defineFlow({
    name: 'explainDiagramFlow',
    inputSchema: ExplainDiagramInputSchema,
    outputSchema: ExplainDiagramOutputSchema,
}, async (input) => {
    const { output } = await explainDiagramPrompt(input);
    if (!output) {
      throw new Error("Explanation generation failed.");
    }
    output.explanation = output.explanation.replace(/---/g, '').trim();
    return output;
});

export async function explainDiagram(input: ExplainDiagramInput): Promise<ExplainDiagramOutput> {
  const validation = ExplainDiagramInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for explainDiagram: ${validation.error.message}`);
  }
  return explainDiagramFlow(validation.data);
}
