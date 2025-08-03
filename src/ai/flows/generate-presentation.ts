
'use server';

/**
 * @fileOverview An AI agent for generating presentation slides from a project proposal and report.
 * - generatePresentation
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ProjectProposalSchema,
  PresentationSlideSchema,
} from '@/ai/schemas';


const GeneratePresentationInputSchema = z.object({
  proposal: ProjectProposalSchema.nullable().optional().describe("An optional project proposal for high-level context."),
  guidelines: z.array(z.string()).optional(),
  sourceDocuments: z.array(z.object({
      fileName: z.string(),
      content: z.string(),
  })).min(1, "At least one source document is required.").describe("An array of source documents (text or data URIs) to be synthesized into a presentation."),
  templateId: z.string(), // The ID of the template which contains the primary agent and other config
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

const GeneratePresentationOutputSchema = z.object({
  slides: z.array(PresentationSlideSchema),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;


export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async (input) => {
    
    const stringifiedProposal = input.proposal ? JSON.stringify(input.proposal, null, 2) : '';

    // Separate media from text files for the prompt
    const textContext = input.sourceDocuments?.filter(f => !f.content.startsWith('data:')) || [];
    const mediaContext = input.sourceDocuments?.filter(f => f.content.startsWith('data:')) || [];

    const prompt = ai.definePrompt({
      name: 'generatePresentationPrompt',
      input: { schema: z.any() }, // Using any() since we are manually constructing the payload
      output: { schema: GeneratePresentationOutputSchema },
      prompt: `You are an expert presentation creator. Your task is to analyze the provided source documents and create a compelling presentation slide deck.

**Your Process:**
1.  **Synthesize Content:** Read through all the provided source documents to understand the key topics, arguments, and data.
2.  **Structure the Narrative:** Create a logical flow for the presentation. Start with an introduction, develop the main points across several slides, and end with a conclusion.
3.  **Draft Slides:** For each slide:
    *   Write a clear, concise title.
    *   Summarize the key information into 2-5 bullet points.
    *   Write detailed speaker notes that elaborate on each bullet point, providing context and deeper explanations.

**CRITICAL INSTRUCTIONS:**
-   Your primary source of information is the 'Source Documents' provided below.
-   If a 'Project Proposal' is also provided, use it for high-level context (like the overall objective) but base the slide content on the detailed source documents.
-   Adhere to all provided guidelines.

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
- Maintain a professional and engaging tone throughout.
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


{{#if proposal}}
--- High-Level Context: Project Proposal ---
\`\`\`json
${stringifiedProposal}
\`\`\`
{{/if}}
`,
    });

    const { output } = await prompt({ ...input, textContext, mediaContext });
    return output!;
  }
);
