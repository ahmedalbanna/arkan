

'use server';

/**
 * @fileOverview An AI agent for rewriting a document (text and images) into structured markdown.
 * - rewriteDocumentToMarkdown
 */

import { ai } from '@/ai/genkit';
import { rewriteDocumentToMarkdownPrompt } from '@/ai/prompts/rewrite-document-to-markdown';
import { RewriteDocumentInputSchema, RewriteDocumentOutputSchema, type RewriteDocumentInput, type RewriteDocumentOutput } from '@/ai/schemas';

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
    const { output } = await rewriteDocumentToMarkdownPrompt(input);
    if (!output) {
      throw new Error('Failed to rewrite document to markdown.');
    }
    output.markdown = output.markdown.replace(/---/g, '').trim();
    return output;
  });
