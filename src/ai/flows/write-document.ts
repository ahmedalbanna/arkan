
'use server';

/**
 * @fileOverview An AI agent for writing a full document from a topic.
 */

import { ai } from '@/ai/genkit';
import { WriteDocumentInputSchema, WriteDocumentOutputSchema, type WriteDocumentInput, type WriteDocumentOutput } from '@/ai/schemas';
import { validateJsonOutput, getJsonPromptInstructions, RECOMMENDED_TEMPERATURES } from '@/ai/utils/json-output-validator';

const universitySubjectMaterialPrompt = ai.definePrompt({
  name: 'universitySubjectMaterialPrompt',
  input: { schema: WriteDocumentInputSchema },
  output: { schema: WriteDocumentOutputSchema },
  model: 'ollama/gemma:2b',
  config: {
    responseSchema: WriteDocumentOutputSchema,
    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
  },
  prompt: `You are an expert university lecturer with a talent for making complex topics simple and engaging for students. Your task is to create educational material for the given university-level subject.

${getJsonPromptInstructions(`{
  "document": "Complete markdown document with headings, examples, and educational content"
}`)}

**Your Process:**
1.  **Deconstruct the Request:** Fully understand the topic and any specific instructions.
2.  **Structure for Learning:** Create a logical flow that introduces concepts, provides clear explanations, defines key terms, and uses examples or analogies to aid understanding.
3.  **Generate Content:** Write the full document. Ensure it is accurate, easy to follow, and suitable for a university student audience. Include sections for "Key Terms and Definitions" and a "Summary" at the end where appropriate.
4.  **Format as Markdown:** Use clear and consistent Markdown for headings, lists, bold text, etc., to ensure readability.
5.  **Return Only the Document:** Your final output must be only the complete markdown content of the document, inside the correct JSON structure.

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

**JSON Output:**`,
});

const defaultWriteDocumentPrompt = ai.definePrompt({
  name: 'defaultWriteDocumentPrompt',
  input: { schema: WriteDocumentInputSchema },
  output: { schema: WriteDocumentOutputSchema },
  model: 'ollama/gemma:2b',
  config: {
    responseSchema: WriteDocumentOutputSchema,
    temperature: RECOMMENDED_TEMPERATURES.BALANCED,
  },
  prompt: `You are an expert writer and researcher. Your task is to generate a complete, well-structured, and comprehensive document based on the user's request.

${getJsonPromptInstructions(`{
  "document": "Complete markdown document with proper structure and formatting"
}`)}

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
5.  **Return Only the Document:** Your final output must be only the complete markdown content of the document, inside the correct JSON structure.

**JSON Output:**`,
});

const writeDocumentFlow = ai.defineFlow({
  name: 'writeDocumentFlow',
  inputSchema: WriteDocumentInputSchema,
  outputSchema: WriteDocumentOutputSchema
}, async (input) => {
  try {
    let promptToUse;
    if (input.documentType === 'university subject material') {
      promptToUse = universitySubjectMaterialPrompt;
    } else {
      promptToUse = defaultWriteDocumentPrompt;
    }
    
    const { output } = await promptToUse(input);
    
    if (!output) {
      throw new Error("No output received from the model.");
    }

    const validation = validateJsonOutput({
      schema: WriteDocumentOutputSchema,
      output,
      flowName: 'writeDocumentFlow',
      attemptRecovery: true,
      enableLogging: true,
      fallbackFn: (rawOutput) => {
        if (typeof rawOutput === 'string') {
          return { document: rawOutput };
        }
        return null;
      },
    });

    if (!validation.success) {
      throw new Error(validation.error || 'Failed to validate output');
    }

    return validation.data!;
  } catch (error) {
    console.error('Error in writeDocumentFlow:', error);
    throw new Error(`Document generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export async function writeDocument(input: WriteDocumentInput): Promise<WriteDocumentOutput> {
  const validation = WriteDocumentInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for writeDocument: ${validation.error.message}`);
  }
  return writeDocumentFlow(validation.data);
}
