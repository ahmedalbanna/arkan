
'use server';

/**
 * @fileOverview A flow for summarizing uploaded projects using AI.
 *
 * - summarizeProject - A function that handles the project summarization process.
 * - SummarizeProjectInput - The input type for the summarizeProject function.
 * - SummarizeProjectOutput - The return type for the summarizeProject function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AnyProjectProposalSchema, ProjectProposalSchema } from '../schemas';

const SummarizeProjectInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('The detailed description of the project that needs to be summarized.'),
  prompt: z.string().describe('The prompt to use for generating the summary.')
});
export type SummarizeProjectInput = z.infer<typeof SummarizeProjectInputSchema>;

const SummarizeProjectOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the project.'),
  technologies: z.array(z.string()).describe('A list of technologies, frameworks, and libraries identified in the project description.'),
  progress: z.string().describe('Details on the summarization progress'),
});
export type SummarizeProjectOutput = z.infer<typeof SummarizeProjectOutputSchema>;

export async function summarizeProject(input: SummarizeProjectInput): Promise<SummarizeProjectOutput> {
  return summarizeProjectFlow(input);
}

const summarizeProjectFlow = ai.defineFlow(
  {
    name: 'summarizeProjectFlow',
    inputSchema: SummarizeProjectInputSchema,
    outputSchema: SummarizeProjectOutputSchema,
  },
  async input => {
    const summarizeProjectPrompt = ai.definePrompt({
      name: 'summarizeProjectPrompt',
      input: { schema: SummarizeProjectInputSchema },
      output: { schema: SummarizeProjectOutputSchema },
      prompt: input.prompt,
    });

    const { output } = await summarizeProjectPrompt(input);
    return {
      ...output!,
      progress: 'Generated a concise summary of the project and extracted key technologies.',
    };
  }
);


// New flow for summarizing a full project
const SummarizeFullProjectInputSchema = z.object({
  proposal: AnyProjectProposalSchema.describe("The full JSON of the project proposal."),
  reportMarkdown: z.string().describe("The concatenated markdown content of all generated report sections.")
});
export type SummarizeFullProjectInput = z.infer<typeof SummarizeFullProjectInputSchema>;

const SummarizeFullProjectOutputSchema = z.object({
  summary: z.string().describe('A concise executive summary of the entire project.'),
});
export type SummarizeFullProjectOutput = z.infer<typeof SummarizeFullProjectOutputSchema>;


export async function summarizeFullProject(input: SummarizeFullProjectInput): Promise<SummarizeFullProjectOutput> {
  const { proposal, reportMarkdown } = input;
  const stringifiedProposal = JSON.stringify(proposal, null, 2);

  // If we only have a proposal, generate a summary suitable for the project planner.
  if (!reportMarkdown && proposal) {
      const planningSummaryPrompt = ai.definePrompt({
          name: 'summarizeForPlanningPrompt',
          input: { schema: z.any() },
          output: { schema: SummarizeFullProjectOutputSchema },
          prompt: `You are a project manager. The user has provided a project proposal and needs a summarized version to use for planning.

**Your Task:**
1.  **Project Summary**: Read the \`objective\` from the proposal and write a concise, one-paragraph summary. Start it with "Project Summary:".
2.  **Key Deliverables**: Read the \`expected_outcome\` array from the proposal and list them as bullet points. Start this section on a new line with "Key Deliverables:".

--- PROJECT PROPOSAL (JSON) ---
\`\`\`json
${stringifiedProposal}
\`\`\`
`,
      });
      const { output } = await planningSummaryPrompt(input);
      return output!;
  }


  const prompt = ai.definePrompt({
    name: 'summarizeFullProjectPrompt',
    input: { schema: SummarizeFullProjectInputSchema },
    output: { schema: SummarizeFullProjectOutputSchema },
    prompt: `You are an expert project analyst. Your task is to create a high-level executive summary based on a full project proposal (JSON) and a generated report (Markdown).

**Analysis Steps:**
1.  **Understand the Goal**: Read the \`objective\` and \`title\` from the proposal to grasp the project's core purpose.
2.  **Review the Plan**: Look at the \`timeline\` and \`budget\` to understand the project's scope and scale.
3.  **Synthesize the Report**: Read the provided report sections to understand the detailed analysis, design, and conclusions.
4.  **Draft the Summary**: Write a concise executive summary that covers the problem, the proposed solution, key findings from the report, and the final conclusion.

--- PROJECT PROPOSAL (JSON) ---
\`\`\`json
${stringifiedProposal}
\`\`\`

--- FULL REPORT (Markdown) ---
${reportMarkdown}
---
`,
  });

  const { output } = await prompt({ proposal, reportMarkdown });
  return output!;
}
