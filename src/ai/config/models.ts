/**
 * @fileOverview Centralized configuration for generative AI models used in the application.
 */

import { gemini10Pro, gemini20Flash } from '@genkit-ai/googleai';

// Defines the default model for general purpose tasks.
export const defaultModel = gemini20Flash;

// Defines the more powerful model for complex reasoning.
export const proModel = gemini10Pro;

// Defines the model used for image generation.
export const imageGenerationModel = 'googleai/gemini-2.0-flash-preview-image-generation';
