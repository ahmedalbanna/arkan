

'use server';

/**
 * @fileOverview AI agents for text manipulation: rewriting and summarizing.
 */

import { ai } from '@/ai/genkit';
import { rewriteTextPrompt, styleInstructions, summarizeTextWithRatioPrompt } from '@/ai/prompts/text-stylist';
import {
  type RewriteTextInput,
  type RewriteTextOutput,
  type SummarizeTextWithRatioInput,
  type SummarizeTextWithRatioOutput
} from '@/ai/schemas';


export async function rewriteText(input: RewriteTextInput): Promise<RewriteTextOutput> {

  const instruction = styleInstructions[input.style] || "Rewrite the text as requested.";

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: rewriteTextPrompt.replace('{{instruction}}', instruction).replace('{{text}}', input.text),
    config: {
      temperature: 0.7,
    }
  });

  const rewrittenText = llmResponse.text.replace(/---/g, '').trim();

  if (!rewrittenText) {
    throw new Error("Failed to rewrite text.");
  }

  return { rewrittenText };
}


// --- Summarize Text with Ratio Flow ---
export async function summarizeTextWithRatio(input: SummarizeTextWithRatioInput): Promise<SummarizeTextWithRatioOutput> {
  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    prompt: summarizeTextWithRatioPrompt.replace('{{ratio}}', input.ratio.toString()).replace('{{text}}', input.text),
    config: {
      temperature: 0.5,
    }
  });

  const summarizedText = llmResponse.text.replace(/---/g, '').trim();

  if (!summarizedText) {
    throw new Error("Failed to summarize text.");
  }

  return { summarizedText };
}
