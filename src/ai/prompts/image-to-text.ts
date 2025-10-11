'use server';

/**
 * @fileOverview Image to text extraction prompt definitions
 */

import { ai } from '@/ai/genkit';
import { ImageToTextInputSchema, ImageToTextOutputSchema } from '@/ai/schemas';

export const imageToTextPrompt = ai.definePrompt({
    name: 'extractTextFromImagePrompt',
    input: { schema: ImageToTextInputSchema },
    output: { schema: ImageToTextOutputSchema },
    model: 'googleai/gemini-2.0-flash',
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
