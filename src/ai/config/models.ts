// src/ai/config/models.ts
import { geminiPro, gemini15Flash } from '@genkit-ai/googleai';

/**
 * The default model for most general-purpose tasks.
 * It's fast and cost-effective.
 */
export const defaultModel = gemini15Flash;

/**
 * A more powerful model for complex reasoning, analysis, and creative tasks.
 */
export const proModel = geminiPro;

/**
 * A model specifically for image generation.
 */
export const imageGenerationModel = 'googleai/gemini-2.0-flash-preview-image-generation';

/**
 * A model for text-to-speech conversion.
 */
export const textToSpeechModel = 'googleai/gemini-2.5-flash-preview-tts';
