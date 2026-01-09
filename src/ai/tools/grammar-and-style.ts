

/**
 * @fileOverview Grammar and Style Tools for Professional Writing
 *
 * These tools provide advanced grammar checking, tone analysis, readability
 * assessment, and word choice improvement capabilities using AI.
 */

import { getModel } from '@/ai/genkit';
import type { Genkit } from 'genkit';
import {
  AnalyzeToneToolInputSchema,
  AnalyzeToneToolOutputSchema,
  CheckGrammarToolInputSchema,
  CheckGrammarToolOutputSchema,
  CheckReadabilityToolInputSchema,
  CheckReadabilityToolOutputSchema,
  ImproveWordChoiceToolInputSchema,
  ImproveWordChoiceToolOutputSchema,
  type AnalyzeToneToolInput,
  type AnalyzeToneToolOutput,
  type CheckGrammarToolInput,
  type CheckGrammarToolOutput,
  type CheckReadabilityToolInput,
  type CheckReadabilityToolOutput,
  type ImproveWordChoiceToolInput,
  type ImproveWordChoiceToolOutput,
} from './schemas';
import { z } from 'zod';

/**
 * Factory function to create grammar and style tools
 * @param ai - The Genkit AI instance
 * @returns Object containing all grammar and style tools
 */
export function createGrammarAndStyleTools(ai: Genkit) {
  /**
   * Grammar Checker Tool
   * Analyzes text for grammar, spelling, punctuation, and capitalization issues.
   */
  const checkGrammarTool = ai.defineTool(
  {
    name: 'checkGrammar',
    description: 'Analyzes text for grammar, spelling, punctuation, and capitalization errors. Returns detailed issues with suggestions for correction.',
    inputSchema: CheckGrammarToolInputSchema,
    outputSchema: CheckGrammarToolOutputSchema,
  },
  async (input: CheckGrammarToolInput): Promise<CheckGrammarToolOutput> => {
    // Use AI to analyze grammar
    const prompt = ai.definePrompt({
      name: 'grammarCheckerPrompt',
      input: { schema: CheckGrammarToolInputSchema },
      output: { schema: CheckGrammarToolOutputSchema },
      model: await getModel('balanced'),
      prompt: `You are an expert grammar checker. Analyze the following text for grammar, spelling, punctuation, and capitalization errors.

For each issue found, provide:
- The type of issue (grammar/spelling/punctuation/capitalization)
- A clear message explaining the problem
- The context (the sentence or phrase containing the error)
- Suggestions for correction
- Severity (error/warning/info)
- Position in the text (character start and end indices if possible)

Text to analyze:
{{text}}

Language: {{language}}

Provide a comprehensive analysis with all issues found.`,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to check grammar');
    }

    return output;
  }
);

  /**
   * Tone Analyzer Tool
   * Analyzes the tone of text and provides suggestions for improvement.
   */
  const analyzeToneTool = ai.defineTool(
  {
    name: 'analyzeTone',
    description: 'Analyzes the tone of text (professional, casual, academic, persuasive, neutral) and provides suggestions for achieving the target tone.',
    inputSchema: AnalyzeToneToolInputSchema,
    outputSchema: AnalyzeToneToolOutputSchema,
  },
  async (input: AnalyzeToneToolInput): Promise<AnalyzeToneToolOutput> => {
    const prompt = ai.definePrompt({
      name: 'toneAnalyzerPrompt',
      input: { schema: AnalyzeToneToolInputSchema },
      output: { schema: AnalyzeToneToolOutputSchema },
      model: await getModel('balanced'),
      prompt: `You are an expert in analyzing writing tone. Analyze the tone of the following text.

Text to analyze:
{{text}}

{{#if targetTone}}
Target tone: {{targetTone}}

Analyze whether the text matches the target tone and provide specific suggestions for improvement.
{{/if}}

Provide:
1. The detected tone (e.g., "professional with friendly undertones")
2. Confidence level (0.0 to 1.0)
3. Key tone attributes (e.g., ["formal", "respectful", "clear"])
4. Suggestions for improvement (if targetTone is specified)
5. Whether it matches the target tone (if specified)`,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to analyze tone');
    }

    return output;
  }
);

  /**
   * Readability Checker Tool
   * Calculates readability scores and provides improvement suggestions.
   */
  const checkReadabilityTool = ai.defineTool(
  {
    name: 'checkReadability',
    description: 'Calculates readability metrics (Flesch Reading Ease, Flesch-Kincaid Grade Level) and provides suggestions to improve readability.',
    inputSchema: CheckReadabilityToolInputSchema,
    outputSchema: CheckReadabilityToolOutputSchema,
  },
  async (input: CheckReadabilityToolInput): Promise<CheckReadabilityToolOutput> => {
    const prompt = ai.definePrompt({
      name: 'readabilityCheckerPrompt',
      input: { schema: CheckReadabilityToolInputSchema },
      output: { schema: CheckReadabilityToolOutputSchema },
      model: await getModel('balanced'),
      prompt: `You are an expert in readability analysis. Analyze the following text and calculate readability metrics.

Text to analyze:
{{text}}

Provide:
1. Flesch Reading Ease score (0-100, higher is easier)
2. Flesch-Kincaid Grade Level
3. Average sentence length
4. Average word length
5. Number of complex words (3+ syllables)
6. Readability level classification (very_easy, easy, fairly_easy, standard, fairly_difficult, difficult, very_difficult)
7. Specific suggestions to improve readability

Use standard readability formulas for calculation.`,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to check readability');
    }

    return output;
  }
);

  /**
   * Word Choice Improvement Tool
   * Suggests better word choices to improve writing style.
   */
  const improveWordChoiceTool = ai.defineTool(
  {
    name: 'improveWordChoice',
    description: 'Analyzes text and suggests better word choices based on the desired style (concise, formal, vivid, simple).',
    inputSchema: ImproveWordChoiceToolInputSchema,
    outputSchema: ImproveWordChoiceToolOutputSchema,
  },
  async (input: ImproveWordChoiceToolInput): Promise<ImproveWordChoiceToolOutput> => {
    const styleInstructions = {
      concise: 'Replace wordy phrases with concise alternatives. Eliminate redundancy.',
      formal: 'Replace casual or colloquial words with formal, professional alternatives.',
      vivid: 'Replace bland or generic words with more vivid, descriptive alternatives.',
      simple: 'Replace complex or jargon-heavy words with simpler, more accessible alternatives.',
    };

    const prompt = ai.definePrompt({
      name: 'wordChoiceImprovementPrompt',
      input: { schema: ImproveWordChoiceToolInputSchema },
      output: { schema: ImproveWordChoiceToolOutputSchema },
      model: await getModel('balanced'),
      prompt: `You are an expert editor specializing in word choice improvement. Analyze the following text and suggest better word choices.

Text to analyze:
{{text}}

Style: {{style}}
Instructions: ${styleInstructions[input.style]}

For each improvement suggestion, provide:
- The original word or phrase
- A better suggestion
- The reason for the change
- The position in the text (character start and end indices)

Focus on impactful changes that significantly improve the writing quality.`,
    });

    const { output } = await prompt(input);

    if (!output) {
      throw new Error('Failed to improve word choice');
    }

    return output;
  }
);

  // Return all tools
  return {
    checkGrammar: checkGrammarTool,
    analyzeTone: analyzeToneTool,
    checkReadability: checkReadabilityTool,
    improveWordChoice: improveWordChoiceTool,
  };
}

// Export individual tools for backward compatibility
export let checkGrammarTool: ReturnType<typeof createGrammarAndStyleTools>['checkGrammar'];
export let analyzeToneTool: ReturnType<typeof createGrammarAndStyleTools>['analyzeTone'];
export let checkReadabilityTool: ReturnType<typeof createGrammarAndStyleTools>['checkReadability'];
export let improveWordChoiceTool: ReturnType<typeof createGrammarAndStyleTools>['improveWordChoice'];
export let grammarAndStyleTools: ReturnType<typeof createGrammarAndStyleTools>;
