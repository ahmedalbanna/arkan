
'use server';

/**
 * @fileOverview An AI agent for writing a full document from a topic.
 */

import { ai } from '@/ai/genkit';
import { defaultWriteDocumentPrompt, universitySubjectMaterialPrompt } from '@/ai/prompts/write-document';
import { WriteDocumentInputSchema, WriteDocumentOutputSchema, type WriteDocumentInput, type WriteDocumentOutput } from '@/ai/schemas';

const writeDocumentFlow = ai.defineFlow({
  name: 'writeDocumentFlow',
  inputSchema: WriteDocumentInputSchema,
  outputSchema: WriteDocumentOutputSchema
}, async (input) => {
  let promptToUse;
  if (input.documentType === 'university subject material') {
    promptToUse = universitySubjectMaterialPrompt;
  } else {
    promptToUse = defaultWriteDocumentPrompt;
  }
  const { output } = await promptToUse(input);
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
