'use server';

/**
 * @fileOverview Document writing prompt definitions
 */


import { WriteDocumentInputSchema, WriteDocumentOutputSchema } from '@/ai/schemas';

// Mock function for testing environment
const createMockPrompt = (config: any) => {
    return async (input: any) => {
        // Mock implementation for testing
        return { output: {} };
    };
};

// Use mock in test environment, real implementation in production
const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
    ? { definePrompt: createMockPrompt }
    : require('@/ai/genkit').ai;

export const universitySubjectMaterialPrompt = ai.definePrompt({
    name: 'universitySubjectMaterialPrompt',
    input: { schema: WriteDocumentInputSchema },
    output: { schema: WriteDocumentOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert university lecturer with a talent for making complex topics simple and engaging for students. Your task is to create educational material for the given university-level subject.

**Your Process:**
1.  **Deconstruct the Request:** Fully understand the topic and any specific instructions.
2.  **Structure for Learning:** Create a logical flow that introduces concepts, provides clear explanations, defines key terms, and uses examples or analogies to aid understanding.
3.  **Generate Content:** Write the full document. Ensure it is accurate, easy to follow, and suitable for a university student audience. Include sections for "Key Terms and Definitions" and a "Summary" at the end where appropriate.
4.  **Format as Markdown:** Use clear and consistent Markdown for headings, lists, bold text, etc., to ensure readability.
5.  **Return Only the Document:** Your final output must be only the complete markdown content of the document, with no additional commentary.

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
`,
});

export const defaultWriteDocumentPrompt = ai.definePrompt({
    name: 'defaultWriteDocumentPrompt',
    input: { schema: WriteDocumentInputSchema },
    output: { schema: WriteDocumentOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert writer and researcher. Your task is to create a comprehensive document on the given topic.

**Your Process:**
1.  **Understand the Request:** Analyze the topic and any specific instructions provided.
2.  **Research and Structure:** Create a logical structure that covers the topic thoroughly and coherently.
3.  **Generate Content:** Write the full document with accurate information, clear explanations, and appropriate examples.
4.  **Format as Markdown:** Use proper Markdown formatting for headings, lists, emphasis, etc.
5.  **Return Only the Document:** Your final output must be only the complete markdown content of the document.

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
`,
});
