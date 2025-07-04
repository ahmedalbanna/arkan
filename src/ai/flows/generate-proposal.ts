'use server';

/**
 * @fileOverview An AI agent for generating detailed project proposals.
 *
 * - generateProposal - A function that handles the project proposal generation.
 * - GenerateProposalInput - The input type for the generateProposal function.
 * - GenerateProposalOutput - The return type for the generateProposal function (the full proposal).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProposalInputSchema = z.object({
  projectIdea: z.string().describe('A short description of the project idea.'),
});
export type GenerateProposalInput = z.infer<typeof GenerateProposalInputSchema>;

const ProjectProposalSchema = z.object({
  category: z.string().describe("A relevant category for the project (e.g., 'Software Development', 'UI/UX Design', 'AI')."),
  title: z.string().describe("A clear and descriptive title for the project."),
  objective: z.string().describe("The main goal or objective of the project. What problem does it solve?"),
  methodology: z.string().describe("The approach and process to be followed (e.g., Agile, Waterfall). Describe the key phases."),
  expected_outcome: z.array(z.string()).describe("A list of tangible and measurable results expected from the project."),
  timeline: z.object({
    startDate: z.string().describe("The planned start date for the project in YYYY-MM-DD format. Base this on the current date."),
    endDate: z.string().describe("The planned end date for the project in YYYY-MM-DD format."),
    phases: z.array(z.object({
      name: z.string().describe("The name of the project phase (e.g., 'Discovery & Planning')."),
      durationWeeks: z.number().describe("The duration of the phase in weeks."),
    })).describe("An array of project phases with their names and durations."),
  }).describe("The project timeline, including start/end dates and phases."),
  budget: z.object({
    totalAmount: z.number().describe("The total estimated budget for the project."),
    currency: z.string().describe("The currency for the budget (e.g., 'USD')."),
    breakdown: z.array(z.object({
      item: z.string().describe("A specific item in the budget breakdown (e.g., 'Labor', 'Software Licensing')."),
      cost: z.number().describe("The estimated cost for this budget item."),
    })).describe("A detailed breakdown of the project budget."),
  }).describe("The estimated budget for the project."),
  stakeholders: z.array(z.object({
    name: z.string().describe("The name of the stakeholder or stakeholder group."),
    role: z.string().describe("The stakeholder's role in the project (e.g., 'Primary User', 'Sponsor')."),
    interest: z.string().describe("The stakeholder's interest or investment in the project."),
  })).describe("A list of key stakeholders involved in the project."),
  success_criteria: z.array(z.string()).describe("A list of measurable criteria that will define the project's success."),
  evaluation: z.string().describe("A description of how the project's success will be measured and assessed."),
  risks: z.array(z.object({
    description: z.string().describe("A description of a potential risk to the project."),
    mitigation: z.string().describe("The strategy to mitigate this potential risk."),
  })).describe("A list of potential risks and their mitigation strategies."),
});

export type GenerateProposalOutput = z.infer<typeof ProjectProposalSchema>;

export async function generateProposal(input: GenerateProposalInput): Promise<GenerateProposalOutput> {
  return generateProposalFlow(input);
}

const generateProposalPrompt = ai.definePrompt({
  name: 'generateProposalPrompt',
  input: { schema: GenerateProposalInputSchema },
  output: { schema: ProjectProposalSchema },
  prompt: `You are an expert project manager. A user will provide you with a project idea. Your task is to generate a comprehensive and professional project proposal based on that idea.

The proposal should be well-structured, realistic, and detailed. Fill out all the fields in the required output format with plausible information. Make sure the start and end dates in the timeline are logical based on today's date.

Project Idea: {{{projectIdea}}}
`,
});

const generateProposalFlow = ai.defineFlow(
  {
    name: 'generateProposalFlow',
    inputSchema: GenerateProposalInputSchema,
    outputSchema: ProjectProposalSchema,
  },
  async (input) => {
    const { output } = await generateProposalPrompt(input);
    return output!;
  }
);
