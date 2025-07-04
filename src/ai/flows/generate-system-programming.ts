'use server';

/**
 * @fileOverview AI agent for generating a System Programming section for a project report.
 * - generateSystemProgramming
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateSystemProgrammingInput = ProjectProposal;

const GenerateSystemProgrammingOutputSchema = z.object({
    systemProgramming: z.string().describe("The complete, professionally written 'System Programming and Implementation' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemProgrammingOutput = z.infer<typeof GenerateSystemProgrammingOutputSchema>;

export async function generateSystemProgramming(input: GenerateSystemProgrammingInput): Promise<GenerateSystemProgrammingOutput> {
  return generateSystemProgrammingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSystemProgrammingPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateSystemProgrammingOutputSchema },
  prompt: `You are a lead software engineer. Based on the project proposal below, write a 'System Programming and Implementation' section for the technical report.

This section should outline:
1.  **Development Workflow**: Describe the development process, aligning with the project's stated methodology (e.g., Git flow for Agile).
2.  **Coding Standards & Practices**: Mention key standards to be followed (e.g., code style guides, linting rules, commenting conventions).
3.  **Key Libraries & Frameworks**: Based on the project type, list the essential libraries and frameworks that will be used for implementation and justify their selection.
4.  **Environment Setup**: Briefly describe the development, staging, and production environments.
5.  **Version Control**: Specify the version control system (e.g., Git) and hosting platform (e.g., GitHub, GitLab).

Synthesize information from the entire proposal to create a practical implementation plan. Use markdown for formatting.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateSystemProgrammingFlow = ai.defineFlow(
  {
    name: 'generateSystemProgrammingFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateSystemProgrammingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
