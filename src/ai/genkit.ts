

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// Assuming env file is at the root of the project
// and exports GOOGLE_API_KEY

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
export const ai = genkit({
  plugins: [googleAI({ apiKey: GOOGLE_API_KEY })],
  promptDir: './src/ai/prompts',
});
