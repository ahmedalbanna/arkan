'use server';

/**
 * @fileOverview AI agent for generating a System Testing section for a project report.
 * - generateSystemTesting
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateSystemTestingInput = ProjectProposal;

const GenerateSystemTestingOutputSchema = z.object({
    systemTesting: z.string().describe("The complete, professionally written 'System Testing' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemTestingOutput = z.infer<typeof GenerateSystemTestingOutputSchema>;

export async function generateSystemTesting(input: GenerateSystemTestingInput): Promise<GenerateSystemTestingOutput> {
  return generateSystemTestingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSystemTestingPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateSystemTestingOutputSchema },
  prompt: `You are a senior QA engineer. Using the project proposal below, write a comprehensive 'System Testing' section.

This section must define the testing strategy, including:
1.  **Testing Levels**: Describe the plan for Unit Testing, Integration Testing, System Testing, and User Acceptance Testing (UAT).
2.  **Testing Types**: Detail the approach for functional testing, usability testing, performance testing, and security testing.
3.  **Tools and Automation**: Recommend specific tools for test automation (e.g., Selenium, Cypress, Jest), performance testing (e.g., JMeter), and bug tracking (e.g., Jira).
4.  **Test Metrics**: Identify key metrics for success, such as test coverage, bug detection rate, and UAT pass rate, linking them to the project's success criteria.

Synthesize information from the entire proposal, especially the risks and success criteria, to create a robust testing plan. Use markdown for formatting.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateSystemTestingFlow = ai.defineFlow(
  {
    name: 'generateSystemTestingFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateSystemTestingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
