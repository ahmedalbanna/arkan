'use server';

/**
 * @fileOverview AI agent for generating a Literature Review section for a project report.
 * - generateLiteratureReview
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateLiteratureReviewInput = ProjectProposal;

const GenerateLiteratureReviewOutputSchema = z.object({
    literatureReview: z.string().describe("The complete, professionally written 'Literature Review' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateLiteratureReviewOutput = z.infer<typeof GenerateLiteratureReviewOutputSchema>;

export async function generateLiteratureReview(input: GenerateLiteratureReviewInput): Promise<GenerateLiteratureReviewOutput> {
  return generateLiteratureReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLiteratureReviewPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateLiteratureReviewOutputSchema },
  prompt: `You are an academic and technical writer. Based on the detailed project proposal provided below, write a comprehensive 'Literature Review' section for the final report.

Your review should:
1.  Discuss existing research, established theories, and relevant studies in the project's domain.
2.  Analyze current technologies, frameworks, and methodologies that are pertinent to the project's objective.
3.  Identify the gaps in the existing literature or technology that this project aims to address.
4.  Provide a strong justification for the project by positioning it within the context of current knowledge and practices.

Synthesize information from the entire proposal to create a coherent and well-supported literature review. Use markdown for formatting.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateLiteratureReviewFlow = ai.defineFlow(
  {
    name: 'generateLiteratureReviewFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateLiteratureReviewOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
