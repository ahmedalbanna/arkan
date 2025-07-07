'use server';

/**
 * @fileOverview An AI agent for validating and fixing markdown syntax.
 * - validateAndFixMarkdown
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ValidateMarkdownInputSchema = z.object({
  markdown: z.string().describe('The markdown text to validate and fix.'),
});

const ValidateMarkdownOutputSchema = z.object({
  correctedMarkdown: z.string().describe('The corrected markdown text.'),
});

// Wrapper function for easy use in other server components
export async function validateAndFixMarkdown(markdown: string): Promise<string> {
    if (!markdown || markdown.trim() === '') {
        return markdown;
    }
    const result = await validateAndFixMarkdownFlow({ markdown });
    return result.correctedMarkdown;
}

const validateAndFixMarkdownFlow = ai.defineFlow(
  {
    name: 'validateAndFixMarkdownFlow',
    inputSchema: ValidateMarkdownInputSchema,
    outputSchema: ValidateMarkdownOutputSchema,
  },
  async ({ markdown }) => {
    const prompt = ai.definePrompt({
      name: 'validateMarkdownPrompt',
      input: {schema: ValidateMarkdownInputSchema},
      output: {schema: ValidateMarkdownOutputSchema},
      prompt: `You are an expert in markdown syntax. The following text is supposed to be well-formed markdown, but may contain errors. Please correct any syntax errors, such as unclosed tags, incorrect list indentation, or improper heading levels. Do not change the content or meaning of the text. Only return the corrected markdown text.

---
{{{markdown}}}
---
`,
    });

    const {output} = await prompt({ markdown });
    return output!;
  }
);
