
'use server';

/**
 * @fileOverview An AI agent for evaluating a project report against acceptance criteria.
 * - evaluateReport
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';
import { detectAiContent } from './detect-ai-content';

const EvaluateReportInputSchema = z.object({
  proposal: ProjectProposalSchema.describe("The original project proposal.").optional().nullable(),
  reportSections: z.record(SectionNameSchema, z.string()).describe("A map of all generated report sections."),
  diagrams: z.record(DiagramTypeSchema, z.string()).optional().describe("A map of all generated PlantUML diagrams.").nullable(),
  acceptanceCriteria: z.array(z.string()).describe("A list of acceptance criteria to evaluate the report against.").nullable().optional(),
});

export type EvaluateReportInput = z.infer<typeof EvaluateReportInputSchema>;

const FeedbackItemSchema = z.object({
  point: z.string().describe("A specific feedback point related to one of the acceptance criteria."),
  status: z.enum(["Acceptable", "Weak", "Not Present"]).describe("The status of the report regarding this feedback point."),
  sectionKey: SectionNameSchema.optional().describe("The specific section key (e.g., 'introduction', 'systemDesign') this feedback point applies to. This is crucial for applying automated fixes."),
  solution: z.string().optional().describe("A suggested prompt for an AI agent to fix the issue if status is 'Weak' or 'Not Present'. This prompt should be a clear, actionable command."),
});

const AIContentAnalysisSchema = z.object({
    sectionName: z.string(),
    aiContentScore: z.number().min(0).max(100),
    analysis: z.string(),
});

const EvaluateReportOutputSchema = z.object({
  evaluationScore: z.number().min(0).max(100).describe("A numerical score from 0 to 100 representing the report's quality against the criteria."),
  feedback: z.array(FeedbackItemSchema).describe("A list of specific feedback points, including praise for met criteria and suggestions for areas of improvement, each with a status."),
  summary: z.string().describe("A concise summary of the overall evaluation."),
  aiContentAnalysis: z.array(AIContentAnalysisSchema).optional().describe("An analysis of each section for AI-generated content probability."),
});

export type EvaluateReportOutput = z.infer<typeof EvaluateReportOutputSchema>;

export async function evaluateReport(input: EvaluateReportInput): Promise<EvaluateReportOutput> {
  return evaluateReportFlow(input);
}

const evaluateReportFlow = ai.defineFlow(
  {
    name: 'evaluateReportFlow',
    inputSchema: EvaluateReportInputSchema,
    outputSchema: EvaluateReportOutputSchema,
  },
  async (input) => {

    const stringifiedProposal = JSON.stringify(input.proposal, null, 2);

    const prompt = ai.definePrompt({
      name: 'evaluateReportPrompt',
      input: { schema: EvaluateReportInputSchema },
      output: { schema: EvaluateReportOutputSchema },
      model: 'googleai/gemini-1.5-pro',
      prompt: `You are an expert quality assurance analyst and document reviewer. Your task is to evaluate a comprehensive project report based on a given set of acceptance criteria.

You will be provided with the full project proposal, all generated report sections, and a list of acceptance criteria.

Your evaluation must be objective and thorough.
1.  **Analyze the Report**: Carefully read through all the provided sections and diagrams to understand the full scope and content of the project documentation.
2.  **Compare Against Criteria**: For each acceptance criterion, determine how well the report meets the requirement.
3.  **Provide Structured Feedback**: Generate a list of feedback points. For each point:
    - State the feedback clearly in the 'point' field.
    - Assign a 'status':
        - **"Acceptable"**: If the criterion is fully met.
        - **"Weak"**: If the criterion is partially met or needs improvement.
        - **"Not Present"**: If the criterion is not addressed in the report.
    - **Identify the Section**: In the 'sectionKey' field, specify the exact section name (e.g., 'introduction', 'systemDesign') the feedback is most relevant to. This is mandatory for 'Weak' or 'Not Present' statuses.
    - **Propose a Solution**: If the status is 'Weak' or 'Not Present', provide a short, actionable prompt in the 'solution' field that a user could give to another AI agent to fix the issue (e.g., "Rewrite the introduction to be more concise" or "Add a section explaining the project's budget"). If the status is 'Acceptable', leave the solution field empty.
4.  **Calculate Score**: Assign a numerical score from 0 to 100 based on the percentage of criteria met and the overall quality of the documentation. A report that perfectly meets all criteria should receive a score close to 100.
5.  **Summarize**: Write a brief summary of your findings.

---
**Acceptance Criteria to Evaluate Against:**
{{#each acceptanceCriteria}}
- {{{this}}}
{{/each}}
---
**Project Proposal (for context):**
\`\`\`json
${stringifiedProposal}
\`\`\`
---
**Report Sections:**
{{#each reportSections}}
--- Section: {{@key}} ---
{{{this}}}
---
{{/each}}
---
**Diagrams (PlantUML Code):**
{{#each diagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
---
`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);
