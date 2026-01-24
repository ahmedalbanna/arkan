'use client';

/**
 * Unified Generation Service
 * Client-side service for calling the unified generation API
 */

import {
  GenerationProcessType,
  UnifiedGenerationInput,
  UnifiedGenerationOutput,
} from '@/ai/schemas/unified-generation';

/**
 * Call the unified generation API
 * @param input - Generation input with system/user prompts
 * @param token - Firebase authentication token
 * @returns Generated content with metadata
 */
export async function generateUnifiedApi(
  input: UnifiedGenerationInput,
  token: string
): Promise<UnifiedGenerationOutput> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to generate content');
  }

  return await response.json();
}

/**
 * Generate a report section
 * @param sectionId - Section identifier
 * @param systemPrompt - System instructions for the AI
 * @param userPrompt - User task description
 * @param token - Firebase authentication token
 * @param modelConfig - Optional model configuration
 */
export async function generateSection(
  sectionId: string,
  systemPrompt: string,
  userPrompt: string,
  token: string,
  modelConfig?: UnifiedGenerationInput['modelConfig']
): Promise<UnifiedGenerationOutput> {
  return generateUnifiedApi(
    {
      processType: GenerationProcessType.SECTION,
      processId: sectionId,
      systemPrompt,
      userPrompt,
      modelConfig,
    },
    token
  );
}

/**
 * Correct grammar in text
 * @param textId - Text identifier
 * @param text - Text to correct
 * @param token - Firebase authentication token
 */
export async function correctGrammar(
  textId: string,
  text: string,
  token: string
): Promise<UnifiedGenerationOutput> {
  const systemPrompt = `You are an expert grammar and spelling checker.
Your task is to correct grammar, spelling, punctuation, and style issues while preserving the original meaning and tone.

Instructions:
- Fix all grammar and spelling errors
- Improve punctuation and sentence structure
- Maintain the original voice and style
- Do NOT change the meaning
- Return ONLY the corrected text (no explanations)`;

  const userPrompt = `Please correct the grammar and spelling in the following text:

${text}

Return only the corrected version.`;

  return generateUnifiedApi(
    {
      processType: GenerationProcessType.GRAMMAR,
      processId: textId,
      systemPrompt,
      userPrompt,
      modelConfig: {
        temperature: 0.1, // Low temperature for accuracy
      },
    },
    token
  );
}

/**
 * Translate text
 * @param textId - Text identifier
 * @param text - Text to translate
 * @param targetLanguage - Target language (e.g., 'Spanish', 'French')
 * @param token - Firebase authentication token
 */
export async function translateText(
  textId: string,
  text: string,
  targetLanguage: string,
  token: string
): Promise<UnifiedGenerationOutput> {
  const systemPrompt = `You are an expert translator.
Your task is to translate text accurately while preserving meaning, tone, and style.

Instructions:
- Translate naturally and fluently
- Preserve the original tone and formality
- Keep technical terms accurate
- Maintain formatting (markdown, lists, etc.)
- Return ONLY the translated text`;

  const userPrompt = `Translate the following text to ${targetLanguage}:

${text}

Return only the translated version.`;

  return generateUnifiedApi(
    {
      processType: GenerationProcessType.TRANSLATION,
      processId: textId,
      systemPrompt,
      userPrompt,
    },
    token
  );
}

/**
 * Summarize text
 * @param textId - Text identifier
 * @param text - Text to summarize
 * @param maxWords - Maximum words in summary (optional)
 * @param token - Firebase authentication token
 */
export async function summarizeText(
  textId: string,
  text: string,
  token: string,
  maxWords?: number
): Promise<UnifiedGenerationOutput> {
  const systemPrompt = `You are an expert at creating concise, accurate summaries.
Your task is to extract the key points and main ideas from text.

Instructions:
- Capture the main ideas and key points
- Be concise but comprehensive
- Maintain accuracy - don't add information
- Use clear, simple language
- Return ONLY the summary`;

  const wordLimit = maxWords ? `\n- Keep the summary under ${maxWords} words` : '';

  const userPrompt = `Summarize the following text:${wordLimit}

${text}

Return only the summary.`;

  return generateUnifiedApi(
    {
      processType: GenerationProcessType.SUMMARIZATION,
      processId: textId,
      systemPrompt,
      userPrompt,
    },
    token
  );
}

/**
 * Expand text (make it more detailed)
 * @param textId - Text identifier
 * @param text - Text to expand
 * @param targetLength - Target length description (e.g., '2x longer', '500 words')
 * @param token - Firebase authentication token
 */
export async function expandText(
  textId: string,
  text: string,
  targetLength: string,
  token: string
): Promise<UnifiedGenerationOutput> {
  const systemPrompt = `You are an expert writer skilled at expanding and elaborating on ideas.
Your task is to expand text while maintaining its core message and tone.

Instructions:
- Add relevant details and explanations
- Include examples where appropriate
- Maintain the original tone and style
- Keep it coherent and well-structured
- Return ONLY the expanded text`;

  const userPrompt = `Expand the following text to make it ${targetLength}:

${text}

Return only the expanded version.`;

  return generateUnifiedApi(
    {
      processType: GenerationProcessType.EXPANSION,
      processId: textId,
      systemPrompt,
      userPrompt,
      modelConfig: {
        modelName: 'ollama/llama3:8b', // Use larger model for expansion
      },
    },
    token
  );
}

/**
 * Rewrite text in a different style
 * @param textId - Text identifier
 * @param text - Text to rewrite
 * @param style - Target style (e.g., 'formal', 'casual', 'professional')
 * @param token - Firebase authentication token
 */
export async function rewriteText(
  textId: string,
  text: string,
  style: string,
  token: string
): Promise<UnifiedGenerationOutput> {
  const systemPrompt = `You are an expert writer who can adapt text to different styles.
Your task is to rewrite text in a specific style while preserving the core message.

Instructions:
- Rewrite in the requested style
- Keep the same information and meaning
- Adjust tone, vocabulary, and sentence structure
- Maintain logical flow
- Return ONLY the rewritten text`;

  const userPrompt = `Rewrite the following text in a ${style} style:

${text}

Return only the rewritten version.`;

  return generateUnifiedApi(
    {
      processType: GenerationProcessType.REWRITE,
      processId: textId,
      systemPrompt,
      userPrompt,
    },
    token
  );
}

/**
 * Custom generation with user-provided prompts
 * @param processId - Process identifier
 * @param systemPrompt - System instructions
 * @param userPrompt - User task
 * @param token - Firebase authentication token
 * @param modelConfig - Optional model configuration
 */
export async function generateCustom(
  processId: string,
  systemPrompt: string,
  userPrompt: string,
  token: string,
  modelConfig?: UnifiedGenerationInput['modelConfig']
): Promise<UnifiedGenerationOutput> {
  return generateUnifiedApi(
    {
      processType: GenerationProcessType.CUSTOM,
      processId,
      systemPrompt,
      userPrompt,
      modelConfig,
    },
    token
  );
}
