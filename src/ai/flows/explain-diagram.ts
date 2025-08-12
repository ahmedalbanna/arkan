
'use server';

/**
 * @fileOverview An AI agent for explaining a diagram from an image.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExplainDiagramInputSchema = z.object({
  imageDataUri: z.string().describe("An image of a diagram, encoded as a data URI that must include a MIME type and use Base64 encoding."),
});
export type ExplainDiagramInput = z.infer<typeof ExplainDiagramInputSchema>;

const ExplainDiagramOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the diagram, formatted as markdown.'),
});
export type ExplainDiagramOutput = z.infer<typeof ExplainDiagramOutputSchema>;


export async function explainDiagram(input: ExplainDiagramInput): Promise<ExplainDiagramOutput> {
  const prompt = ai.definePrompt({
    name: 'explainDiagramPrompt',
    input: { schema: ExplainDiagramInputSchema },
    output: { schema: ExplainDiagramOutputSchema },
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

  const { output } = await prompt(input);
  if (!output) {
      throw new Error("Explanation generation failed.");
  }
  output.explanation = output.explanation.replace(/---/g, '').trim();
  return output;
}
