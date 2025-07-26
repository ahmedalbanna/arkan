
import { z } from 'zod';

export const DiagramTypeSchema = z.enum([
  'use-case',
  'class',
  'sequence',
  'activity',
  'component',
  'archimate',
  'er'
]);
export type DiagramType = z.infer<typeof DiagramTypeSchema>;

export const SectionNameSchema = z.enum([
  'introduction',
  'literatureReview',
  'systemAnalysis',
  'designStrategy',
  'systemDesign',
  'systemProgramming',
  'systemTesting',
  'conclusion',
  'abstract',
  'acknowledgment',
  'trainingProgram',
  'technicalExperience',
  'recommendations',
  'references',
  'appendices'
]);
export type SectionName = z.infer<typeof SectionNameSchema>;

export const AcademicContextSchema = z.object({
  documentType: z.enum(['research-paper', 'thesis', 'essay', 'report', 'case-study']).describe('The type of academic document being generated.'),
  subjectArea: z.string().describe('The main subject or field of study (e.g., Computer Science, Biology, History).'),
  academicLevel: z.enum(['high-school', 'undergraduate', 'graduate', 'doctorate']).describe('The target academic level for the content.'),
  citationStyle: z.enum(['apa', 'mla', 'chicago', 'ieee']).describe('The citation style to be used for references.'),
});
export type AcademicContext = z.infer<typeof AcademicContextSchema>;


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
  tags: z.array(z.string()).describe("A list of 3 to 5 relevant keywords or tags for the project (e.g., 'Productivity', 'eCommerce', 'AI')."),
  risks: z.array(z.object({
    description: z.string().describe("A description of a potential risk to the project."),
    mitigation: z.string().describe("The strategy to mitigate this potential risk."),
  })).describe("A list of potential risks and their mitigation strategies."),
});

export type ProjectProposal = z.infer<typeof ProjectProposalSchema>;

// A more flexible schema that allows for a structured proposal or any other object.
// This is useful for flows that might receive different kinds of proposal-like objects.
export const AnyProjectProposalSchema = z.union([
  ProjectProposalSchema,
  z.object({}).passthrough(), // Allows any object shape
]);
export type AnyProjectProposal = z.infer<typeof AnyProjectProposalSchema>;


export const ManipulateTextInputSchema = z.object({
  textToManipulate: z.string().describe('The original text to be modified.'),
  command: z.string().describe('The instruction for how to modify the text (e.g., "summarize", "expand on this topic", "rewrite this to be more formal").'),
});
export type ManipulateTextInput = z.infer<typeof ManipulateTextInputSchema>;

export const ManipulateTextOutputSchema = z.object({
  rewrittenText: z.string().describe('The resulting text after applying the command.'),
});
export type ManipulateTextOutput = z.infer<typeof ManipulateTextOutputSchema>;

export const PresentationSlideSchema = z.object({
  title: z.string().describe('The title for this presentation slide.'),
  content: z.array(z.string()).describe('A list of bullet points for the main content of the slide. Each string is one bullet point.'),
  speakerNotes: z.string().describe('Detailed speaker notes for the presenter to elaborate on the slide content.'),
});
export type PresentationSlide = z.infer<typeof PresentationSlideSchema>;

export const PresentationHistoryEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  slides: z.array(PresentationSlideSchema),
});
export type PresentationHistoryEntry = z.infer<typeof PresentationHistoryEntrySchema>;


export const GeneratePresentationInputSchema = z.object({
  proposal: ProjectProposalSchema.optional(),
  sections: z.record(SectionNameSchema, z.string()).optional(),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional(),
  prompt: z.string(),
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

export const GeneratePresentationOutputSchema = z.object({
  slides: z.array(PresentationSlideSchema),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;
