
'use server';

/**
 * @fileOverview An AI agent for generating presentation slides from a project proposal and report.
 * - generatePresentation
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  GeneratePresentationInputSchema,
  type GeneratePresentationInput,
  GeneratePresentationOutputSchema,
  type GeneratePresentationOutput,
} from '@/ai/schemas';

export async function generatePresentation(input: Omit<GeneratePresentationInput, 'templateId'>): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema.omit({ templateId: true }),
    outputSchema: GeneratePresentationOutputSchema,
  },
  async (input) => {

    // Separate media from text files for the prompt
    const textContext = input.sourceDocuments?.filter(f => !f.content.startsWith('data:')) || [];
    const mediaContext = input.sourceDocuments?.filter(f => f.content.startsWith('data:')) || [];
    
    const prompt = ai.definePrompt({
      name: 'generatePresentationPrompt',
      input: { schema: z.any() }, // Using any() since we are manually constructing the payload
      output: { schema: GeneratePresentationOutputSchema },
      model: 'googleai/gemini-1.5-flash',
      prompt: `You are an expert presentation creator. Your task is to analyze the provided source documents and create a compelling presentation slide deck.

**Your Process:**
1.  **Synthesize Content:** Read through all the provided source documents to understand the key topics, arguments, and data. The documents are varied and may include project proposals, report sections, diagrams (as PlantUML code), a project plan, or other text.
2.  **Structure the Narrative:** Create a logical flow for the presentation. If a project plan is available, structure the presentation around its phases. Otherwise, start with an introduction, develop the main points, and end with a conclusion.
3.  **Draft Slides:** For each slide:
    *   Write a clear, concise title.
    *   Summarize the key information into 2-5 bullet points.
    *   Suggest a suitable 'layout' for the slide ('title_and_content', 'section_header', 'title_only', 'image_with_caption') based on its purpose. Use 'section_header' for slides that introduce a new major topic. If the slide content discusses a diagram, use the 'image_with_caption' layout.
    *   Write detailed speaker notes that elaborate on each bullet point, providing context and deeper explanations. **Crucially, include prompts for the presenter**, such as "Ask the audience if they have experience with..." or "Emphasize the cost savings here."

**CRITICAL INSTRUCTIONS:**
-   Your primary source of information is the 'Source Documents' and 'Project Plan' provided below. Synthesize information from ALL of them to create a coherent narrative.
-   Adhere to all provided guidelines, including tone and complexity.

--- GUIDELINES ---
{{#if guidelines}}
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{else}}
- The total number of slides should be between 7 and 12.
- Each slide must have a clear title.
- Slide content should be a list of 2-5 concise bullet points.
- Speaker notes must be detailed, providing elaboration for each bullet point.
- The tone should be {{#if tone}}{{tone}}{{else}}professional{{/if}}.
- The complexity should be {{#if complexity}}{{complexity}}{{else}}a standard summary{{/if}}.
{{/if}}

--- PROJECT PLAN ---
{{#if projectPlan}}
\`\`\`json
${JSON.stringify(input.projectPlan, null, 2)}
\`\`\`
{{else}}
(No project plan provided)
{{/if}}

--- SOURCE DOCUMENTS ---
{{#each textContext}}
--- Document: {{this.fileName}} ---
{{{this.content}}}
---
{{/each}}

{{#each mediaContext}}
--- Document (Media): {{this.fileName}} ---
{{media url=this.content}}
---
{{/each}}
`,
      config: {
          temperature: 0.7,
          maxOutputTokens: 8192,
      }
    });

    const { output } = await prompt({ ...input, textContext, mediaContext });
    return output!;
  }
);
