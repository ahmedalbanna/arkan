

'use server';

/**
 * @fileOverview AI agents for text manipulation: rewriting and summarizing.
 */

import { ai } from '@/ai/genkit';
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
  type SummarizeTextWithRatioOutput
} from '@/lib/schemas';

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

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.5-flash-lite',
    prompt: `You are an expert editor. Your task is to rewrite the following text based on the provided style instruction, preserving the core meaning and markdown formatting.
Return only the rewritten text.

**Style Instruction**: ${instruction}

**Original Text:**
---
${input.text}
---
`,
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
    model: 'googleai/gemini-2.5-flash-lite',
    prompt: `You are an expert summarizer. Your task is to read the provided text and generate a summary.
The summary should be approximately ${input.ratio}% of the original text's length. Return only the summarized text.

**Original Text:**
---
${input.text}
---
`,
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

// --- Style Editor Flow ---
export async function styleEditor(input: StyleEditorInput): Promise<StyleEditorOutput> {
  const audienceContext = input.targetAudience ? `Target Audience: ${input.targetAudience}. ` : '';
  const toneContext = input.tone ? `Desired Tone: ${input.tone}. ` : '';

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.5-flash-lite',
    prompt: `You are an expert style editor. Your task is to improve the style of the following text while preserving its core meaning and markdown formatting.
${audienceContext}${toneContext}Focus on enhancing clarity, flow, word choice, sentence structure, and overall writing quality.

IMPORTANT: Return ONLY the improved text. Do not include any introductory phrases, explanations, or meta-commentary. Start directly with the improved text.

**Original Text:**
---
${input.text}
---
`,
    config: {
      temperature: 0.7,
    }
  });

  let responseText = llmResponse.text.replace(/---/g, '').trim();

  // Remove common introductory phrases that models sometimes add
  const introPatterns = [
    /^here'?s?\s+(?:the\s+)?(?:improved|edited|enhanced|revised)\s+text[:\-]?\s*/i,
    /^here'?s?\s+(?:the\s+)?(?:result|output)[:\-]?\s*/i,
    /^improved\s+text[:\-]?\s*/i,
    /^edited\s+text[:\-]?\s*/i,
    /^enhanced\s+text[:\-]?\s*/i,
    /^below\s+is\s+(?:the\s+)?(?:improved|edited|enhanced)\s+text[:\-]?\s*/i,
    /^the\s+(?:improved|edited|enhanced)\s+text\s+(?:is|follows)[:\-]?\s*/i,
  ];

  for (const pattern of introPatterns) {
    responseText = responseText.replace(pattern, '').trim();
  }

  // Try to extract improvements if listed (usually at the end)
  const improvementsMatch = responseText.match(/\n\s*(?:improvements?|changes?|edits?)[:\-]?\s*\n([\s\S]*?)$/i);
  const improvements = improvementsMatch
    ? improvementsMatch[1].split('\n').filter(line => line.trim().match(/^[-•*]\s/)).map(line => line.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
    : undefined;

  const editedText = improvements
    ? responseText.replace(/\n\s*(?:improvements?|changes?|edits?)[:\-]?\s*\n[\s\S]*$/i, '').trim()
    : responseText;

  if (!editedText) {
    throw new Error("Failed to edit text style.");
  }

  return {
    editedText,
    improvements: improvements && improvements.length > 0 ? improvements : undefined
  };
}

