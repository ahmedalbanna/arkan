
'use server';

/**
 * @fileOverview An AI agent for evaluating a project report against acceptance criteria.
 * - evaluateReport
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { detectAiContent } from './detect-ai-content';
import { EvaluateReportInputSchema, type EvaluateReportInput, EvaluateReportOutputSchema, type EvaluateReportOutput } from '@/ai/schemas';

const evaluateReportPrompt = ai.definePrompt(
  {
    name: 'evaluateReportPrompt',
    input: { schema: EvaluateReportInputSchema },
    output: { schema: EvaluateReportOutputSchema },
    model: 'googleai/gemini-1.5-flash',
    prompt: async (input) => {
      const stringifiedProposal = input.proposal ? JSON.stringify(input.proposal, null, 2) : 'No proposal provided.';
      return `You are an expert quality assurance analyst and document reviewer. Your task is to evaluate a comprehensive project report based on a given set of acceptance criteria.

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
${input.acceptanceCriteria?.map(c => `- ${c}`).join('\n') || '(No explicit criteria provided. Evaluate based on general quality and completeness.)'}
---
**Project Proposal (for context):**
\`\`\`json
${stringifiedProposal}
\`\`\`
---
**Report Sections:**
${Object.entries(input.reportSections).map(([key, value]) => `--- Section: ${key} ---\n${value}\n---`).join('\n')}
---
**Diagrams (PlantUML Code):**
${Object.entries(input.diagrams || {}).map(([key, value]) => `--- Diagram: ${key} ---\n${value}\n---`).join('\n')}
---
`;
    },
  }
);


const evaluateReportFlow = ai.defineFlow(
  {
    name: 'evaluateReportFlow',
    inputSchema: EvaluateReportInputSchema,
    outputSchema: EvaluateReportOutputSchema,
  },
  async (input) => {
    const { output } = await evaluateReportPrompt(input);
    if (!output) {
      throw new Error("Evaluation failed to produce an output.");
    }
    return output;
  }
);

export async function evaluateReport(input: EvaluateReportInput): Promise<EvaluateReportOutput> {
  return evaluateReportFlow(input);
}
