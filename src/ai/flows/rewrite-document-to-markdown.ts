
'use server';

/**
 * @fileOverview An AI agent for rewriting a document (text and images) into structured markdown.
 * - rewriteDocumentToMarkdown
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RewriteDocumentInputSchema = z.object({
  pdfDataUri: z.string().describe("A PDF file encoded as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type RewriteDocumentInput = z.infer<typeof RewriteDocumentInputSchema>;

const RewriteDocumentOutputSchema = z.object({
  markdown: z.string().describe('The rewritten content, formatted as clean, well-structured markdown.'),
});
export type RewriteDocumentOutput = z.infer<typeof RewriteDocumentOutputSchema>;

// Define the prompt outside the flow definition
const generateMarkdownPrompt = ai.definePrompt({
  name: 'generateMarkdownFromDocumentPrompt',
  input: { schema: RewriteDocumentInputSchema },
  output: { schema: RewriteDocumentOutputSchema },
  model: 'googleai/gemini-1.5-pro',
  prompt: `You are an expert document editor. Your task is to take the content of the provided PDF document and rewrite it into clean, well-structured markdown.

Follow these guidelines:
1.  **Structure**: Analyze the PDF to understand the original layout. Identify headings, subheadings, paragraphs, lists, tables, and other structural elements, and format them correctly using markdown syntax (e.g., '#', '##', '-', '1.').
2.  **Clarity**: Correct any obvious OCR errors and improve overall readability.
3.  **Content**: Reconstruct the content based on what you see in the PDF. If there are complex tables or diagrams in the document, represent them accurately in markdown tables or describe them.
4.  **Purity**: Do not add any new content or opinions. Stick strictly to rewriting and formatting the provided document content.

PDF Document:
---
{{media url=pdfDataUri}}
---
`,
    });

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
        const { output } = await generateMarkdownPrompt(input);
        if (!output) {
          throw new Error('Failed to rewrite document to markdown.');
        }
        output.markdown = output.markdown.replace(/---/g, '').trim();
        return output;
      });