// --- Readability Enhancer Flow ---
export async function readabilityEnhancer(input: ReadabilityEnhancerInput): Promise<ReadabilityEnhancerOutput> {
  const levelContext = input.targetLevel
    ? `Target Reading Level: ${input.targetLevel}. Adjust sentence length, vocabulary complexity, and structure accordingly. `
    : '';

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.5-flash-lite',
    prompt: `You are an expert in text readability. Your task is to enhance the readability of the following text while preserving its core meaning and markdown formatting.
${levelContext}Focus on:
- Simplifying complex sentences
- Using clearer vocabulary
- Improving sentence structure and flow
- Breaking up long paragraphs
- Ensuring logical progression of ideas

IMPORTANT: Return ONLY the enhanced text. Do not include any introductory phrases, explanations, or meta-commentary. Start directly with the enhanced text.

**Original Text:**
---
${input.text}
---
`,
    config: {
      temperature: 0.6,
    }
  });

  let responseText = llmResponse.text.replace(/---/g, '').trim();

  // Remove common introductory phrases
  const introPatterns = [
    /^here'?s?\s+(?:the\s+)?(?:enhanced|improved|readable)\s+text[:\-]?\s*/i,
    /^here'?s?\s+(?:the\s+)?(?:result|output)[:\-]?\s*/i,
    /^enhanced\s+text[:\-]?\s*/i,
    /^improved\s+text[:\-]?\s*/i,
    /^below\s+is\s+(?:the\s+)?(?:enhanced|improved)\s+text[:\-]?\s*/i,
    /^the\s+(?:enhanced|improved)\s+text\s+(?:is|follows)[:\-]?\s*/i,
    /^aiming\s+for\s+[^,]+,\s+with\s+explanations?\s+of\s+the\s*/i,
  ];

  for (const pattern of introPatterns) {
    responseText = responseText.replace(pattern, '').trim();
  }

  // Try to extract score and improvements (usually at the end)
  const scoreMatch = responseText.match(/\n\s*readability\s+score[:\-]?\s*(\d+)/i);
  const readabilityScore = scoreMatch ? parseInt(scoreMatch[1], 10) : undefined;

  const improvementsMatch = responseText.match(/\n\s*(?:improvements?|changes?|enhancements?)[:\-]?\s*\n([\s\S]*?)$/i);
  const improvements = improvementsMatch
    ? improvementsMatch[1].split('\n').filter(line => line.trim().match(/^[-•*]\s/)).map(line => line.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
    : undefined;

  let enhancedText = responseText;
  if (scoreMatch) {
    enhancedText = enhancedText.replace(/\n\s*readability\s+score[:\-]?\s*\d+[.\s]*/i, '').trim();
  }
  if (improvementsMatch) {
    enhancedText = enhancedText.replace(/\n\s*(?:improvements?|changes?|enhancements?)[:\-]?\s*\n[\s\S]*$/i, '').trim();
  }

  if (!enhancedText) {
    throw new Error("Failed to enhance text readability.");
  }

  return {
    enhancedText,
    readabilityScore,
    improvements: improvements && improvements.length > 0 ? improvements : undefined
  };
}

// --- Conciseness Checker Flow ---
export async function concisenessChecker(input: ConcisenessCheckerInput): Promise<ConcisenessCheckerOutput> {
  const reductionContext = input.targetReduction
    ? `Target Reduction: Aim to reduce the text by approximately ${input.targetReduction}% while preserving all essential meaning. `
    : 'Aim to make the text more concise while preserving all essential meaning. ';

  const originalWordCount = input.text.split(/\s+/).filter(word => word.length > 0).length;

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.5-flash-lite',
    prompt: `You are an expert at making text more concise. Your task is to make the following text more concise while preserving its core meaning and markdown formatting.
${reductionContext}Focus on:
- Removing redundant words and phrases
- Eliminating unnecessary repetition
- Using more direct language
- Combining related ideas efficiently
- Maintaining clarity and completeness

IMPORTANT: Return ONLY the concise text. Do not include any introductory phrases, explanations, or meta-commentary. Start directly with the concise text.

**Original Text:**
---
${input.text}
---
`,
    config: {
      temperature: 0.5,
    }
  });

  let responseText = llmResponse.text.replace(/---/g, '').trim();

  // Remove common introductory phrases
  const introPatterns = [
    /^here'?s?\s+(?:the\s+)?(?:concise|shortened|condensed)\s+text[:\-]?\s*/i,
    /^here'?s?\s+(?:the\s+)?(?:result|output)[:\-]?\s*/i,
    /^concise\s+text[:\-]?\s*/i,
    /^shortened\s+text[:\-]?\s*/i,
    /^below\s+is\s+(?:the\s+)?(?:concise|shortened)\s+text[:\-]?\s*/i,
    /^the\s+(?:concise|shortened)\s+text\s+(?:is|follows)[:\-]?\s*/i,
  ];

  for (const pattern of introPatterns) {
    responseText = responseText.replace(pattern, '').trim();
  }

  const improvementsMatch = responseText.match(/\n\s*(?:improvements?|changes?|reductions?)[:\-]?\s*\n([\s\S]*?)$/i);
  const improvements = improvementsMatch
    ? improvementsMatch[1].split('\n').filter(line => line.trim().match(/^[-•*]\s/)).map(line => line.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
    : undefined;

  const conciseText = improvements
    ? responseText.replace(/\n\s*(?:improvements?|changes?|reductions?)[:\-]?\s*\n[\s\S]*$/i, '').trim()
    : responseText;

  if (!conciseText) {
    throw new Error("Failed to make text concise.");
  }

  const newWordCount = conciseText.split(/\s+/).filter(word => word.length > 0).length;
  const reductionPercentage = originalWordCount > 0
    ? Math.round(((originalWordCount - newWordCount) / originalWordCount) * 100)
    : 0;

  return {
    conciseText,
    originalWordCount,
    newWordCount,
    reductionPercentage,
    improvements: improvements && improvements.length > 0 ? improvements : undefined
  };
}

