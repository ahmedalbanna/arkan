
'use server';

/**
 * @fileOverview An AI agent for extracting text content from an image.
 * - imageToText
 */

import { ai } from '@/ai/genkit';
import { ImageToTextInputSchema, ImageToTextOutputSchema, type ImageToTextInput, type ImageToTextOutput } from '@/ai/schemas';

const extractTextPrompt = ai.definePrompt({
  name: 'extractTextFromImagePrompt',
  input: { schema: ImageToTextInputSchema },
  output: { schema: ImageToTextOutputSchema },
  model: 'ollama/gemma:2b',
  prompt: `You are an expert OCR (Optical Character Recognition) tool. Your task is to take the provided image and extract all text content from it.
Your output must be a valid JSON object that adheres to the defined schema.

Follow these guidelines:
1.  **Structure**: Analyze the image to understand the layout. Preserve the original structure as much as possible, including headings, lists, and paragraphs.
2.  **Accuracy**: Extract the text as accurately as possible.
3.  **Formatting**: Format the output as clean markdown.

Image:
---
{{media url=imageDataUri}}
---
`,
});

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async (input) => {
    const { output } = await extractTextPrompt(input);
    if (!output) {
      throw new Error("Text extraction failed.");
    }
    return output;
  }
);


export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
  const validation = ImageToTextInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for imageToText: ${validation.error.message}`);
  }
  return imageToTextFlow(validation.data);
}
