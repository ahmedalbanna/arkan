
'use server';

/**
 * @fileOverview AI agent for generating a Literature Review section for a project report.
 * - generateLiteratureReview
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const GenerateLiteratureReviewInputSchema = z.object({
  proposal: ProjectProposalSchema,
  otherSections: z.record(SectionNameSchema, z.string()).optional().describe("A map of previously generated text sections to provide context. The key is the section name and the value is the markdown content."),
  otherDiagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of previously generated PlantUML diagrams to provide context. The key is the diagram type and the value is the PlantUML code."),
  prompt: z.string().describe("The prompt to use for generating the literature review.")
});
export type GenerateLiteratureReviewInput = z.infer<typeof GenerateLiteratureReviewInputSchema>;

const GenerateLiteratureReviewOutputSchema = z.object({
  literatureReview: z.string().describe("The complete, professionally written 'Literature Review' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateLiteratureReviewOutput = z.infer<typeof GenerateLiteratureReviewOutputSchema>;

export async function generateLiteratureReview(input: GenerateLiteratureReviewInput): Promise<GenerateLiteratureReviewOutput> {
  return generateLiteratureReviewFlow(input);
}

const generateLiteratureReviewFlow = ai.defineFlow(
  {
    name: 'generateLiteratureReviewFlow',
    inputSchema: GenerateLiteratureReviewInputSchema,
    outputSchema: GenerateLiteratureReviewOutputSchema,
  },
  async ({ proposal, otherSections, otherDiagrams, prompt: basePrompt }) => {

    const contextContent = [];
    if (otherSections && Object.keys(otherSections).length > 0) {
        contextContent.push('--- PREVIOUSLY GENERATED SECTIONS ---');
        for (const [sectionName, content] of Object.entries(otherSections)) {
            contextContent.push(`--- Section: ${sectionName} ---\n${content}\n---`);
        }
    }
    if (otherDiagrams && Object.keys(otherDiagrams).length > 0) {
        contextContent.push('--- PREVIOUSLY GENERATED DIAGRAMS (PlantUML) ---');
        for (const [diagramType, diagramCode] of Object.entries(otherDiagrams)) {
            contextContent.push(`--- Diagram: ${diagramType} ---\n${diagramCode}\n---`);
        }
    }
    const contextString = contextContent.join('\n\n');

    const fullPrompt = `${basePrompt}
    
${contextString}

--- Main Input: Project Proposal ---
\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`
`;
    const prompt = ai.definePrompt({
      name: 'generateLiteratureReviewPrompt',
      input: { schema: GenerateLiteratureReviewInputSchema },
      output: { schema: GenerateLiteratureReviewOutputSchema },
      prompt: fullPrompt,
    });
    const { output } = await prompt({ proposal, otherSections, otherDiagrams, prompt: basePrompt });
    return output!;
  }
);
