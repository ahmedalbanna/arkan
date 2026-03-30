
'use server';

/**
 * @fileOverview An AI agent for analyzing a set of context files based on a user prompt
 * and generating a structured JSON output with a dynamic schema.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { AnalyzeContextInputSchema, AnalyzeContextOutputSchema, type AnalyzeContextInput, type AnalyzeContextOutput } from '@/modules/ai/domain/schemas';
import { z } from 'zod';

const analysisPrompt = ai.definePrompt({
    name: 'analyzeContextPrompt',
    input: {
        schema: z.object({
            prompt: z.string(),
            textFiles: z.any(),
            mediaFiles: z.any(),
        })
    },
    output: { schema: AnalyzeContextOutputSchema },

    prompt: `You are an expert data analyst and schema designer. Your task is to analyze a user's prompt and a set of context files, then generate a structured JSON object with a corresponding Zod schema.

**Your Two-Step Process:**

1.  **Design the Schema**:
    *   First, carefully read the user's prompt to understand exactly what information they want to extract or analyze.
    *   Based on their request, design a Zod schema that perfectly structures this information. The schema should be a \`z.object(...)\` with appropriately typed fields (e.g., \`z.string()\`, \`z.number()\`, \`z.array(...)\`).
    *   Provide this Zod schema as a single string in the \`schema\` field of your response.

2.  **Extract and Structure the Data**:
    *   Next, thoroughly analyze all the provided context files (both text and media). Each file is tagged with a 'type' (e.g., 'context', 'example', 'question', 'textbook') which tells you how to use it.
    *   Use files tagged as **'example'** as a reference for writing style, tone, and structure.
    *   Use files tagged as **'context'**, **'question'**, or **'textbook'** for factual data and information.
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
{{#each textFiles}}
--- File: {{this.fileName}} (Type: {{this.type}}) ---
{{{this.content}}}
---
{{/each}}
{{#each mediaFiles}}
--- File: {{this.fileName}} (Type: {{this.type}}) ---
{{media url=this.content}}
---
{{/each}}
---

**CRITICAL INSTRUCTIONS:**
-   Your entire output MUST be a single, valid JSON object that conforms to the \`AnalyzeContextOutputSchema\`.
-   The Zod schema you generate for the \`schema\` field must be a valid, executable Zod schema string.
-   The object you create for the \`data\` field must validate against the schema you designed.
`,
});

const analyzeContextFlow = ai.defineFlow({
    name: 'analyzeContextFlow',
    inputSchema: AnalyzeContextInputSchema,
    outputSchema: AnalyzeContextOutputSchema,
}, async (input: AnalyzeContextInput) => {
    const { prompt, contextFiles } = input;
    // Separate media from text files
    const textFiles = contextFiles.filter((f: any) => !f.content.startsWith('data:'));
    const mediaFiles = contextFiles.filter((f: any) => f.content.startsWith('data:'));

    const { output } = await analysisPrompt({ prompt, textFiles, mediaFiles });
    if (!output) {
        throw new Error('Context analysis failed to produce an output.');
    }
    return output;
});

export async function analyzeContext(input: AnalyzeContextInput): Promise<AnalyzeContextOutput> {
    const validation = AnalyzeContextInputSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(`Invalid input for analyzeContext: ${validation.error.message}`);
    }
    return analyzeContextFlow(validation.data);
}
