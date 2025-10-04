// src/ai/config/models.ts
// تعطيل Genkit في العميل لتجنب Node.js APIs
// import { gemini20Flash, gemini15Pro } from '@genkit-ai/googleai';

/**
 * The default model for most general-purpose tasks.
 * It's fast and cost-effective.
 */
export const defaultModel = 'gemini-2.0-flash-exp';

/**
 * A more powerful model for complex reasoning, analysis, and creative tasks.
 */
export const proModel = 'gemini-1.5-pro';

/**
 * A model specifically for image generation.
 */
export const imageGenerationModel = 'googleai/gemini-2.0-flash-preview-image-generation';

/**
 * A model for text-to-speech conversion.
 */
export const textToSpeechModel = 'googleai/gemini-2.5-flash-preview-tts';
