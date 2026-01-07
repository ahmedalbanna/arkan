
import { googleAI } from '@genkit-ai/googleai';
import { genkit, GenkitError } from 'genkit';

// SECURITY FIX: Do not hardcode API keys. Load from environment variables as a fallback.
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Import professional writing tools
import { professionalWritingTools } from './tools';

// Default global AI instance (used for unauthenticated or fallback cases)
export const ai = genkit({
  plugins: [
    googleAI({ apiKey: GOOGLE_API_KEY }),
  ],
  // Register professional writing tools
  tools: Object.values(professionalWritingTools),
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
    // Register professional writing tools with user-specific instance
    tools: Object.values(professionalWritingTools),
  });
}

// Re-export tools for convenience
export { professionalWritingTools } from './tools';

