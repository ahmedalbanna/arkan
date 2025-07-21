
'use server';

/**
 * @fileOverview An AI agent for rewriting a document (text and images) into structured markdown.
 * - rewriteDocumentToMarkdown
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RewriteDocumentInputSchema = z.object({
  extractedText: z.string().optional().describe('The raw text extracted from the document.'),
  pageImages: z.array(z.string()).describe("An array of page images from the document, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type RewriteDocumentInput = z.infer<typeof RewriteDocumentInputSchema>;

const RewriteDocumentOutputSchema = z.object({
  markdown: z.string().describe('The rewritten content, formatted as clean, well-structured markdown.'),
});
export type RewriteDocumentOutput = z.infer<typeof RewriteDocumentOutputSchema>;


export async function rewriteDocumentToMarkdown(input: RewriteDocumentInput): Promise<RewriteDocumentOutput> {
  return rewriteDocumentFlow(input);
}

const rewriteDocumentFlow = ai.defineFlow(
  {
    name: 'rewriteDocumentToMarkdownFlow',
    inputSchema: RewriteDocumentInputSchema,
    outputSchema: RewriteDocumentOutputSchema,
  },
  async (input) => {
    // Construct the prompt with both text and image parts
    const promptParts = [
        { text: `You are an expert document editor. Your task is to take the content of a document, provided as both raw text and page images, and rewrite it into clean, well-structured markdown.

Follow these guidelines:
1.  **Structure**: Use the page images to understand the original layout. Identify headings, subheadings, paragraphs, lists, tables, and other structural elements, and format them correctly using markdown syntax (e.g., '#', '##', '-', '1.').
2.  **Clarity**: The raw text may have OCR errors or be poorly formatted. Use the images as a visual reference to correct these errors, merge broken lines, and improve overall readability.
3.  **Content**: Reconstruct the content based on BOTH the images and the text. If the text is missing but visible in the image, you should include it. If there are complex tables or diagrams in the images, represent them accurately in markdown tables or describe them.
4.  **Purity**: Do not add any new content or opinions. Stick strictly to rewriting and formatting the provided document content.

--- Raw Extracted Text (for reference) ---
{{{extractedText}}}
---
`},
    ];

    input.pageImages.forEach(imageUri => {
        promptParts.push({ media: { url: imageUri } });
    });


    const generateMarkdownPrompt = ai.definePrompt({
      name: 'generateMarkdownFromDocumentPrompt',
      output: { schema: RewriteDocumentOutputSchema },
      prompt: promptParts,
    });

    const { output } = await generateMarkdownPrompt(input);
    return output!;
  }
);

    