'use server';

/**
 * @fileOverview Document to markdown conversion prompt definitions
 */

import { ai } from '@/ai/genkit';
import { RewriteDocumentInputSchema, RewriteDocumentOutputSchema } from '@/ai/schemas';

export const rewriteDocumentPrompt = ai.definePrompt({
    name: 'generateMarkdownFromDocumentPrompt',
    input: { schema: RewriteDocumentInputSchema },
    output: { schema: RewriteDocumentOutputSchema },
    model: 'googleai/gemini-2.0-flash',
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
