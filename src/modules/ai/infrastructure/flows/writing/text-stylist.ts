

'use server';

/**
 * @fileOverview AI agents for text manipulation: rewriting and summarizing.
 */

import { ai, MODEL_BY_TASK } from '@/modules/ai/infrastructure/services/Genkit';
import {
  type ClarityAdvisorInput,
  type ClarityAdvisorOutput,
  type ConcisenessCheckerInput,
  type ConcisenessCheckerOutput,
  type ReadabilityEnhancerInput,
  type ReadabilityEnhancerOutput,
  type RewriteTextInput,
  type RewriteTextOutput,
  type StyleEditorInput,
  type StyleEditorOutput,
  type SummarizeTextWithRatioInput,
  type SummarizeTextWithRatioOutput,
  RewriteTextOutputSchema,
  SummarizeTextWithRatioOutputSchema,
  StyleEditorOutputSchema,
  ReadabilityEnhancerOutputSchema,
  ConcisenessCheckerOutputSchema,
  ClarityAdvisorOutputSchema
} from '@/modules/ai/domain/schemas';

// --- Rewrite Text Flow ---

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

  const result = await ai.generate({
    model: 'ollama/gemma:2b',
    prompt: `You are an expert editor. Your task is to rewrite the following text based on the provided style instruction, preserving the core meaning and markdown formatting.

**Style Instruction**: ${instruction}

**Original Text:**
---
${input.text}
---

Output ONLY the rewritten text. Do NOT include any preamble, filler, or JSON wrapping.`,
    config: {
      temperature: 0.7,
    }
  });

  const text = result.text.replace(/---/g, '').trim();
  if (!text) {
    throw new Error("Failed to rewrite text.");
  }

  return text;
}


// --- Summarize Text with Ratio Flow ---
export async function summarizeTextWithRatio(input: SummarizeTextWithRatioInput): Promise<SummarizeTextWithRatioOutput> {
  const result = await ai.generate({
    model: 'ollama/gemma:2b',
    prompt: `You are an expert summarizer. Your task is to read the provided text and generate a summary.
The summary should be approximately ${input.ratio}% of the original text's length.

**Original Text:**
---
${input.text}
---

Output ONLY the summarized text. Do NOT include any preamble, filler, or JSON wrapping.`,
    config: {
      temperature: 0.5,
    }
  });

  const text = result.text.replace(/---/g, '').trim();
  if (!text) {
    throw new Error("Failed to summarize text.");
  }

  return text;
}

// --- Style Editor Flow ---
export async function textStyleTune(input: StyleEditorInput): Promise<StyleEditorOutput> {
  const audienceContext = input.targetAudience ? `Target Audience: ${input.targetAudience}. ` : '';
  const toneContext = input.tone ? `Desired Tone: ${input.tone}. ` : '';

  const { output } = await ai.generate({
    model: MODEL_BY_TASK.STRUCTURED,
    output: { schema: StyleEditorOutputSchema },
    prompt: `You are an expert style editor. Your task is to improve the style of the following text while preserving its core meaning and markdown formatting.
${audienceContext}${toneContext}Focus on enhancing clarity, flow, word choice, sentence structure, and overall writing quality.
Your output must be a valid JSON object with a "text" field and an optional "improvements" array of strings.

**Original Text:**
---
${input.text}
---

**Output Format:**
Return ONLY: {"text": "improved content here", "improvements": ["improvement 1", "improvement 2"]}`,
    config: {
      temperature: 0.7,
    }
  });

  if (!output?.text) {
    throw new Error("Failed to edit text style.");
  }

  return {
    text: output.text.trim(),
    improvements: output.improvements
  };
}

