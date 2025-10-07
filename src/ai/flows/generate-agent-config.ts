
'use server';

import { ai } from '@/ai/genkit';
import { GenerateAgentConfigInputSchema, GenerateAgentConfigOutputSchema, type GenerateAgentConfigOutput } from '@/ai/schemas';
import { z } from 'zod';

const generateAgentConfigPrompt = ai.definePrompt({
  name: 'generateAgentConfigPrompt',
  input: { schema: GenerateAgentConfigInputSchema },
  output: { schema: GenerateAgentConfigOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert AI Agent Engineer. Your task is to take a user's description of a desired AI agent, along with any provided context files, and generate a structured configuration for it.

**User's Request:**
"{{{prompt}}}"

---
{{#if contextFiles}}
**Provided Context Files for Analysis:**
The following files have been provided to give you more context about the desired agent's domain and tasks. Analyze them carefully to inform your generated configuration.
{{#each contextFiles}}
--- File: {{this.name}} (Type: {{this.type}}) ---
{{media url=this.content}}
---
{{/each}}
{{/if}}
---

**Your Task:**

1.  **Analyze Context**: If context files are provided, analyze their content to understand the specific domain, terminology, and requirements. This should heavily influence all generated fields.
2.  **Generate a Name:** Create a short, descriptive name for the agent (e.g., "Social Media Post Generator", "Technical Documentation Writer").
3.  **Generate a Description:** Write a single, concise sentence that describes the agent's main function.
4.  **Write Instructions:** Write a clear, concise paragraph that will serve as the agent's primary instruction or 'base prompt'. This should explain its core purpose, who it is, and what it does.
    {{#if includeJsonOutput}}
    **IMPORTANT**: The user wants this agent to produce structured JSON. Add a sentence to the end of the instructions like: "Your final output must be a valid JSON object that adheres to the defined schema."
    {{/if}}
5.  **Define Guidelines:** Create a list of 3-5 specific, actionable guidelines that will direct the agent's behavior, tone, and output format. Each guideline must be on a new line and start with '- '.
    {{#if includeJsonOutput}}
    Also, add a guideline like "- Ensure the JSON output is complete and does not contain any extra text or markdown formatting."
    {{/if}}
6.  **Define JSON Structure (If Requested):**
    {{#if includeJsonOutput}}
    The user has requested that the agent return JSON. Based on the user's prompt and any provided context, create a simple but relevant example JSON object and place it in the \`jsonStructure\` field. This gives the user a starting point to define their schema.
    {{else}}
    The user has not requested JSON output. Omit the \`jsonStructure\` field from your response.
    {{/if}}

`,
});

const generateAgentConfigFlow = ai.defineFlow({
  name: 'generateAgentConfigFlow',
  inputSchema: GenerateAgentConfigInputSchema,
  outputSchema: GenerateAgentConfigOutputSchema
}, async (input) => {
  const { output } = await generateAgentConfigPrompt(input);
  if (!output) {
    throw new Error("Agent configuration generation failed.");
  }
  return output;
});


export async function generateAgentConfig(input: z.infer<typeof GenerateAgentConfigInputSchema>): Promise<GenerateAgentConfigOutput> {
  const validation = GenerateAgentConfigInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for generateAgentConfig: ${validation.error.message}`);
  }
  return generateAgentConfigFlow(validation.data);
}
