'use server';

/**
 * @fileOverview Theoretical lecture generation prompt definitions
 */


import {
    GenerateTheoreticalLectureInputSchema,
    GenerateTheoreticalLectureOutputSchema,
} from '@/ai/schemas/flows';

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

export const generateTheoreticalLecturePrompt = ai.definePrompt({
    name: 'generateTheoreticalLecturePrompt',
    input: { schema: GenerateTheoreticalLectureInputSchema },
    output: { schema: GenerateTheoreticalLectureOutputSchema },
    model: 'googleai/gemini-2.0-flash', // Using a more powerful model for content generation
    prompt: `You are an esteemed university professor and a leading expert in your field. Your task is to write a comprehensive, clear, and engaging theoretical lecture for the specified target audience.

**Your Process:**
1.  **Analyze the Request:** Carefully review the provided 'lectureTopic', the list of 'subTopics' to cover, the 'targetAudience', and any 'professorNotes'.
2.  **Synthesize Knowledge:**
    - **If 'professorNotes' are provided:** Use them as the primary source of information. Your role is to structure, elaborate, and refine these notes into a coherent, well-written lecture. Fill in any gaps using your expert knowledge.
    - **If 'professorNotes' are NOT provided:** Use your expert knowledge and reasoning capabilities to research and compose the lecture from scratch. You must cover all the specified 'subTopics' in a logical and thorough manner.
3.  **Structure the Lecture:**
    - Organize the content logically, following the order of the 'subTopics'.
    - Use Markdown for formatting. Use headings (#), subheadings (##, ###), bold text, italics, and lists to create a clear and readable structure.
    - Start with a brief introduction that outlines the lecture's objectives.
    - For each sub-topic, provide detailed explanations.
4.  **Enhance for Clarity:**
    - Define all key terminology and concepts.
    - Use relevant examples, analogies, or case studies to illustrate complex ideas.
    - Maintain an academic, authoritative, yet accessible tone suitable for the 'targetAudience'.
5.  **Conclude the Lecture:** End with a concise summary that recaps the main points and provides a bridge to the next topic or a related practical session.
6.  **Format Output:** Your entire response must be a valid JSON object that adheres to the 'GenerateTheoreticalLectureOutputSchema', containing the complete lecture in the 'lectureContent' field.

**Lecture Details:**
---
- **Lecture Topic:** {{{lectureTopic}}}
- **Sub-topics to Cover:**
{{#each subTopics}}
- {{{this}}}
{{/each}}
- **Target Audience:** {{{targetAudience}}}
{{#if professorNotes}}
- **Professor's Notes (to be expanded and structured):**
---
{{{professorNotes}}}
---
{{/if}}
`,
    config: {
        temperature: 0.5, // Lower temperature for more factual, less creative writing
    }
});
