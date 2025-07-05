import {z} from 'zod';

export const DiagramTypeSchema = z.enum([
  'useCase',
  'class',
  'sequence',
  'activity',
  'component',
  'archimate',
]);
export type DiagramType = z.infer<typeof DiagramTypeSchema>;

export const ProjectProposalSchema = z.object({
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

export type ProjectProposal = z.infer<typeof ProjectProposalSchema>;
