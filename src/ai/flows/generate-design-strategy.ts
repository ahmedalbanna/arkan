'use server';

/**
 * @fileOverview AI agent for generating a Design Strategy section for a project report.
 * - generateDesignStrategy
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ProjectProposalSchema, type ProjectProposal } from '@/ai/schemas';

export type GenerateDesignStrategyInput = ProjectProposal;

const GenerateDesignStrategyOutputSchema = z.object({
    designStrategy: z.string().describe("The complete, professionally written 'Design Strategy' section for the project report, formatted as a single string with markdown for paragraphs.")
});
export type GenerateDesignStrategyOutput = z.infer<typeof GenerateDesignStrategyOutputSchema>;

export async function generateDesignStrategy(input: GenerateDesignStrategyInput): Promise<GenerateDesignStrategyOutput> {
  return generateDesignStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDesignStrategyPrompt',
  input: { schema: ProjectProposalSchema },
  output: { schema: GenerateDesignStrategyOutputSchema },
  prompt: `You are a senior design strategist and UI/UX expert. Based on the project proposal below, write a detailed 'Design Strategy' section.

This section should articulate:
1.  **Design Methodology**: Justify the choice of design approach (e.g., User-Centered Design, Double Diamond, etc.) based on the project's methodology and objectives.
2.  **Core Design Principles**: Define 3-5 key principles that will guide the design process (e.g., 'Clarity and Simplicity', 'Efficiency', 'Consistency').
3.  **User Experience (UX) Goals**: Describe the intended user experience, focusing on how the design will address stakeholder needs and solve the core problem.
4.  **User Interface (UI) Direction**: Outline the visual direction, including thoughts on layout, color palette, and typography that would align with the project's category and goals.

Synthesize information from the entire proposal to create a coherent design strategy. Use markdown for formatting.

Project Proposal Data:
\`\`\`json
{{{json this}}}
\`\`\`
`,
});

const generateDesignStrategyFlow = ai.defineFlow(
  {
    name: 'generateDesignStrategyFlow',
    inputSchema: ProjectProposalSchema,
    outputSchema: GenerateDesignStrategyOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
