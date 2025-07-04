'use server';

/**
 * @fileOverview AI agent for generating a System Analysis section for a project report.
 * - generateSystemAnalysis
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateSystemAnalysisInput = ProjectProposal;

const GenerateSystemAnalysisOutputSchema = z.object({
    systemAnalysis: z.string().describe("The complete, professionally written 'System Analysis' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemAnalysisOutput = z.infer<typeof GenerateSystemAnalysisOutputSchema>;

export async function generateSystemAnalysis(input: GenerateSystemAnalysisInput): Promise<GenerateSystemAnalysisOutput> {
  return generateSystemAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSystemAnalysisPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateSystemAnalysisOutputSchema },
  prompt: `You are an expert systems analyst. Based on the detailed project proposal below, write a thorough 'System Analysis' section.

Your analysis must cover:
1.  **Functional Requirements**: Detail the specific functions the system must perform. Infer these from the project objective, expected outcomes, and stakeholders' interests.
2.  **Non-Functional Requirements**: Describe the system's quality attributes, such as performance, security, usability, and scalability. Infer these from the project's context and risks.
3.  **Stakeholder Analysis**: Elaborate on the needs and expectations of each stakeholder group identified in the proposal.
4.  **Problem Analysis**: Expand on the limitations of current systems (as suggested by the project's rationale) and clearly define the scope of the problem being solved.

Synthesize information from the entire proposal to create a comprehensive analysis. Use markdown for formatting, including bullet points for requirements.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateSystemAnalysisFlow = ai.defineFlow(
  {
    name: 'generateSystemAnalysisFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateSystemAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
