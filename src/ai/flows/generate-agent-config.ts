'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAgentConfigInputSchema = z.object({
  prompt: z.string().describe("The user's description of the agent to create."),
  includeJsonOutput: z.boolean().optional().describe("Whether to include a sample JSON output structure in the agent's prompt."),
});

const GenerateAgentConfigOutputSchema = z.object({
  name: z.string().describe("A short, descriptive name for the new agent."),
  instructions: z.string().describe("The base prompt or primary instruction for the agent. This should be a clear, concise paragraph explaining the agent's purpose and core function."),
  guidelines: z.string().describe("A newline-separated list of 3-5 specific, actionable guidelines for the agent to follow. Each guideline should start with '- '.")
  jsonStructure: z.any().optional().describe("If the user requested JSON output, provide a sample JSON object structure that the agent should return. It should be a simple but relevant example based on the user's prompt. Otherwise, this field should be omitted."),
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
    {{#if includeJsonOutput}}
    **IMPORTANT**: The user wants this agent to produce structured JSON. Add a sentence to the end of the instructions like: "Your final output must be a valid JSON object that adheres to the defined schema."
    {{/if}}
3.  **Define Guidelines:** Create a list of 3-5 specific, actionable guidelines that will direct the agent's behavior, tone, and output format. Each guideline must be on a new line and start with '- '.
    {{#if includeJsonOutput}}
    Also, add a guideline like "- Ensure the JSON output is complete and does not contain any extra text or markdown formatting."
    {{/if}}
4.  **Define JSON Structure (If Requested):**
    {{#if includeJsonOutput}}
    The user has requested that the agent return JSON. Based on the user's prompt, create a simple but relevant example JSON object and place it in the \`jsonStructure\` field. This gives the user a starting point to define their schema. For example, for a "Recipe Generator", the structure might be \`{ "recipeName": "...", "ingredients": [], "instructions": [] }\`.
    {{else}}
    The user has not requested JSON output. Omit the \`jsonStructure\` field from your response.
    {{/if}}

**Example Output (with JSON requested):**

For a user request like "An agent that generates recipes", your output should look like this:

{
  "name": "Recipe Generator",
  "instructions": "You are a master chef. Your task is to generate a recipe based on user input. Your final output must be a valid JSON object that adheres to the defined schema.",
  "guidelines": "- Keep recipes clear and easy to follow.\\n- Include preparation and cooking times.\\n- Provide serving size suggestions.",
  "jsonStructure": {
    "recipeName": "Spaghetti Carbonara",
    "prepTime": "10 minutes",
    "cookTime": "15 minutes",
    "servings": 4,
    "ingredients": [
        { "item": "Spaghetti", "quantity": "400g" },
        { "item": "Pancetta", "quantity": "150g" },
        { "item": "Eggs", "quantity": "2" }
    ],
    "instructions": [
        "Boil the spaghetti.",
        "Fry the pancetta.",
        "Mix eggs and cheese.",
        "Combine everything."
    ]
  }
}
`,
  });

  const { output } = await prompt(input);
  return output!;
}
