
'use server';

/**
 * @fileOverview An AI agent for checking text for potential plagiarism.
 */

import { ai, OLLAMA_MODELS } from '@/modules/ai/infrastructure/services/Genkit';
import { PlagiarismCheckInputSchema, PlagiarismCheckOutputSchema, type PlagiarismCheckInput, type PlagiarismCheckOutput } from '@/modules/ai/domain/schemas';

const plagiarismCheckPrompt = ai.definePrompt({
  name: 'plagiarismCheckPrompt',
  input: { schema: PlagiarismCheckInputSchema },
  // No output schema - model returns plain JSON text
  model: OLLAMA_MODELS.PHI3_MINI,
  config: {
    temperature: 0.3,
  },

  prompt: `You are an advanced plagiarism detection engine. Your task is to analyze the following text for originality and find real web sources for any matching content.

Output ONLY valid JSON in this format:
{
  "matches": [{"source": "https://...", "title": "...", "summary": "...", "similarity": 0-100}],
  "originalityScore": 0-100
}

Do NOT include any explanations or additional text outside the JSON.

**Your Process:**
1.  **Analyze Content:** Carefully read the text and identify phrases, sentences, and ideas that may not be original.
2.  **Find Real Sources:** For each identified part, search the web to find the most likely original source. The source MUST be a real, accessible URL.
3.  **Extract Details**: For each source, extract the **webpage title** and write a **brief summary** of the content that matches the user's text.
4.  **Estimate Similarity:** Provide a similarity percentage for each potential match.
5.  **Calculate Originality Score:** Based on your findings, provide an overall originality score from 0 to 100, where 100 means completely original and 0 means it's entirely copied.

**CRITICAL INSTRUCTION:** The 'source' field for each match must be a full, valid, and real URL (e.g., https://www.example.com/article).

**Text to Analyze:**
---
{{{text}}}
---`,
});

const plagiarismCheckFlow = ai.defineFlow({
  name: 'plagiarismCheckFlow',
  inputSchema: PlagiarismCheckInputSchema,
  outputSchema: PlagiarismCheckOutputSchema,
}, async (input: PlagiarismCheckInput) => {
  try {
    const result = await plagiarismCheckPrompt(input);
    
    if (!result) {
      throw new Error('No output received from the model.');
    }

    // Parse the JSON response
    let output: PlagiarismCheckOutput;
    try {
      const jsonText = result.text || result.output || '';
      output = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Plagiarism Check JSON:', parseError);
      throw new Error('Plagiarism Check returned invalid JSON');
    }

    // Validate the parsed output
    const validation = PlagiarismCheckOutputSchema.safeParse(output);
    if (!validation.success) {
      console.error('Plagiarism Check output validation failed:', validation.error);
      throw new Error('Plagiarism Check output does not match expected structure');
    }

    return validation.data;
  } catch (error) {
    console.error('Error in plagiarismCheckFlow:', error);
    throw new Error(`plagiarismCheck failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

export async function plagiarismCheck(input: PlagiarismCheckInput): Promise<PlagiarismCheckOutput> {
  const validation = PlagiarismCheckInputSchema.safeParse(input);
  if (!validation.success) {
    throw new Error(`Invalid input for plagiarismCheck: ${validation.error.message}`);
  }
  return plagiarismCheckFlow(validation.data);
}
