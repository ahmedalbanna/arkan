
'use server';

/**
 * @fileOverview An AI agent for evaluating the current project state and determining the optimal
 * context and settings for generating subsequent report sections.
 * - evaluateAndSelectContext
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ProjectProposalSchema, DiagramTypeSchema, SectionNameSchema, type SectionName, ProjectPlanSchema } from '@/ai/schemas';
import { AGENTS, type AgentPrompt } from '@/lib/agents';

// Define the input schema for the context evaluation flow
const EvaluateContextInputSchema = z.object({
  proposal: ProjectProposalSchema.optional().describe("The original project proposal."),
  projectPlan: ProjectPlanSchema.optional().nullable().describe("The detailed project plan with phases and tasks."),
  existingSections: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => SectionNameSchema.safeParse(key).success);
  }, "All keys must be a valid SectionName").optional().describe("A map of previously generated text sections."),
  existingDiagrams: z.object({}).passthrough().refine(obj => {
    return Object.keys(obj).every(key => DiagramTypeSchema.safeParse(key).success);
  }, "All keys must be a valid DiagramType").optional().describe("A map of previously generated PlantUML diagrams."),
  sectionsToGenerate: z.array(SectionNameSchema).describe("A list of the target sections that need to be generated."),
  externalContextContent: z.string().optional().describe("Content from an external document (e.g., a PDF of a similar report) to use as a style and content guide."),
});
export type EvaluateContextInput = z.infer<typeof EvaluateContextInputSchema>;


// Define the output schema for a single section's recommended settings
const SectionGenerationConfigSchema = z.object({
  section: SectionNameSchema.describe("The target section to generate."),
  context: z.object({
    sections: z.array(SectionNameSchema).optional().describe("The keys of existing sections that are most relevant as context."),
    diagrams: z.array(DiagramTypeSchema).optional().describe("The keys of existing diagrams that are most relevant as context."),
  }).describe("The recommended context to use for generating this section."),
  guidelines: z.array(z.string()).describe("A list of the most relevant guidelines to follow. Can include existing guidelines or new ones."),
  instructions: z.object({
    tone: z.enum(['professional', 'academic', 'casual', 'persuasive', 'none']).describe("The recommended tone for the section."),
    formality: z.enum(['informal', 'balanced', 'very formal']).describe("The recommended formality level."),
  }).describe("Recommended instructions for tone and formality."),
});

// Define the final output schema for the entire flow
const EvaluateContextOutputSchema = z.object({
  configs: z.array(SectionGenerationConfigSchema).describe("An array of optimized configurations for each section to be generated."),
});
export type EvaluateContextOutput = z.infer<typeof EvaluateContextOutputSchema>;


// Helper function to get agent details (prompt, guidelines)
const getAgentDetails = (sectionKey: SectionName) => {
    const agent = AGENTS.find(a => a.id === `generate-${sectionKey}-section`);
    if (!agent) return null;
    const prompt = agent.prompt as AgentPrompt;
    return {
        basePrompt: prompt.base,
        availableGuidelines: prompt.guidelines?.map(g => g.text) || [],
    };
};


export async function evaluateAndSelectContext(input: EvaluateContextInput): Promise<EvaluateContextOutput> {

  const { proposal, existingSections, existingDiagrams, sectionsToGenerate } = input;

  // Create a detailed context string with all available agent prompts and guidelines
  const agentDetailsContext = sectionsToGenerate.map(sectionKey => {
      const details = getAgentDetails(sectionKey);
      if (!details) return ``;
      return `--- Agent for: ${sectionKey} ---\nBase Prompt: ${details.basePrompt}\nAvailable Guidelines:\n${details.availableGuidelines.map(g => `- ${g}`).join('\n')}\n`;
  }).join('\n');


  const prompt = ai.definePrompt({
    name: 'evaluateAndSelectContextPrompt',
    input: { schema: EvaluateContextInputSchema },
    output: { schema: EvaluateContextOutputSchema },
    prompt: `You are an expert project analyst and AI coordinator. Your task is to analyze a project's current state (proposal, project plan, existing sections, diagrams, and external context) and create an optimal generation plan for a list of target sections.

For each target section in the \`sectionsToGenerate\` list, you must determine the best configuration for its generation.

**Your Analysis Process:**

1.  **Review All Available Context:**
    *   Thoroughly examine the \`proposal\`.
    *   Analyze the \`projectPlan\` to understand the breakdown of tasks and phases.
    *   Read through all \`existingSections\` to understand what has already been written.
    *   Analyze any \`existingDiagrams\` to understand the system structure.
    *   **Crucially, review the \`externalContextContent\`. This content (e.g., from an uploaded similar report) should be treated as a primary example for style, tone, and structure.**

2.  **Consult Agent Capabilities:**
    *   For each target section, I will provide you with the AI agent's "Base Prompt" and its "Available Guidelines". Use this to understand what the agent is designed to do.

3.  **Determine Optimal Configuration for EACH Target Section:**
    *   **Context Selection**: From the list of \`existingSections\` and \`existingDiagrams\`, choose ONLY the most relevant items that will help the agent write its target section. The proposal, project plan, and external context are always available, so you only need to select which *other* generated items are relevant. Less is more; only select context that is directly useful.
    *   **Guideline Selection**: From the "Available Guidelines" for that agent, select the ones that are most appropriate given the project proposal. You can also CREATE NEW, specific guidelines if you believe they will improve the output.
    *   **Instruction Selection**: Choose the best \`tone\` and \`formality\` for the section based on the project's nature and the style of the external context.

**CRITICAL INSTRUCTIONS:**
- Your final output must be a JSON object that strictly adheres to the provided schema.
- For each section in the input \`sectionsToGenerate\` array, you must provide a corresponding configuration object in the output \`configs\` array.

--- AVAILABLE PROJECT DATA ---

**Project Proposal:**
{{#if proposal}}
\`\`\`json
${JSON.stringify(proposal, null, 2)}
\`\`\`
{{else}}
(No project proposal has been generated yet)
{{/if}}


**Project Plan:**
{{#if projectPlan}}
\`\`\`json
${JSON.stringify(input.projectPlan, null, 2)}
\`\`\`
{{else}}
(No project plan has been generated yet)
{{/if}}

**Existing Report Sections:**
{{#if existingSections}}
{{#each existingSections}}
--- Section: {{@key}} ---
{{{this}}}
---
{{/each}}
{{else}}
(No sections have been generated yet)
{{/if}}

**Existing Diagrams (PlantUML):**
{{#if existingDiagrams}}
{{#each otherDiagrams}}
--- Diagram: {{@key}} ---
{{{this}}}
---
{{/each}}
{{else}}
(No diagrams have been generated yet)
{{/if}}

**External Context / Examples:**
{{#if externalContextContent}}
{{{externalContextContent}}}
{{else}}
(No external context provided.)
{{/if}}


--- AGENT CAPABILITIES FOR REFERENCE ---
${agentDetailsContext}
---
`,
  });

  const { output } = await prompt(input);
  return output!;
}
