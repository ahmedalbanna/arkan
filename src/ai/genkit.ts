import { googleAI } from '@genkit-ai/googleai';
import { genkit, GenkitError } from 'genkit';
import { allTools } from './tools';

// SECURITY FIX: Do not hardcode API keys. Load from environment variables as a fallback.
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Model provider selection
 * Set GENKIT_MODEL_PROVIDER environment variable to:
 * - 'google' (default): Use Google Gemini API
 * - 'ollama': Use local Ollama models
 */
export const MODEL_PROVIDER = (process.env.GENKIT_MODEL_PROVIDER || 'google') as 'google' | 'ollama';

// Default global AI instance (used for unauthenticated or fallback cases)
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: GOOGLE_API_KEY }),
  ],
  tools: Object.values(allTools),
});

/**
 * Creates a user-specific Genkit instance configured with the user's API key.
 * This allows each user to use their own credentials for AI operations.
 *
 * @param userApiKeys - A record of the user's API keys (e.g., { gemini: '...' }).
 * @returns A configured Genkit instance.
 * @throws {GenkitError} If the required API key for the 'googleai' plugin is not found.
 */
export function configureUserAi(userApiKeys?: Record<string, string>) {
  const userApiKey = userApiKeys?.['gemini'];

  // Use the user's key if available, otherwise fall back to the global key.
  const apiKeyToUse = userApiKey || GOOGLE_API_KEY;

  if (!apiKeyToUse) {
    throw new GenkitError({
      status: 'UNAUTHENTICATED',
      message: 'Google Gemini API key not found. Please add it to your profile or configure it on the server.',
    });
  }

  return genkit({
    plugins: [googleAI({ apiKey: apiKeyToUse })],
    tools: Object.values(allTools),
  });
}

/**
 * Get the appropriate model identifier based on provider and task
 * 
 * @param task - Task type: 'fast' for quick responses, 'balanced' for general use, 'quality' for best results
 * @param provider - Model provider ('google' or 'ollama')
 * @returns Model identifier string
 */
export function getModelForTask(
  task: 'fast' | 'balanced' | 'quality' = 'balanced',
  provider: 'google' | 'ollama' = MODEL_PROVIDER
): string {
  if (provider === 'ollama') {
    // Local Ollama models optimized for 8GB RAM
    const { selectOllamaModel } = require('./ollama.config');
    return selectOllamaModel(task);
  }
  
  // Google Gemini models (default)
  switch (task) {
    case 'fast':
      return 'googleai/gemini-2.5-flash-lite';
    case 'balanced':
      return 'googleai/gemini-2.0-flash-lite';
    case 'quality':
      return 'googleai/gemini-2.0-flash-exp';
    default:
      return 'googleai/gemini-2.0-flash-lite';
  }
}

/**
 * Creates a hybrid AI instance that can switch between Google and Ollama
 * 
 * @param userApiKeys - User's API keys (for Google)
 * @param preferOllama - If true, prefer Ollama when available
 * @returns Configured Genkit instance
 */
export async function configureHybridAi(
  userApiKeys?: Record<string, string>,
  preferOllama: boolean = false
) {
  // Check if Ollama is available
  let useOllama = preferOllama || MODEL_PROVIDER === 'ollama';
  
  if (useOllama) {
    try {
      const { checkOllamaAvailability, ollamaAi } = await import('./ollama.config');
      const isAvailable = await checkOllamaAvailability();
      
      if (isAvailable) {
        console.log('✓ Using local Ollama model');
        return ollamaAi;
      } else {
        console.warn('⚠ Ollama not available, falling back to Google Gemini');
        useOllama = false;
      }
    } catch (error) {
      console.error('Failed to initialize Ollama:', error);
      useOllama = false;
    }
  }
  
  // Fallback to Google Gemini
  return configureUserAi(userApiKeys);
}

// Re-export tools for convenience
export { professionalWritingTools, projectDocumentationTools, allTools } from './tools';
