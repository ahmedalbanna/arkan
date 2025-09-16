

'use server';

/**
 * @fileOverview A generic AI agent for generating any section of a project report.
 * - generateReportSection
 */

import { ai } from '@/ai/genkit';
import { GenerateSectionInputSchema, GenerateSectionOutputSchema, type GenerateSectionInput, type GenerateSectionOutput } from '@/ai/schemas';
import { getAgent } from '@/lib/db/queries';
import type { AgentPrompt } from '@/lib/types';
import { z } from 'genkit';

// Define a specific schema for the prompt's input variables for better type safety and clarity.
const ReportSectionPromptInputSchema = GenerateSectionInputSchema.and(
  z.object({
    systemPrompt: z.string(),
    stringifiedProposal: z.string(),
    stringifiedPlan: z.string(),
  })
);

// Define the prompt outside the flow to prevent re-registration
const reportSectionPrompt = ai.definePrompt({
  name: 'generateReportSectionPrompt', // Static name
  input: { schema: ReportSectionPromptInputSchema },
  output: { schema: GenerateSectionOutputSchema },
  model: 'googleai/gemini-1.5-flash', // Default model, will be overridden by agent config.
  system: '{{systemPrompt}}', // System prompt will be passed in
  prompt: `
CRITICAL: Your final output must be a JSON object where the 'sectionName' field exactly matches the requested section: '{{sectionToGenerate}}'. Your writing style should be natural and engaging, not robotic.

{{#if guidelines}}
--- Guidelines ---
{{#each guidelines}}
- {{{this}}}
{{/each}}
{{/if}}

{{#if instructionText}}
--- Additional Instructions ---
{{{instructionText}}}
{{/if}}

--- Context from Project ---
{{#if exampleFiles}}
--- IMPORTANT EXAMPLES (STYLE REFERENCE) ---
You MUST heavily reference the following content for style, tone, and structure.
{{#each exampleFiles}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if contextFiles}}
--- FACTUAL CONTEXT ---
Use the following content for information and data.
{{#each contextFiles}}
File: {{this.fileName}}
{{{this.content}}}
---
{{/each}}
{{/if}}

{{#if otherSections}}
--- PREVIOUSLY GENERATED SECTIONS ---
{{#each otherSections}}
--- Section: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}
{{#if otherDiagrams}}
--- PREVIOUSLY GENERATED DIAGRAMS (PlantUML) ---
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
{{/if}}

{{#if proposal}}
--- Main Input: Project Proposal ---
\`\`\`json
{{{stringifiedProposal}}}
\`\`\`
{{else}}
(No project proposal is being used for this generation. Rely on other provided context.)
{{/if}}

{{#if projectPlan}}
--- Main Input: Project Plan ---
\`\`\`json
{{{stringifiedPlan}}}
\`\`\`
{{/if}}
`,
  config: {
    temperature: 0.3, // Controls the degree of randomness in token selection. A lower value is good for a more predictable response. A higher value leads to more diverse or unexpected results. The default value is 1.0.
    maxOutputTokens: 8192, // The maximum number of tokens to include in the response.
    googleSearchRetrieval: true, // Retrieve public web data for grounding, powered by Google Search.
    topK: 14, //The maximum number of tokens to consider when sampling.
    topP: 0.95, // Decides how many possible words to consider. A higher value means that the model looks at more possible words, even the less likely ones, which makes the generated text more diverse. The default value is 0.95.
    safetySettings: [ // Adjust how likely you are to see responses that could be harmful. Content is blocked based on the probability that it is harmful.
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      }
      , {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      }
      , {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      }
      , {
        category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      }
    ],
    // codeExecution: true,
    //contextCache: true, // Context caching allows you to save and reuse precomputed input tokens that you wish to use repeatedly.
    //thinkingConfig: {
    //   includeThoughts: true, // Indicates whether to include thoughts in the response.If true, thoughts are returned only when available.
    //   thinkingBudget: 2287 // The thinking budget parameter gives the model guidance on the number of thinking tokens it can use when generating a response. A greater number of tokens is typically associated with more detailed thinking, which is needed for solving more complex tasks. Setting the thinking budget to 0 disables thinking.
    // },
    // functionCallingConfig: { // Controls how the model uses the provided tools (function declarations). With AUTO (Default) mode, the model decides whether to generate a natural language response or suggest a function call based on the prompt and context. With ANY, the model is constrained to always predict a function call and guarantee function schema adherence. With NONE, the model is prohibited from making function calls.
    //   mode: 'AUTO'
    // }

  },
  tools: [],
  docs: [],
  context: {

  },
  description: `Generates a specific section of a project report based on the provided project context and guidelines.`,
  maxTurns: 1,
  messages: [],
  use: [],
});


export async function generateReportSection(input: GenerateSectionInput): Promise<GenerateSectionOutput> {
  const { sectionToGenerate } = input;
  const agentId = `generate-${sectionToGenerate}-section`;

  const agent = await getAgent(agentId);
  if (!agent) {
    console.error(`Agent configuration not found for ID: '${agentId}'`);
    throw new Error(`Configuration for the report section '${sectionToGenerate}' is missing or invalid.`);
  }

  // It's safer to validate the prompt structure, but we trust the data from `getAgent` for now.
  // A more robust implementation might use a Zod schema to parse `agent.prompt`.
  const agentPrompt = agent.prompt as AgentPrompt;
  const systemPrompt = agentPrompt.base;

  const promptVariables = {
    ...input,
    systemPrompt,
    stringifiedProposal: input.proposal ? JSON.stringify(input.proposal, null, 2) : '',
    stringifiedPlan: input.projectPlan ? JSON.stringify(input.projectPlan, null, 2) : '',
  };

  const { output } = await reportSectionPrompt(
    promptVariables,
    { model: agent.model || 'googleai/gemini-1.5-flash' }
  );

  if (!output) {
    console.error(`AI failed to generate content for section: ${sectionToGenerate}`);
    throw new Error(`The AI failed to generate a response for the '${sectionToGenerate}' section. Please try again.`);
  }

  return output;
}
