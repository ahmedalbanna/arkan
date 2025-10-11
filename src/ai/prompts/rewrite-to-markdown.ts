'use server';

/**
 * @fileOverview Text to markdown conversion prompt definitions
 */

import { ai } from '@/ai/genkit';
import { RewriteToMarkdownInputSchema, RewriteToMarkdownOutputSchema } from '@/ai/schemas';

export const rewriteToMarkdownPrompt = ai.definePrompt({
    name: 'rewriteToMarkdownPrompt',
    input: { schema: RewriteToMarkdownInputSchema },
    output: { schema: RewriteToMarkdownOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert document editor. Your task is to take a raw text input, which was extracted from a PDF, and rewrite it into clean, well-structured markdown.

Follow these guidelines:
1.  **Structure**: Identify headings, subheadings, paragraphs, lists, and other structural elements from the raw text and format them correctly using markdown syntax (e.g., '#', '##', '-', '1.').
2.  **Clarity**: Correct any obvious OCR errors, merge broken lines into coherent paragraphs, and improve the overall readability.
3.  **Formatting**: Use markdown for bolding, italics, and code blocks where appropriate to enhance readability.
4.  **Purity**: Do not add any new content or opinions. Stick strictly to rewriting and formatting the provided text.

Raw Text Input:
---
{{{rawText}}}
---
`,
    config: {
        temperature: 0.1, // Very low temp for accurate formatting
        maxOutputTokens: 8192,
    }
});
