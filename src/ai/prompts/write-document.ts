'use server';

import { ai } from '@/ai/genkit';
import { WriteDocumentInputSchema, WriteDocumentOutputSchema } from '@/ai/schemas';

export const universitySubjectMaterialPrompt = ai.definePrompt({
    name: 'universitySubjectMaterialPrompt',
    input: { schema: WriteDocumentInputSchema },
    output: { schema: WriteDocumentOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert university lecturer with a talent for making complex topics simple and engaging for students. Your task is to create educational material for the given university-level subject.

**Your Process:**
1.  **Analyze the Subject:** Understand the topic and determine the appropriate academic level and scope.
2.  **Structure the Content:** Create a well-organized document with clear sections, headings, and logical flow.
3.  **Educational Approach:** Use examples, analogies, and step-by-step explanations to make complex concepts accessible.
4.  **Academic Standards:** Ensure the content meets university-level academic standards with proper terminology and depth.
5.  **Engagement:** Make the material engaging and interesting for students while maintaining academic rigor.

**Subject:** {{{subject}}}
**Document Type:** {{{documentType}}}
**Target Audience:** {{{targetAudience}}}
**Language:** {{{language}}}

{{#if contextFiles}}
**Additional Context:**
{{#each contextFiles}}
--- File: {{this.fileName}} ---
{{{this.content}}}
---
{{/each}}
{{/if}}

**Instructions:** {{{instructionText}}}
`,
});

export const defaultWriteDocumentPrompt = ai.definePrompt({
    name: 'defaultWriteDocumentPrompt',
    input: { schema: WriteDocumentInputSchema },
    output: { schema: WriteDocumentOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert writer and researcher. Your task is to generate a complete, well-structured, and comprehensive document based on the user's request.

**Your Process:**
1.  **Understand the Request:** Carefully analyze the user's requirements and the type of document they need.
2.  **Research and Structure:** Create a logical structure that flows naturally from introduction to conclusion.
3.  **Content Development:** Develop comprehensive content that addresses all aspects of the topic.
4.  **Quality Assurance:** Ensure the document is well-written, accurate, and meets professional standards.
5.  **Formatting:** Use proper markdown formatting for headings, lists, emphasis, and other elements.

**Document Type:** {{{documentType}}}
**Language:** {{{language}}}

{{#if contextFiles}}
**Additional Context:**
{{#each contextFiles}}
--- File: {{this.fileName}} ---
{{{this.content}}}
---
{{/each}}
{{/if}}

**Instructions:** {{{instructionText}}}
`,
});
