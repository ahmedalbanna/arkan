import { genkit } from 'genkit';
import { ollama } from 'genkitx-ollama';

/**
 * Ollama Models Configuration
 *
 * Based on task requirements and hardware constraints (8GB RAM):
 * - Gemma 2B (~2.5GB): Fast, good for basic text generation, summarization, conversion
 * - Phi-3 Mini (~3.3GB): Strong reasoning, excellent for formatting, analysis, structured output
 * - Llama 3 8B (~4.7GB): Best quality for complex tasks, academic work (use sparingly)
 *
 * Server: http://185.190.140.93:11434
 */

/**
 * Global Singleton Pattern for Genkit
 * Prevents multiple instances and SIGINT listener accumulation during Next.js hot reloads.
 */
const globalForAi = globalThis as unknown as {
  ai: ReturnType<typeof genkit> | undefined;
};

export const ai = globalForAi.ai ?? genkit({
  plugins: [
    ollama({
      models: [
        {
          name: 'gemma:2b',
          type: 'generate',
        },
        {
          name: 'phi3:mini-4k',
          type: 'generate',
        },
        {
          name: 'llama3.1:latest',
          type: 'generate',
        },
      ],
      serverAddress: "http://localhost:11434",
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  globalForAi.ai = ai;
}

/**
 * Model Selection Guide by Task Category
 *
 * Use these constants to ensure consistent model usage across flows
 */
export const OLLAMA_MODELS = {
  // Fast, efficient for basic text operations
  GEMMA_2B: 'ollama/gemma:2b',

  // Strong reasoning and structured output
  PHI3_MINI: 'ollama/phi3:mini-4k',

  // High quality for complex academic tasks
  LLAMA3_8B: 'ollama/llama3.1:latest',
} as const;

/**
 * Model recommendations by task category
 */
export const MODEL_BY_TASK = {
  // 🔄 Conversion & Processing: Fast text transformation
  CONVERSION: OLLAMA_MODELS.GEMMA_2B,

  // ✍️ Text Generation & Writing: Basic to moderate creativity
  TEXT_GENERATION: OLLAMA_MODELS.GEMMA_2B,

  // 📊 Reports & Documentation: Structured output, formatting
  REPORTS: OLLAMA_MODELS.GEMMA_2B,

  // ✅ Checking & Analysis: Reasoning and linguistic analysis
  ANALYSIS: OLLAMA_MODELS.GEMMA_2B,

  // 🎯 Specific Tasks: Precise structured output (JSON, PlantUML, etc.)
  STRUCTURED: OLLAMA_MODELS.GEMMA_2B,

  // 🎓 Academic & Research: Complex reasoning, high quality (use with RAG)
  ACADEMIC: OLLAMA_MODELS.LLAMA3_8B,
} as const;

/**
 * Optimized Model Parameters for Small Models
 */
export const DEFAULT_MODEL_CONFIG = {
  // Highly deterministic for writing tools to prevent babbling/filler
  DETERMINISTIC: {
    temperature: 0.1,
    topP: 0.9,
    maxOutputTokens: 2048,
  },
  // More creative for brainstorming/idea generation
  CREATIVE: {
    temperature: 0.7,
    topP: 0.95,
    maxOutputTokens: 2048,
  }
};
