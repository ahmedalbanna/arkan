
'use server';

/**
 * @fileOverview An AI agent for evaluating a project report against acceptance criteria.
 * - evaluateReport
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema } from '@/ai/schemas';

const EvaluateReportInputSchema = z.object({
  proposal: ProjectProposalSchema.describe("The original project proposal."),
  reportSections: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => SectionNameSchema.safeParse(key).success);
  }, "All keys must be a valid SectionName").describe("A map of all generated report sections."),
  diagrams: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => DiagramTypeSchema.safeParse(key).success);
  }, "All keys must be a valid DiagramType").optional().describe("A map of all generated PlantUML diagrams."),
  acceptanceCriteria: z.array(z.string()).describe("A list of acceptance criteria to evaluate the report against."),
});

export type EvaluateReportInput = z.infer<typeof EvaluateReportInputSchema>;

const FeedbackItemSchema = z.object({
  point: z.string().describe("A specific feedback point related to one of the acceptance criteria."),
  status: z.enum(["Acceptable", "Weak", "Not Present"]).describe("The status of the report regarding this feedback point."),
});

const EvaluateReportOutputSchema = z.object({
  evaluationScore: z.number().min(0).max(100).describe("A numerical score from 0 to 100 representing the report's quality against the criteria."),
  feedback: z.array(FeedbackItemSchema).describe("A list of specific feedback points, including praise for met criteria and suggestions for areas of improvement, each with a status."),
  summary: z.string().describe("A concise summary of the overall evaluation."),
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
