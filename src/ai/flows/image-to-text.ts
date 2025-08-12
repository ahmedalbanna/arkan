
'use server';

/**
 * @fileOverview An AI agent for extracting text content from an image.
 * - imageToText
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ImageToTextInputSchema = z.object({
  imageDataUri: z.string().describe("An image file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/...;base64,<encoded_data>'."),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

const ImageToTextOutputSchema = z.object({
  text: z.string().describe('The extracted text content from the image, formatted as markdown.'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;


export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
  return imageToTextFlow(input);
}

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async (input) => {
    const extractTextPrompt = ai.definePrompt({
      name: 'extractTextFromImagePrompt',
      input: { schema: ImageToTextInputSchema },
      output: { schema: ImageToTextOutputSchema },
      prompt: `You are an expert OCR (Optical Character Recognition) tool. Your task is to take the provided image and extract all text content from it.

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

    const { output } = await extractTextPrompt(input);
    if (!output) {
      throw new Error("Text extraction failed.");
    }
    output.text = output.text.replace(/---/g, '').trim();
    return output;
  }
);
