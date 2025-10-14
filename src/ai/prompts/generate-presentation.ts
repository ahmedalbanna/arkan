'use server';

/**
 * @fileOverview Presentation generation prompt definitions
 */


import { ai } from '@/ai/genkit';
import { GeneratePresentationInputSchema, GeneratePresentationOutputSchema } from '@/ai/schemas';
// // Mock function for testing environment
// const createMockPrompt = (config: any) => {
//     return async (input: any) => {
//         // Mock implementation for testing
//         return { output: {} };
//     };
// };

// // Use mock in test environment, real implementation in production
// const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
//     ? { definePrompt: createMockPrompt }
//     : require('@/ai/genkit').ai;

export const generatePresentationPrompt = ai.definePrompt({
    name: 'generatePresentationPrompt',
    input: { schema: GeneratePresentationInputSchema },
    output: { schema: GeneratePresentationOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert presentation creator. Your task is to analyze the provided project context and create a compelling presentation slide deck.

**Your Process:**
1.  **Synthesize Context:** Read through all the provided documents (proposal, report sections, diagrams, etc.) to understand the key topics, arguments, and data.
2.  **Structure the Narrative:** Create a logical flow for the presentation. If a project plan is available, structure the presentation around its phases. Otherwise, start with an introduction, develop the main points, and end with a conclusion.
3.  **Draft Slides:** For each slide:
    *   Write a clear, concise title.
    *   Summarize the key information into 2-5 bullet points.
    *   Suggest a suitable 'layout' for the slide ('title_and_content', 'section_header', 'title_only', 'image_with_caption') based on its purpose. Use 'section_header' for slides that introduce a new major topic. If the slide content discusses a diagram, use the 'image_with_caption' layout.
    *   Write detailed speaker notes that elaborate on each bullet point, providing context and deeper explanations. **Crucially, include prompts for the presenter**, such as "Ask the audience if they have experience with..." or "Emphasize the cost savings here."

**CRITICAL INSTRUCTIONS:**
-   Your primary source of information is the project context provided below. Synthesize information from ALL of it to create a coherent narrative.
-   The total number of slides should be between 7 and 12.
-   The tone should be professional and engaging.

--- AVAILABLE CONTEXT FROM PROJECT ---

{{#if proposal}}
--- Project Proposal ---
\`\`\`json
{{{proposal}}}
\`\`\`
{{/if}}

{{#if projectPlan}}
--- Project Plan ---
\`\`\`json
{{{projectPlan}}}
\`\`\`
{{/if}}

{{#if otherSections}}
--- Other Report Sections ---
{{#each otherSections}}
--- Section: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if otherDiagrams}}
--- Other Generated Diagrams (PlantUML) ---
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if externalContext}}
--- Additional Context Files ---
{{#each externalContext}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}
`,
    config: {
        temperature: 0.7,
        maxOutputTokens: 8192,
    }
});
