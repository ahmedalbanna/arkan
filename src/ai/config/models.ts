/**
 * @fileOverview Centralized configuration for generative AI models used in the application.
 */

import { geminiPro, gemini15Flash } from '@genkit-ai/googleai';

// Defines the default model for general purpose tasks.
export const defaultModel = gemini15Flash;

// Defines the more powerful model for complex reasoning.
export const proModel = geminiPro;

// Defines the model used for image generation.
export const imageGenerationModel = 'googleai/gemini-2.0-flash-preview-image-generation';
