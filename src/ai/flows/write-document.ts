
'use server';

/**
 * @fileOverview An AI agent for writing a full document from a topic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WriteDocumentInputSchema, type WriteDocumentInput, WriteDocumentOutputSchema, type WriteDocumentOutput } from '@/ai/schemas';

const writeDocumentPrompt = ai.definePrompt({
    name: 'writeDocumentPrompt',
    input: { schema: WriteDocumentInputSchema },
    output: { schema: WriteDocumentOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: `You are an expert writer and researcher. Your task is to generate a complete, well-structured, and comprehensive document based on the user's request.

**Topic:** {{{topic}}}
**Document Type:** {{{documentType}}}

{{#if knowledge}}
**Provided Knowledge & Instructions:**
---
{{{knowledge}}}
---
{{/if}}

{{#if tableOfContents}}
**Required Structure (Table of Contents):**
You MUST structure your document according to the following headings. Ensure each heading is included and well-developed.
{{#each tableOfContents}}
- {{{this}}}
{{/each}}
---
{{/if}}

**Your Process:**
1.  **Deconstruct the Request:** Fully understand the topic, document type, and any specific instructions from the provided knowledge.
2.  **Outline the Structure:** Create a logical outline for the document. If a Table of Contents is provided, you MUST use it as the primary structure. Otherwise, create your own logical structure.
3.  **Generate Content:** Write the full document, ensuring it is coherent, well-researched (if applicable), and adheres to the requested format and tone.
4.  **Format as Markdown:** Use clear and consistent Markdown formatting for headings, lists, bold text, etc., to ensure readability.
5.  **Return Only the Document:** Your final output must be only the complete markdown content of the document, with no additional commentary.
`,
  });

const writeDocumentFlow = ai.defineFlow({
    name: 'writeDocumentFlow',
    inputSchema: WriteDocumentInputSchema,
    outputSchema: WriteDocumentOutputSchema
}, async (input) => {
    const { output } = await writeDocumentPrompt(input);
    if (!output) {
      throw new Error("Document generation failed.");
    }
    output.documentContent = output.documentContent.replace(/---/g, '').trim();
    return output;
});

export async function writeDocument(input: WriteDocumentInput): Promise<WriteDocumentOutput> {
  const validation = WriteDocumentInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for writeDocument: ${validation.error.message}`);
  }
  return writeDocumentFlow(validation.data);
}
