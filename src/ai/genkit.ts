
import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
// Assuming env file is at the root of the project
// and exports GOOGLE_API_KEY

// SECURITY FIX: Do not hardcode API keys. Load from environment variables.
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY is not set. AI features may not work.");
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: GOOGLE_API_KEY })],
});
