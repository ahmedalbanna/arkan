
'use server';

/**
 * @fileOverview An AI agent for checking grammar and providing explanations.
 */

import { ai } from '@/ai/genkit';
import { getJsonPromptInstructions } from '@/ai/utils/json-output-validator';
import { GrammarCheckInputSchema, GrammarCheckOutputSchema, type GrammarCheckInput, type GrammarCheckOutput } from '@/ai/schemas';

const grammarCheckPrompt = ai.definePrompt({
  name: 'grammarCheckPrompt',
  input: { schema: GrammarCheckInputSchema },
  // No output schema - model returns plain JSON text
  model: 'ollama/gemma:2b',
  config: {
    // responseSchema removed
    temperature: 0.1, // Very low temp for accuracy
  },

  prompt: `You are an expert English grammar, spelling, and punctuation checker. Your task is to analyze the following text, correct any errors, and provide a clear explanation for each correction.

${getJsonPromptInstructions(`{
  "correctedText": "The fully corrected text with preserved markdown",
  "corrections": [
    {
      "original": "incorrect text",
      "corrected": "correct text",
      "explanation": "Why this was corrected",
      "type": "grammar" | "spelling" | "punctuation"
    }
  ],
  "statistics": {
    "total": 5,
    "grammar": 2,
    "spelling": 2,
    "punctuation": 1
  }
}`)}

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

**JSON Output:**`,
});

const grammarCheckFlow = ai.defineFlow({
  name: 'grammarCheckFlow',
  inputSchema: GrammarCheckInputSchema,
  outputSchema: GrammarCheckOutputSchema,
}, async (input) => {
  try {
    const result = await grammarCheckPrompt(input);
    
    if (!result) {
      throw new Error("No output received from the model.");
    }

    let output: GrammarCheckOutput;
    try {
      const jsonText = result.text || result.output || '';
      output = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Grammar Check JSON:', parseError);
      throw new Error('Grammar Check returned invalid JSON');
    }

    const validation = GrammarCheckOutputSchema.safeParse(output);
    if (!validation.success) {
      console.error('Grammar Check output validation failed:', validation.error);
      throw new Error('Grammar Check output does not match expected structure');
    }

    const validatedResult = validation.data;

    // Calculate statistics if not provided by the model
    if (!validatedResult.statistics && validatedResult.corrections) {
      const stats = {
        total: validatedResult.corrections.length,
        grammar: validatedResult.corrections.filter(c => c.type === 'grammar').length,
        spelling: validatedResult.corrections.filter(c => c.type === 'spelling').length,
        punctuation: validatedResult.corrections.filter(c => c.type === 'punctuation').length,
      };
      return { ...validatedResult, statistics: stats };
    }

    return validatedResult;
  } catch (error) {
    console.error('Error in grammarCheckFlow:', error);
    throw new Error(`Grammar check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export async function grammarCheck(input: GrammarCheckInput): Promise<GrammarCheckOutput> {
  const validation = GrammarCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for grammarCheck: ${validation.error.message}`);
  }
  return grammarCheckFlow(validation.data);
}
