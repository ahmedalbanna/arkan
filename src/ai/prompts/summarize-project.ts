'use server';

import { ai } from '@/ai/genkit';
import { SummarizeFullProjectInputSchema, SummarizeFullProjectOutputSchema, SummarizeProjectInputSchema, SummarizeProjectOutputSchema } from '@/ai/schemas';
import { z } from 'genkit';

export const summarizeProjectPrompt = ai.definePrompt({
    name: 'summarizeProjectPrompt',
    input: { schema: SummarizeProjectInputSchema },
    output: { schema: SummarizeProjectOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an AI assistant designed to analyze software project descriptions. Your tasks are:
1. Provide a concise summary of the project, highlighting its key aspects.
2. Identify and extract a list of all technologies, frameworks, and libraries mentioned.

Please analyze the following project description and provide the output in the required structured format.

Description: {{{projectDescription}}}`,
});

export const planningSummaryPrompt = ai.definePrompt({
    name: 'summarizeForPlanningPrompt',
    input: { schema: z.object({ jsonStringifiedProposal: z.string() }) },
    output: { schema: SummarizeFullProjectOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are a project manager. The user has provided a project proposal and needs a summarized version to use for planning.

**Your Task:**
1.  **Project Summary**: Read the \`objective\` from the proposal and write a concise, one-paragraph summary. Start it with "Project Summary:".
2.  **Key Deliverables**: Read the \`expected_outcome\` array from the proposal and list them as bullet points. Start this section on a new line with "Key Deliverables:".

--- PROJECT PROPOSAL (JSON) ---
\`\`\`json
{{{jsonStringifiedProposal}}}
\`\`\`
`,
});

export const fullReportSummaryPrompt = ai.definePrompt({
    name: 'summarizeFullProjectPrompt',
    input: { schema: SummarizeFullProjectInputSchema.extend({ jsonStringifiedProposal: z.string() }) },
    output: { schema: SummarizeFullProjectOutputSchema },
    model: 'googleai/gemini-2.0-flash',
    prompt: `You are an expert project analyst. Your task is to create a high-level executive summary based on a full project proposal (JSON) and a generated report (Markdown).

**Analysis Steps:**
1.  **Understand the Goal**: Read the \`objective\` and \`title\` from the proposal to grasp the project's core purpose.
2.  **Review the Plan**: Look at the \`timeline\` and \`budget\` to understand the project's scope and scale.
3.  **Synthesize the Report**: Read the provided report sections to understand the detailed analysis, design, and conclusions.
4.  **Draft the Summary**: Write a concise executive summary that covers the problem, the proposed solution, key findings from the report, and the final conclusion.

--- PROJECT PROPOSAL (JSON) ---
\`\`\`json
{{{jsonStringifiedProposal}}}
\`\`\`

--- FULL REPORT (Markdown) ---
{{{reportMarkdown}}}
---
`,
});
