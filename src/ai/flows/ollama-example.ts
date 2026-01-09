/**
 * Example Flow: Using Local Ollama Models
 * 
 * This flow demonstrates how to use local Ollama models for text generation.
 * Optimized for systems with 8GB RAM.
 */

import { ai } from '@/ai/genkit';
import { ollamaAi, OLLAMA_CONFIG } from '@/ai/ollama.config';
import { z } from 'genkit';

/**
 * Input schema for the local generation flow
 */
const LocalGenerationInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate from'),
  maxTokens: z.number().optional().default(500).describe('Maximum tokens to generate'),
  useLocal: z.boolean().optional().default(true).describe('Use local Ollama model'),
});

/**
 * Output schema
 */
const LocalGenerationOutputSchema = z.object({
  generatedText: z.string(),
  model: z.string(),
  provider: z.enum(['google', 'ollama']),
  tokensUsed: z.number().optional(),
});

/**
 * Example Flow: Generate text using local or cloud models
 */
export const localTextGenerationFlow = ai.defineFlow(
  {
    name: 'localTextGeneration',
    inputSchema: LocalGenerationInputSchema,
    outputSchema: LocalGenerationOutputSchema,
  },
  async (input) => {
    let aiInstance = ai;
    let modelName = 'googleai/gemini-2.0-flash-lite';
    let provider: 'google' | 'ollama' = 'google';

    // Switch to Ollama if requested and available
    if (input.useLocal) {
      try {
        const { checkOllamaAvailability } = await import('@/ai/ollama.config');
        const isAvailable = await checkOllamaAvailability();
        
        if (isAvailable) {
          aiInstance = ollamaAi;
          modelName = OLLAMA_CONFIG.defaultModel;
          provider = 'ollama';
          console.log(`✓ Using local Ollama model: ${modelName}`);
        } else {
          console.warn('⚠ Ollama not available, using Google Gemini');
        }
      } catch (error) {
        console.error('Error checking Ollama:', error);
      }
    }

    // Generate text
    const response = await aiInstance.generate({
      model: modelName,
      prompt: input.prompt,
      config: {
        maxOutputTokens: input.maxTokens,
      },
    });

    return {
      generatedText: response.text,
      model: modelName,
      provider,
      tokensUsed: response.usage?.outputTokens,
    };
  }
);

/**
 * Academic Writing Flow - Optimized for Local Models
 * 
 * This flow is specifically designed to work efficiently on 8GB RAM systems
 * by using shorter prompts and streaming responses.
 */
const AcademicParagraphInputSchema = z.object({
  topic: z.string().describe('The academic topic to write about'),
  style: z.enum(['introduction', 'body', 'conclusion']).default('body'),
  wordCount: z.number().min(50).max(300).default(150).describe('Target word count'),
  language: z.enum(['en', 'ar']).default('en'),
  useLocal: z.boolean().default(false),
});

const AcademicParagraphOutputSchema = z.object({
  paragraph: z.string(),
  wordCount: z.number(),
  model: z.string(),
  provider: z.enum(['google', 'ollama']),
});

export const academicParagraphFlow = ai.defineFlow(
  {
    name: 'academicParagraphLocal',
    inputSchema: AcademicParagraphInputSchema,
    outputSchema: AcademicParagraphOutputSchema,
  },
  async (input) => {
    // Select AI instance
    let aiInstance = ai;
    let modelName = 'googleai/gemini-2.0-flash-lite';
    let provider: 'google' | 'ollama' = 'google';

    if (input.useLocal) {
      const { checkOllamaAvailability } = await import('@/ai/ollama.config');
      const isAvailable = await checkOllamaAvailability();
      
      if (isAvailable) {
        aiInstance = ollamaAi;
        modelName = OLLAMA_CONFIG.defaultModel;
        provider = 'ollama';
      }
    }

    // Build prompt based on style
    const styleInstructions = {
      introduction: 'Write an engaging introduction paragraph that presents the topic and its importance.',
      body: 'Write a well-structured body paragraph with clear argumentation and evidence.',
      conclusion: 'Write a concluding paragraph that summarizes key points and provides closure.',
    };

    const languageInstructions = input.language === 'ar' 
      ? 'اكتب بالعربية الفصحى بأسلوب أكاديمي.'
      : 'Write in formal academic English.';

    const prompt = `
${styleInstructions[input.style]}

Topic: ${input.topic}
Target Length: Approximately ${input.wordCount} words
Style: Academic and formal
${languageInstructions}

Write the paragraph now:
`.trim();

    // Generate with local or cloud model
    const response = await aiInstance.generate({
      model: modelName,
      prompt,
      config: {
        maxOutputTokens: input.wordCount * 2, // Rough estimate: 1 word ≈ 1.3 tokens
        temperature: 0.7,
      },
    });

    const paragraph = response.text.trim();
    const wordCount = paragraph.split(/\s+/).length;

    return {
      paragraph,
      wordCount,
      model: modelName,
      provider,
    };
  }
);

/**
 * Simple Paraphrase Flow - Optimized for Local Models
 */
const ParaphraseInputSchema = z.object({
  text: z.string().describe('Text to paraphrase'),
  style: z.enum(['formal', 'casual', 'academic']).default('formal'),
  useLocal: z.boolean().default(false),
});

const ParaphraseOutputSchema = z.object({
  original: z.string(),
  paraphrased: z.string(),
  model: z.string(),
  provider: z.enum(['google', 'ollama']),
});

export const paraphraseFlow = ai.defineFlow(
  {
    name: 'paraphraseLocal',
    inputSchema: ParaphraseInputSchema,
    outputSchema: ParaphraseOutputSchema,
  },
  async (input) => {
    let aiInstance = ai;
    let modelName = 'googleai/gemini-2.5-flash-lite';
    let provider: 'google' | 'ollama' = 'google';

    if (input.useLocal) {
      const { checkOllamaAvailability } = await import('@/ai/ollama.config');
      const isAvailable = await checkOllamaAvailability();
      
      if (isAvailable) {
        aiInstance = ollamaAi;
        modelName = OLLAMA_CONFIG.defaultModel;
        provider = 'ollama';
      }
    }

    const styleInstructions = {
      formal: 'Use formal language and professional tone.',
      casual: 'Use conversational and friendly language.',
      academic: 'Use scholarly language with technical precision.',
    };

    const prompt = `Paraphrase the following text while maintaining its meaning.
${styleInstructions[input.style]}

Original text:
${input.text}

Paraphrased version:`;

    const response = await aiInstance.generate({
      model: modelName,
      prompt,
      config: {
        maxOutputTokens: input.text.length * 2,
        temperature: 0.8,
      },
    });

    return {
      original: input.text,
      paraphrased: response.text.trim(),
      model: modelName,
      provider,
    };
  }
);
