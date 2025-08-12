
'use server';

/**
 * @fileOverview An AI agent for writing a full document from a topic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WriteDocumentInputSchema = z.object({
  topic: z.string().describe('The topic or title of the document to be written.'),
  documentType: z.string().describe('The type of document to generate (e.g., "Blog Post", "Formal Report", "Essay", "Technical Article").'),
  instructions: z.string().optional().describe('Any specific instructions, required sections, or a target audience for the document.'),
  tableOfContents: z.array(z.string()).optional().describe("An optional list of headings to be used as the document's structure."),
});
export type WriteDocumentInput = z.infer<typeof WriteDocumentInputSchema>;

const WriteDocumentOutputSchema = z.object({
  documentContent: z.string().describe('The fully generated document content, formatted as markdown.'),
});
export type WriteDocumentOutput = z.infer<typeof WriteDocumentOutputSchema>;


export async function writeDocument(input: WriteDocumentInput): Promise<WriteDocumentOutput> {
  const prompt = ai.definePrompt({
    name: 'writeDocumentPrompt',
    input: { schema: WriteDocumentInputSchema },
    output: { schema: WriteDocumentOutputSchema },
    prompt: `You are an expert writer and researcher. Your task is to generate a complete, well-structured, and comprehensive document based on the user's request.

**Topic:** {{{topic}}}
**Document Type:** {{{documentType}}}

{{#if instructions}}
**Specific Instructions:**
---
{{{instructions}}}
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
1.  **Deconstruct the Request:** Fully understand the topic, document type, and any specific instructions.
2.  **Outline the Structure:** Create a logical outline for the document. If a Table of Contents is provided, you MUST use it as the primary structure. Otherwise, create your own logical structure.
3.  **Generate Content:** Write the full document, ensuring it is coherent, well-researched (if applicable), and adheres to the requested format and tone.
4.  **Format as Markdown:** Use clear and consistent Markdown formatting for headings, lists, bold text, etc., to ensure readability.
5.  **Return Only the Document:** Your final output must be only the complete markdown content of the document, with no additional commentary.
`,
  });

  const { output } = await prompt(input);
  if (!output) {
      throw new Error("Document generation failed.");
  }
  output.documentContent = output.documentContent.replace(/---/g, '').trim();
  return output;
}
