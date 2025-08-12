

'use server';

/**
 * @fileOverview AI agents for text manipulation: rewriting and summarizing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { DiffPart } from '@/lib/diff';

// --- Rewrite Text Flow ---

const RewriteTextInputSchema = z.object({
  text: z.string().describe('The text to be rewritten.'),
  style: z.string().describe('The target style for the rewritten text (e.g., Formal, Creative, Simple).'),
});
export type RewriteTextInput = z.infer<typeof RewriteTextInputSchema>;


const RewriteTextOutputSchema = z.object({
  rewrittenText: z.string().describe('The text rewritten in the specified style.'),
});
export type RewriteTextOutput = z.infer<typeof RewriteTextOutputSchema>;


const styleInstructions: Record<string, string> = {
    'Informal': 'Use a casual, conversational tone. Employ contractions (e.g., "don\'t", "it\'s") and simpler vocabulary. The goal is to make the text feel like a friendly chat.',
    'Friendly': 'Adopt a warm, approachable, and personable tone. Use positive language and address the reader directly where appropriate. The text should feel welcoming.',
    'Simple': 'Rewrite the text using straightforward language and simple sentence structures. Avoid jargon and complex concepts. The primary goal is maximum clarity and ease of understanding for a broad audience.',
    'Formal': 'Use a professional, objective, and respectful tone. Avoid contractions, slang, and overly casual phrasing. The structure should be logical and sentences should be grammatically precise.',
    'Professional': 'Rewrite the text to be suitable for a business or professional context. Focus on clarity, conciseness, and a respectable tone. The language should be polished and confident.',
    'Narrative': 'Rewrite the text in a storytelling style. Focus on conveying a sequence of events or a personal experience, with a clear beginning, middle, and end. Use descriptive details to engage the reader.',
    'Descriptive': 'Rewrite the text with vivid language and sensory details (sight, sound, smell, touch, taste) to create a clear and immersive picture for the reader.',
    'Expository': 'Rewrite the text to explain, inform, or clarify a topic. Present facts and ideas in a clear, logical, and organized manner. The tone should be neutral and educational.',
    'Argumentative': 'Rewrite the text to present a clear and well-supported argument. State a clear position and back it up with logical reasoning and evidence.',
    'Persuasive': 'Rewrite the text with the primary goal of influencing the reader\'s thoughts or actions. Use rhetorical devices, emotional appeals, and strong calls to action.',
    'Creative': 'Rewrite the text with imagination and originality. Feel free to use figurative language, unique expressions, and an unconventional style to make the text more engaging and memorable.',
    'Technical': 'Rewrite the text using precise language and terminology relevant to a specific technical field. The focus should be on accuracy and detail, assuming an audience with some domain knowledge.',
    'Academic': 'Rewrite the text to adhere to academic conventions. Use formal language, structured arguments, and an objective tone. Cite evidence where appropriate (if context is available).',
    'Journalistic': 'Rewrite the text in the style of a news report. Focus on factual information, objectivity, and a concise presentation of events. Use the "inverted pyramid" structure where the most important information comes first.',
    'Poetic': 'Rewrite the text with a focus on rhythm, imagery, and emotional expression. Use figurative language like metaphors and similes to create a more artistic and evocative piece.',
    'Satirical': 'Rewrite the text using humor, irony, or exaggeration to criticize or mock a subject. The tone should be witty and critical, often with a humorous underlying message.',
    'Humorous': 'Rewrite the text with the main intention of being funny or amusing. Use jokes, wit, and lighthearted language to entertain the reader.'
};


export async function rewriteText(input: RewriteTextInput): Promise<RewriteTextOutput> {

  const instruction = styleInstructions[input.style] || "Rewrite the text as requested.";

  const prompt = ai.definePrompt({
    name: 'rewriteTextPrompt',
    input: { schema: RewriteTextInputSchema },
    output: { schema: RewriteTextOutputSchema },
    prompt: `You are an expert editor. Your task is to rewrite the following text based on the provided style instruction, preserving the core meaning and markdown formatting.
Return only the rewritten text.

**Style Instruction**: ${instruction}

**Original Text:**
---
{{{text}}}
---
`,
  });

  const { output } = await prompt({ text: input.text, style: input.style });
  return output!;
}


// --- Summarize Text with Ratio Flow ---

const SummarizeTextWithRatioInputSchema = z.object({
  text: z.string().describe('The text to be summarized.'),
  ratio: z.number().min(10).max(90).describe('The desired compression ratio (10% - 90%). 10% is a very short summary, 90% is almost the original length.'),
});
export type SummarizeTextWithRatioInput = z.infer<typeof SummarizeTextWithRatioInputSchema>;

const SummarizeTextWithRatioOutputSchema = z.object({
  summarizedText: z.string().describe('The generated summary of the original text.'),
});
export type SummarizeTextWithRatioOutput = z.infer<typeof SummarizeTextWithRatioOutputSchema>;

export async function summarizeTextWithRatio(input: SummarizeTextWithRatioInput): Promise<SummarizeTextWithRatioOutput> {
  const prompt = ai.definePrompt({
    name: 'summarizeTextWithRatioPrompt',
    input: { schema: SummarizeTextWithRatioInputSchema },
    output: { schema: SummarizeTextWithRatioOutputSchema },
    prompt: `You are an expert summarizer. Your task is to read the provided text and generate a summary.
The summary should be approximately {{{ratio}}}% of the original text's length.

**Original Text:**
---
{{{text}}}
---
`,
  });

  const { output } = await prompt(input);
  return output!;
}
