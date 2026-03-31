
'use server';

/**
 * @fileOverview An AI agent for writing a full document from a topic.
 */

import { ai, MODEL_BY_TASK } from '@/modules/ai/infrastructure/services/Genkit';
import { WriteDocumentInputSchema, WriteDocumentOutputSchema, type WriteDocumentInput, type WriteDocumentOutput } from '@/modules/ai/domain/schemas';


const universitySubjectMaterialPrompt = ai.definePrompt({
  name: 'universitySubjectMaterialPrompt',
  input: { schema: WriteDocumentInputSchema },
  model: 'ollama/gemma:2b',
  prompt: `You are an expert university lecturer with a talent for making complex topics simple and engaging for students. Your task is to create educational material for the given university-level subject.

**Your Process:**
1.  **Deconstruct the Request:** Fully understand the topic and any specific instructions.
2.  **Structure for Learning:** Create a logical flow that introduces concepts, provides clear explanations, defines key terms, and uses examples or analogies to aid understanding.
3.  **Generate Content:** Write the full document. Ensure it is accurate, easy to follow, and suitable for a university student audience. Include sections for "Key Terms and Definitions" and a "Summary" at the end where appropriate.
4.  **Format as Markdown:** Use clear and consistent Markdown for headings, lists, bold text, etc., to ensure readability.

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

Output ONLY the document markdown. Do NOT include any preamble, filler, or JSON wrapping.`,
});

const defaultWriteDocumentPrompt = ai.definePrompt({
  name: 'defaultWriteDocumentPrompt',
  input: { schema: WriteDocumentInputSchema },
  model: 'ollama/gemma:2b',
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

Output ONLY the document markdown. Do NOT include any preamble, filler, or JSON wrapping.`,
});

const writeDocumentFlow = ai.defineFlow({
  name: 'writeDocumentFlow',
  inputSchema: WriteDocumentInputSchema,
  outputSchema: WriteDocumentOutputSchema
}, async (input: WriteDocumentInput) => {
  let promptToUse;
  if (input.documentType === 'university subject material') {
    promptToUse = universitySubjectMaterialPrompt;
  } else {
    promptToUse = defaultWriteDocumentPrompt;
  }
  const result = await promptToUse(input);
  const text = result.text || result.output || "";
  if (!text) {
    throw new Error("Document generation failed.");
  }
  return text.trim();
});

export async function writeDocument(input: WriteDocumentInput): Promise<WriteDocumentOutput> {
  const validation = WriteDocumentInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for writeDocument: ${validation.error.message}`);
  }
  return writeDocumentFlow(validation.data);
}
