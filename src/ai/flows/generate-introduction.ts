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

export type GenerateIntroductionInput = z.infer<typeof ProjectProposalSchema>;

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
