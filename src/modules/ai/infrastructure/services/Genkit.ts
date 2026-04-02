/**
 * Global Singleton Pattern for Genkit
 * Prevents multiple instances and SIGINT listener accumulation during Next.js hot reloads.
 */
const globalForAi = globalThis as unknown as {
  ai: any | undefined;
};

// Server-only initialization
let aiInstance: any = null;

if (typeof window === 'undefined') {
  const { genkit } = require('genkit');
  const { ollama } = require('genkitx-ollama');

  // Skip if we are being bundled for a client-side environment that doesn't support genkit
  // This is a safety measure for Turbopack/Webpack
  aiInstance = globalForAi.ai ?? genkit({
    plugins: [
      ollama({
        models: [
          {
            name: 'gemma:2b',
            type: 'generate',
          },
          {
            name: 'phi4-mini:latest',
            type: 'generate',
          },
          {
            name: 'llama2:7b',
            type: 'generate',
          },
        ],
        serverAddress: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      }),
    ],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForAi.ai = aiInstance;
  }
}

export const ai = aiInstance;

// Re-export constants from domain
export * from "../../domain/constants/AiModels";
