import z from "zod";

export const GenerateSectionInputSchema = z
  .object({
    sectionToGenerate: z.string(),
    prompt: z.string().min(10, 'Prompt must be at least 10 characters.'),
    otherSections: z
      .record(z.string(), z.string())
      .optional()
      .describe(
        "A map of previously generated text sections and other textual context (like the proposal or plan). The key is the item's name and the value is the markdown/JSON content.",
      ),
    instructionText: z.string().optional().describe('A dynamically generated instruction string based on UI controls.'),
  })
  .merge(z.object({
    externalContext: z.array(z.object({
      fileName: z.string().min(1),
      content: z.string().min(1),
      type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
    })).optional().describe('An array of external documents (text or data URIs) provided by the user.'),
  }))
  .merge(z
    .object({
      guidelines: z.array(z.string()).optional().describe('A list of specific guidelines for the agent to follow.'),
      instructionText: z
        .string()
        .optional()
        .describe('Additional instructions for generation (e.g., tone, formality).'),
      targetAudience: z.enum([
        'general-public',
        'non-technical-users',
        'students',
        'academics',
        'professionals',
        'stakeholders',
        'investors',
        'vcs',
        'executives',
        'developers',
        'qa-engineers',
        'designers',
        'marketers',
        'sales',
        'customer-support',
        'product-managers',
        'project-managers',
        'healthcare-professionals',
      ]).optional().describe('The intended audience for the content.'),
      tone: z.enum([
        'professional',
        'formal',
        'neutral',
        'friendly',
        'casual',
        'persuasive',
        'informative',
        'confident',
        'empathetic',
        'enthusiastic',
        'authoritative',
        'approachable',
        'analytical',
        'conversational',
      ]).optional().describe('Desired tone (e.g., professional, casual, persuasive).'),
    }));

export type GenerateSectionInput = z.infer<typeof GenerateSectionInputSchema>;

export const GenerateSectionOutputSchema = z.object({
  sectionName: z.string().describe("The name of the section that was generated. This must match the 'sectionToGenerate' from the input."),
  content: z.string().describe("The generated markdown content for the specified section."),
});
export type GenerateSectionOutput = z.infer<typeof GenerateSectionOutputSchema>;