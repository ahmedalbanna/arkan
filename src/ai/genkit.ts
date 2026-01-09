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
 * @deprecated Use getModelForTask from './model-manager' instead
 * @param task - Task type: 'fast' for quick responses, 'balanced' for general use, 'quality' for best results
 * @param provider - Model provider ('google' or 'ollama')
 * @returns Model identifier string
 */
export async function getModelForTask(
  task: 'fast' | 'balanced' | 'quality' = 'balanced',
  provider: 'google' | 'ollama' = MODEL_PROVIDER
): Promise<string> {
  const { getModel } = await import('./model-manager');
  return getModel(task, provider);
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
  const { getAIInstance } = await import('./model-manager');
  const provider = preferOllama || MODEL_PROVIDER === 'ollama' ? 'ollama' : 'google';
  
  try {
    const aiInstance = await getAIInstance(provider);
    
    if (provider === 'ollama') {
      console.log('✓ Using local Ollama model');
    }
    
    return aiInstance;
  } catch (error) {
    console.warn('⚠️ Failed to initialize preferred provider, falling back to Google Gemini');
    return configureUserAi(userApiKeys);
  }
}

// Re-export model manager utilities
export { 
  getModel, 
  getModelForTask as getModelForTaskCategory,
  generateWithModel,
  getAIInstance,
  isOllamaAvailable,
  MODEL_REGISTRY,
  TASK_CATEGORIES,
  type ModelQuality,
  type ModelProvider,
  type TaskCategory,
} from './model-manager';

// Re-export tools for convenience
export { professionalWritingTools, projectDocumentationTools, allTools } from './tools';
