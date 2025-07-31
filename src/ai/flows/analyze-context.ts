
'use server';

/**
 * @fileOverview An AI agent for analyzing a set of context files based on a user prompt
 * and generating a structured JSON output with a dynamic schema.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { ExternalContext } from '@/hooks/useReportStore';

// Input schema for the context analysis flow
const AnalyzeContextInputSchema = z.object({
  prompt: z.string().describe("The user's question or instruction for what to extract or analyze from the context files."),
  contextFiles: z.array(z.object({
    fileName: z.string(),
    content: z.string(),
    type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
  })).describe("An array of context files (text, images, PDFs as data URIs) to be analyzed."),
});
export type AnalyzeContextInput = z.infer<typeof AnalyzeContextInputSchema>;

// Output schema for the context analysis flow
const AnalyzeContextOutputSchema = z.object({
  schema: z.string().describe("A Zod schema string that defines the structure of the output data. This schema should be dynamically generated based on the user's prompt."),
  data: z.any().describe("The structured data, conforming to the generated schema, extracted and synthesized from the context files based on the user's prompt."),
});
export type AnalyzeContextOutput = z.infer<typeof AnalyzeContextOutputSchema>;

export async function analyzeContext(input: AnalyzeContextInput): Promise<AnalyzeContextOutput> {
  const { prompt, contextFiles } = input;

  const analysisPrompt = ai.definePrompt({
    name: 'analyzeContextPrompt',
    input: { schema: AnalyzeContextInputSchema },
    output: { schema: AnalyzeContextOutputSchema },
    prompt: `You are an expert data analyst and schema designer. Your task is to analyze a user's prompt and a set of context files, then generate a structured JSON object with a corresponding Zod schema.

**Your Two-Step Process:**

1.  **Design the Schema**:
    *   First, carefully read the user's prompt to understand exactly what information they want to extract or analyze.
    *   Based on their request, design a Zod schema that perfectly structures this information. The schema should be a \`z.object(...)\` with appropriately typed fields (e.g., \`z.string()\`, \`z.number()\`, \`z.array(...)\`).
    *   Provide this Zod schema as a single string in the \`schema\` field of your response.

2.  **Extract and Structure the Data**:
    *   Next, thoroughly analyze all the provided context files.
    *   Extract the relevant pieces of information that match the user's prompt.
    *   Populate a JSON object with this extracted data, ensuring it **strictly conforms** to the Zod schema you just designed.
    *   Place this JSON object in the \`data\` field of your response.

---

**USER PROMPT:**
\`\`\`
{{{prompt}}}
\`\`\`

---

**CONTEXT FILES TO ANALYZE:**
{{#each contextFiles}}
--- File: {{this.fileName}} (Type: {{this.type}}) ---
{{#if (contains this.content "data:")}}
{{media url=this.content}}
{{else}}
{{{this.content}}}
{{/if}}
---
{{/each}}

---

**CRITICAL INSTRUCTIONS:**
-   Your entire output MUST be a single, valid JSON object that conforms to the \`AnalyzeContextOutputSchema\`.
-   The Zod schema you generate for the \`schema\` field must be a valid, executable Zod schema string.
-   The object you create for the \`data\` field must validate against the schema you designed.
`,
  });

  const { output } = await analysisPrompt({ prompt, contextFiles });
  return output!;
}
