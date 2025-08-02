'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAgentConfigInputSchema = z.object({
  prompt: z.string().describe("The user's description of the agent to create."),
});

export const GenerateAgentConfigOutputSchema = z.object({
  name: z.string().describe("A short, descriptive name for the new agent."),
  instructions: z.string().describe("The base prompt or primary instruction for the agent. This should be a clear, concise paragraph explaining the agent's purpose and core function."),
  guidelines: z.string().describe("A newline-separated list of 3-5 specific, actionable guidelines for the agent to follow. Each guideline should start with '- '.")
});
export type GenerateAgentConfigOutput = z.infer<typeof GenerateAgentConfigOutputSchema>;


export async function generateAgentConfig(input: z.infer<typeof GenerateAgentConfigInputSchema>): Promise<GenerateAgentConfigOutput> {

  const prompt = ai.definePrompt({
    name: 'generateAgentConfigPrompt',
    input: { schema: GenerateAgentConfigInputSchema },
    output: { schema: GenerateAgentConfigOutputSchema },
    prompt: `You are an expert AI Agent Engineer. Your task is to take a user's description of a desired AI agent and generate a structured configuration for it.

**User's Request:**
"{{{prompt}}}"

**Your Task:**

1.  **Generate a Name:** Create a short, descriptive name for the agent (e.g., "Social Media Post Generator", "Technical Documentation Writer").
2.  **Write Instructions:** Write a clear, concise paragraph that will serve as the agent's primary instruction or 'base prompt'. This should explain its core purpose, who it is, and what it does.
3.  **Define Guidelines:** Create a list of 3-5 specific, actionable guidelines that will direct the agent's behavior, tone, and output format. Each guideline must be on a new line and start with '- '.

**Example Output:**

For a user request like "An agent that writes tweets about new tech products", your output should look like this:

{
  "name": "Tech Product Tweet Crafter",
  "instructions": "You are a witty and engaging social media copywriter specializing in technology. Your goal is to create exciting and concise tweets to announce new tech products, generating buzz and driving engagement.",
  "guidelines": "- Keep tweets under 280 characters.\\n- Include relevant hashtags like #TechLaunch or #Innovation.\\n- Maintain a slightly informal and enthusiastic tone.\\n- Always include a call-to-action, like asking a question or linking to a product page."
}
`,
  });

  const { output } = await prompt(input);
  return output!;
}
