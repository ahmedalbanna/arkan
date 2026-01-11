
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

export const ai = genkit({
  plugins: [
    ollama({
      models: [
        {
          name: 'gemma:2b',
          type: 'generate',
        },
        {
          name: 'phi3:mini',
          type: 'generate',
        },
        {
          name: 'llama3:8b',
          type: 'generate',
        },
      ],
      serverAddress: "http://185.190.140.93:11434",
    }),
  ],
});

/**
 * Model Selection Guide by Task Category
 * 
 * Use these constants to ensure consistent model usage across flows
 */
export const OLLAMA_MODELS = {
  // Fast, efficient for basic text operations
  GEMMA_2B: 'ollama/gemma:2b',
  
  // Strong reasoning and structured output
  PHI3_MINI: 'ollama/phi3:mini',
  
  // High quality for complex academic tasks
  LLAMA3_8B: 'ollama/llama3:8b',
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
  REPORTS: OLLAMA_MODELS.PHI3_MINI,
  
  // ✅ Checking & Analysis: Reasoning and linguistic analysis
  ANALYSIS: OLLAMA_MODELS.PHI3_MINI,
  
  // 🎯 Specific Tasks: Precise structured output (JSON, PlantUML, etc.)
  STRUCTURED: OLLAMA_MODELS.PHI3_MINI,
  
  // 🎓 Academic & Research: Complex reasoning, high quality (use with RAG)
  ACADEMIC: OLLAMA_MODELS.LLAMA3_8B,
} as const;
