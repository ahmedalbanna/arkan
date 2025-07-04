'use server';

/**
 * @fileOverview An AI agent for generating a project introduction from a full proposal.
 *
 * - generateIntroduction - A function that handles the project introduction generation.
 * - GenerateIntroductionInput - The input type for the generateIntroduction function (the full proposal).
 * - GenerateIntroductionOutput - The return type for the generateIntroduction function (the introduction text).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateIntroductionInput = ProjectProposal;

const GenerateIntroductionOutputSchema = z.object({
    introduction: z.string().describe("The complete, professionally written introduction for the project proposal document, formatted as a single string with markdown for paragraphs.")
});
export type GenerateIntroductionOutput = z.infer<typeof GenerateIntroductionOutputSchema>;

export async function generateIntroduction(input: GenerateIntroductionInput): Promise<GenerateIntroductionOutput> {
  return generateIntroductionFlow(input);
}

const generateIntroductionPrompt = ai.definePrompt({
  name: 'generateIntroductionPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateIntroductionOutputSchema },
  prompt: `You are an expert technical writer specializing in project proposals.
Given the following detailed project proposal in JSON format, your task is to write a complete and professional introduction section for the formal report.

The introduction should be well-structured and engaging, and must include:
1.  **Purpose of the Project**: A clear statement of why the project is being undertaken.
2.  **Problem Definition**: A detailed identification and explanation of the problem the project addresses.
3.  **Overview of the Document**: An outline of the report structure, mentioning the main sections.
4.  **Existing Systems or Technologies**: A description of current solutions and their limitations, justifying the need for this new project.

Synthesize the information from the entire proposal to create this introduction. Infer the problem from the objective and risks. Infer the limitations of existing systems from the project's goals.

Generate the entire introduction as a single, coherent text. Use markdown newlines for paragraph breaks.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateIntroductionFlow = ai.defineFlow(
  {
    name: 'generateIntroductionFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateIntroductionOutputSchema,
  },
  async (input) => {
    const { output } = await generateIntroductionPrompt(input);
    return output!;
  }
);
