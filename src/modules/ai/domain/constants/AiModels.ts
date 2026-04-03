/**
 * Ollama Models Configuration Constants
 * 
 * Centralized model names and task mappings to ensure consistency across the application.
 * This file is dependency-free and safe to import in both client and server components.
 */

export const OLLAMA_MODELS = {
  // Fast, efficient for basic text operations
  GEMMA_2B: 'ollama/gemma:2b',

  // Strong reasoning and structured output
  PHI3_MINI: 'ollama/phi4-mini:latest',

  // High quality for complex academic tasks
  LLAMA3_8B: 'ollama/llama2:7b',

  // Embedding models for RAG
  EMBEDDING_MODEL: 'nomic-embed-text',
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
