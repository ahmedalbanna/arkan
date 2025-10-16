

'use server';

/**
 * @fileOverview An AI agent for rewriting raw text into structured markdown.
 * - rewriteToMarkdown
 */

import { ai } from '@/ai/genkit';
import { rewriteToMarkdownPrompt } from '@/ai/prompts/rewrite-to-markdown';
import { RewriteToMarkdownInputSchema, RewriteToMarkdownOutputSchema, type RewriteToMarkdownInput, type RewriteToMarkdownOutput } from '@/ai/schemas';

export async function rewriteToMarkdown(input: RewriteToMarkdownInput): Promise<RewriteToMarkdownOutput> {
  return rewriteToMarkdownFlow(input);
}

const rewriteToMarkdownFlow = ai.defineFlow(
  {
    name: 'rewriteToMarkdownFlow',
    inputSchema: RewriteToMarkdownInputSchema,
    outputSchema: RewriteToMarkdownOutputSchema,
  },
  async (input) => {
    const { output } = await rewriteToMarkdownPrompt(input);
    if (!output) {
      throw new Error('Failed to rewrite text to markdown.');
    }
    output.markdown = output.markdown.replace(/---/g, '').trim();
    return output;
  }
);
