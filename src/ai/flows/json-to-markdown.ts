
'use server';

/**
 * @fileOverview An AI agent for converting a JSON object into a readable Markdown report.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const inputSchema = z.object({
    jsonData: z.any().describe('The JSON object to be converted into a Markdown report.'),
});

const outputSchema = z.object({
    markdown: z.string().describe('The generated Markdown report from the JSON data.'),
});

export async function jsonToMarkdown(input: z.infer<typeof inputSchema>): Promise<z.infer<typeof outputSchema>> {
    const prompt = ai.definePrompt({
        name: 'jsonToMarkdownPrompt',
        input: { schema: inputSchema },
        output: { schema: outputSchema },
        model: 'googleai/gemini-1.5-flash',
        prompt: `You are an expert data analyst and report writer. Your task is to take a structured JSON object and convert it into a clean, well-formatted, and human-readable Markdown report.

**Your Process:**
1.  **Understand the Structure:** Analyze the JSON structure to understand the hierarchy and relationships of the data.
2.  **Create Logical Headings:** Use Markdown headings (\`#\`, \`##\`, etc.) to create a logical structure for the report based on the JSON keys.
3.  **Format Data Clearly:**
    *   Use lists (bulleted or numbered) for arrays.
    *   Use tables for structured objects within an array to present data clearly.
    *   Use bold text for keys or important labels.
    *   Present the information in a narrative and easy-to-read format.
4.  **Return Only Markdown:** Your entire response must be only the complete Markdown content. Do not include any extra commentary or explanations.

---
**JSON Data to Convert:**
\`\`\`json
${JSON.stringify(input.jsonData, null, 2)}
\`\`\`
---
`,
    });

    const { output } = await prompt(input);
    if (!output) {
        throw new Error('Failed to convert JSON to Markdown.');
    }
    return output;
}