// --- Readability Enhancer Flow ---
export async function readabilityEnhancer(input: ReadabilityEnhancerInput): Promise<ReadabilityEnhancerOutput> {
  const levelContext = input.targetLevel
    ? `Target Reading Level: ${input.targetLevel}. Adjust sentence length, vocabulary complexity, and structure accordingly. `
    : '';

  const { output } = await ai.generate({
    model: MODEL_BY_TASK.STRUCTURED,
    output: { schema: ReadabilityEnhancerOutputSchema },
    prompt: `You are an expert in text readability. Your task is to enhance the readability of the following text while preserving its core meaning and markdown formatting.
${levelContext}Focus on:
- Simplifying complex sentences
- Using clearer vocabulary
- Improving sentence structure and flow
- Breaking up long paragraphs
- Ensuring logical progression of ideas

Your output must be a valid JSON object with a "text" field, an optional "readabilityScore" number, and an optional "improvements" array of strings.

**Original Text:**
---
${input.text}
---

**Output Format:**
Return ONLY: {"text": "enhanced content here", "readabilityScore": 85, "improvements": ["improvement 1"]}`,
    config: {
      temperature: 0.6,
    }
  });

  if (!output?.text) {
    throw new Error("Failed to enhance text readability.");
  }

  return {
    text: output.text.trim(),
    readabilityScore: output.readabilityScore,
    improvements: output.improvements
  };
}

// --- Conciseness Checker Flow ---
export async function concisenessChecker(input: ConcisenessCheckerInput): Promise<ConcisenessCheckerOutput> {
  const reductionContext = input.targetReduction
    ? `Target Reduction: Aim to reduce the text by approximately ${input.targetReduction}% while preserving all essential meaning. `
    : 'Aim to make the text more concise while preserving all essential meaning. ';

  const originalWordCount = input.text.split(/\s+/).filter((word: any) => word.length > 0).length;

  const { output } = await ai.generate({
    model: MODEL_BY_TASK.STRUCTURED,
    output: { schema: ConcisenessCheckerOutputSchema },
    prompt: `You are an expert at making text more concise. Your task is to make the following text more concise while preserving its core meaning and markdown formatting.
${reductionContext}Focus on:
- Removing redundant words and phrases
- Eliminating unnecessary repetition
- Using more direct language
- Combining related ideas efficiently
- Maintaining clarity and completeness

Your output must be a valid JSON object with a "text" field and an optional "improvements" array of strings.

**Original Text:**
---
${input.text}
---

**Output Format:**
Return ONLY: {"text": "concise content here", "improvements": ["removed repetition"]}`,
    config: {
      temperature: 0.5,
    }
  });

  if (!output?.text) {
    throw new Error("Failed to make text concise.");
  }

  const conciseText = output.text.trim();
  const newWordCount = conciseText.split(/\s+/).filter((word: any) => word.length > 0).length;
  const reductionPercentage = originalWordCount > 0
    ? Math.round(((originalWordCount - newWordCount) / originalWordCount) * 100)
    : 0;

  return {
    text: conciseText,
    originalWordCount,
    newWordCount,
    reductionPercentage,
    improvements: output.improvements
  };
}

// --- Clarity Advisor Flow ---
export async function clarityAdvisor(input: ClarityAdvisorInput): Promise<ClarityAdvisorOutput> {
  const focusContext = input.focusAreas && input.focusAreas.length > 0
    ? `Focus Areas: ${input.focusAreas.join(', ')}. Pay special attention to these aspects. `
    : '';

  const { output } = await ai.generate({
    model: MODEL_BY_TASK.STRUCTURED,
    output: { schema: ClarityAdvisorOutputSchema },
    prompt: `You are an expert clarity advisor. Your task is to analyze and improve the clarity of the following text while preserving its core meaning and markdown formatting.
${focusContext}Focus on:
- Sentence structure and clarity
- Word choice and precision
- Logical flow and organization
- Ambiguity and confusion
- Overall comprehensibility

Your output must be a valid JSON object with a "text" field, an optional "clarityScore" number, and an optional "suggestions" array.

**Original Text:**
---
${input.text}
---

**Output Format:**
Return ONLY: {"text": "improved content here", "clarityScore": 90, "suggestions": [{"issue": "ambiguity", "suggestion": "be more specific"}]}`,
    config: {
      temperature: 0.6,
    }
  });

  if (!output?.text) {
    throw new Error("Failed to improve text clarity.");
  }

  return {
    text: output.text.trim(),
    clarityScore: output.clarityScore,
    suggestions: output.suggestions
  };
}
