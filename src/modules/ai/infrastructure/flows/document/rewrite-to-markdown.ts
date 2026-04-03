
'use server';

/**
 * @fileOverview An AI agent for rewriting raw text into structured markdown.
 * - rewriteToMarkdown
 */

import { ai, OLLAMA_MODELS } from '@/modules/ai/infrastructure/services/Genkit';
import { RewriteToMarkdownInputSchema, RewriteToMarkdownOutputSchema, type RewriteToMarkdownInput, type RewriteToMarkdownOutput } from '@/modules/ai/domain/schemas';

export async function rewriteToMarkdown(input: RewriteToMarkdownInput): Promise<RewriteToMarkdownOutput> {
  return rewriteToMarkdownFlow(input);
}

const rewriteToMarkdownFlow = ai.defineFlow(
  {
    name: 'rewriteToMarkdownFlow',
    inputSchema: RewriteToMarkdownInputSchema,
    outputSchema: RewriteToMarkdownOutputSchema,
  },
  async (input: RewriteToMarkdownInput) => {
    const prompt = ai.definePrompt({
      name: 'rewriteToMarkdownPrompt',
      input: { schema: RewriteToMarkdownInputSchema },
      // No output schema - model returns plain text
      model: OLLAMA_MODELS.GEMMA_2B,
      prompt: `You are an expert document editor. Your task is to take a raw text input, which was extracted from a PDF, and rewrite it into clean, well-structured markdown.

Output ONLY the markdown text. Do NOT wrap it in JSON or any other format.

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

    const result = await prompt(input);
    
    const text = result.text || result.output || '';
    
    if (!text || text.trim().length === 0) {
      throw new Error('Model returned empty markdown');
    }
    
    return text.trim();
  }
);
