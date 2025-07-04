'use server';

/**
 * @fileOverview AI agent for generating a Conclusion section for a project report.
 * - generateConclusion
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateConclusionInput = ProjectProposal;

const GenerateConclusionOutputSchema = z.object({
    conclusion: z.string().describe("The complete, professionally written 'Conclusion' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateConclusionOutput = z.infer<typeof GenerateConclusionOutputSchema>;

export async function generateConclusion(input: GenerateConclusionInput): Promise<GenerateConclusionOutput> {
  return generateConclusionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConclusionPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateConclusionOutputSchema },
  prompt: `You are an expert technical writer. Based on the detailed project proposal below, write a concise and impactful 'Conclusion' section for the final report.

The conclusion should:
1.  **Summarize Key Points**: Briefly reiterate the problem, the proposed solution, and the project's main objective.
2.  **Reiterate Expected Outcomes**: Restate the most important expected outcomes and the value the project will deliver.
3.  **Future Outlook**: Provide a forward-looking statement about the project's potential long-term impact or next steps after completion.
4.  **Final Statement**: End with a strong, conclusive statement that reinforces the project's importance and viability.

Synthesize information from the entire proposal to create a powerful conclusion. Use markdown for formatting.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateConclusionFlow = ai.defineFlow(
  {
    name: 'generateConclusionFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateConclusionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
