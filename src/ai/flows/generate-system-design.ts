'use server';

/**
 * @fileOverview AI agent for generating a System Design section for a project report.
 * - generateSystemDesign
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateSystemDesignInput = ProjectProposal;

const GenerateSystemDesignOutputSchema = z.object({
    systemDesign: z.string().describe("The complete, professionally written 'System Design' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateSystemDesignOutput = z.infer<typeof GenerateSystemDesignOutputSchema>;

export async function generateSystemDesign(input: GenerateSystemDesignInput): Promise<GenerateSystemDesignOutput> {
  return generateSystemDesignFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSystemDesignPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateSystemDesignOutputSchema },
  prompt: `You are a principal software architect. From the project proposal provided, create a comprehensive 'System Design' section.

This section must detail:
1.  **High-Level Architecture**: Describe and justify the chosen architectural pattern (e.g., Monolithic, Microservices, Serverless). Base the choice on the project's scale, objectives, and risks.
2.  **Data Model / Schema**: Outline the key data entities, their attributes, and relationships. Think about users, primary objects, and configurations.
3.  **Component Breakdown**: Describe the major components of the system (e.g., Authentication Service, API Gateway, Frontend Application, Database) and their responsibilities.
4.  **Technology Stack**: Propose a specific and justified technology stack for the backend, frontend, database, and deployment based on the project's requirements.

Synthesize information from the entire proposal to produce a logical and robust system design. Use markdown for formatting.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateSystemDesignFlow = ai.defineFlow(
  {
    name: 'generateSystemDesignFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateSystemDesignOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
