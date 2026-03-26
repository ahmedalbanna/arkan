
'use server';

/**
 * @fileOverview An AI agent for checking grammar and providing explanations.
 */

import { ai } from '@/modules/ai/infrastructure/services/Genkit';
import { GrammarCheckInputSchema, GrammarCheckOutputSchema, type GrammarCheckInput, type GrammarCheckOutput } from '@/modules/ai/domain/schemas';

const grammarCheckPrompt = ai.definePrompt({
  name: 'grammarCheckPrompt',
  input: { schema: GrammarCheckInputSchema },
  output: { schema: GrammarCheckOutputSchema },
  model: 'ollama/phi3:mini-4k',
  prompt: `You are an expert English grammar, spelling, and punctuation checker. Your task is to analyze the following text, correct any errors, and provide a clear explanation for each correction.

**Instructions:**
1. Read the original text and identify ALL errors in three categories:
   - **Grammar errors**: Subject-verb agreement, verb tense consistency, pronoun usage, sentence structure, word order, articles (a/an/the), prepositions, etc.
   - **Spelling mistakes**: Misspelled words, typos, incorrect word forms (e.g., "there" vs "their"), homophones used incorrectly
   - **Punctuation issues**: Missing or incorrect commas, periods, semicolons, colons, apostrophes, quotation marks, hyphens, dashes, etc.

2. Create a fully corrected version of the text in the \`correctedText\` field. You MUST preserve the original markdown formatting (headings, lists, bold text, links, code blocks, etc.) exactly as it appears.

3. For each individual correction you make, create an object in the \`corrections\` array with:
   - \`original\`: The exact incorrect text snippet (word, phrase, or punctuation)
   - \`corrected\`: The corrected version
   - \`explanation\`: A brief, clear explanation of why the correction was made (mention the specific rule if applicable)
   - \`type\`: One of "grammar", "spelling", or "punctuation" - categorize each correction accurately

4. Include a \`statistics\` object with counts:
   - \`total\`: Total number of corrections
   - \`grammar\`: Number of grammar corrections
   - \`spelling\`: Number of spelling corrections
   - \`punctuation\`: Number of punctuation corrections

**Important Guidelines:**
- Be thorough but don't over-correct. Only fix actual errors, not stylistic choices.
- For spelling: Check both individual words and context (e.g., "affect" vs "effect", "its" vs "it's")
- For punctuation: Ensure proper comma usage, apostrophes for possessives/contractions, quotation marks, etc.
- For grammar: Focus on correctness, not style preferences
- Preserve the author's voice and writing style - only fix errors, don't rewrite
- If no errors are found, return an empty corrections array and statistics with all zeros

**Original Text:**
---
{{{text}}}
---
`,
  config: {
    temperature: 0.1, // Very low temp for accuracy
  }
});

const grammarCheckFlow = ai.defineFlow({
  name: 'grammarCheckFlow',
  inputSchema: GrammarCheckInputSchema,
  outputSchema: GrammarCheckOutputSchema,
}, async (input) => {
  const { output } = await grammarCheckPrompt(input);
  if (!output) {
    throw new Error("Grammar check failed.");
  }

  // Calculate statistics if not provided by the model
  if (!output.statistics && output.corrections) {
    const stats = {
      total: output.corrections.length,
      grammar: output.corrections.filter(c => c.type === 'grammar').length,
      spelling: output.corrections.filter(c => c.type === 'spelling').length,
      punctuation: output.corrections.filter(c => c.type === 'punctuation').length,
    };
    return { ...output, statistics: stats };
  }

  return output;
});

export async function grammarCheck(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
  const validation = GrammarCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for grammarCheck: ${validation.error.message}`);
  }
  return grammarCheckFlow(validation.data);
}