// --- Clarity Advisor Flow ---
export async function clarityAdvisor(input: ClarityAdvisorInput): Promise<ClarityAdvisorOutput> {
  const focusContext = input.focusAreas && input.focusAreas.length > 0
    ? `Focus Areas: ${input.focusAreas.join(', ')}. Pay special attention to these aspects. `
    : '';

  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.5-flash-lite',
    prompt: `You are an expert clarity advisor. Your task is to analyze and improve the clarity of the following text while preserving its core meaning and markdown formatting.
${focusContext}Focus on:
- Sentence structure and clarity
- Word choice and precision
- Logical flow and organization
- Ambiguity and confusion
- Overall comprehensibility

IMPORTANT: Return ONLY the improved text. Do not include any introductory phrases, explanations, or meta-commentary. Start directly with the improved text.

**Original Text:**
---
${input.text}
---
`,
    config: {
      temperature: 0.6,
    }
  });

  let responseText = llmResponse.text.replace(/---/g, '').trim();

  // Remove common introductory phrases
  const introPatterns = [
    /^here'?s?\s+(?:the\s+)?(?:improved|clarified|clearer)\s+text[:\-]?\s*/i,
    /^here'?s?\s+(?:the\s+)?(?:result|output)[:\-]?\s*/i,
    /^improved\s+text[:\-]?\s*/i,
    /^clarified\s+text[:\-]?\s*/i,
    /^below\s+is\s+(?:the\s+)?(?:improved|clarified)\s+text[:\-]?\s*/i,
    /^the\s+(?:improved|clarified)\s+text\s+(?:is|follows)[:\-]?\s*/i,
  ];

  for (const pattern of introPatterns) {
    responseText = responseText.replace(pattern, '').trim();
  }

  // Try to extract clarity score (usually at the end)
  const scoreMatch = responseText.match(/\n\s*clarity\s+score[:\-]?\s*(\d+)/i);
  const clarityScore = scoreMatch ? parseInt(scoreMatch[1], 10) : undefined;

  // Try to extract suggestions (usually at the end)
  const suggestionsMatch = responseText.match(/\n\s*(?:suggestions?|improvements?|recommendations?)[:\-]?\s*\n([\s\S]*?)$/i);
  let suggestions = undefined;

  if (suggestionsMatch) {
    const suggestionsText = suggestionsMatch[1];
    const suggestionLines = suggestionsText.split('\n').filter(line => line.trim());
    suggestions = suggestionLines.map(line => {
      const issueMatch = line.match(/issue[:\-]?\s*(.+?)(?:suggestion|improvement|location|$)/i);
      const suggestionMatch = line.match(/suggestion[:\-]?\s*(.+?)(?:location|$)/i);
      const locationMatch = line.match(/location[:\-]?\s*(.+?)$/i);

      return {
        issue: issueMatch ? issueMatch[1].trim() : line.replace(/^[-•*]\s*/, '').trim(),
        suggestion: suggestionMatch ? suggestionMatch[1].trim() : '',
        location: locationMatch ? locationMatch[1].trim() : undefined
      };
    }).filter(s => s.issue);
  }

  let improvedText = responseText;
  if (scoreMatch) {
    improvedText = improvedText.replace(/\n\s*clarity\s+score[:\-]?\s*\d+[.\s]*/i, '').trim();
  }
  if (suggestionsMatch) {
    improvedText = improvedText.replace(/\n\s*(?:suggestions?|improvements?|recommendations?)[:\-]?\s*\n[\s\S]*$/i, '').trim();
  }

  if (!improvedText) {
    throw new Error("Failed to improve text clarity.");
  }

  return {
    improvedText,
    clarityScore,
    suggestions: suggestions && suggestions.length > 0 ? suggestions : undefined
  };
}
