/**
 * Model Utility Functions
 * 
 * Collection of utility functions for working with AI models,
 * including token counting, cost estimation, and optimization helpers.
 */

import { OLLAMA_MODELS } from './genkit';

/**
 * Estimate token count from text
 * Approximation: 1 token ≈ 4 characters for English, 1-2 characters for Arabic
 */
export function estimateTokenCount(text: string, language: 'en' | 'ar' | 'auto' = 'auto'): number {
  if (!text) return 0;

  // Detect language if auto
  let detectedLanguage = language;
  if (language === 'auto') {
    // Simple heuristic: if more than 30% Arabic characters, treat as Arabic
    const arabicChars = text.match(/[\u0600-\u06FF]/g) || [];
    detectedLanguage = arabicChars.length / text.length > 0.3 ? 'ar' : 'en';
  }

  // Token estimation
  if (detectedLanguage === 'ar') {
    // Arabic: ~1.5 characters per token
    return Math.ceil(text.length / 1.5);
  } else {
    // English: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

/**
 * Estimate memory usage for a request
 */
export function estimateMemoryUsage(model: string, inputTokens: number): number {
  // Base memory usage per model (MB)
  const baseMemory: Record<string, number> = {
    [OLLAMA_MODELS.GEMMA_2B]: 2500,
    [OLLAMA_MODELS.PHI3_MINI]: 3300,
    [OLLAMA_MODELS.LLAMA3_8B]: 4700,
  };

  const base = baseMemory[model] || 2000;

  // Add memory for context (rough estimate: 1MB per 1000 tokens)
  const contextMemory = Math.ceil(inputTokens / 1000);

  return base + contextMemory;
}

/**
 * Check if input is within safe token limits
 */
export function isWithinTokenLimit(text: string, maxTokens: number): boolean {
  const tokens = estimateTokenCount(text);
  return tokens <= maxTokens;
}

/**
 * Truncate text to fit within token limit
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokenCount(text);

  if (estimatedTokens <= maxTokens) {
    return text;
  }

  // Calculate characters to keep (rough estimate)
  const ratio = maxTokens / estimatedTokens;
  const targetLength = Math.floor(text.length * ratio);

  // Try to truncate at sentence boundary
  const truncated = text.substring(0, targetLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');

  const breakpoint = Math.max(lastPeriod, lastNewline);
  if (breakpoint > targetLength * 0.8) {
    return truncated.substring(0, breakpoint + 1);
  }

  return truncated + '...';
}

/**
 * Split text into chunks that fit within token limit
 */
export function chunkText(text: string, maxTokensPerChunk: number, overlap = 0): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = '';
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokenCount(paragraph);

    // If single paragraph exceeds limit, split it
    if (paragraphTokens > maxTokensPerChunk) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }

      // Split large paragraph by sentences
      const sentences = paragraph.split(/[.!?]+\s+/);
      for (const sentence of sentences) {
        const sentenceTokens = estimateTokenCount(sentence);

        if (currentTokens + sentenceTokens > maxTokensPerChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
          currentTokens = sentenceTokens;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
          currentTokens += sentenceTokens;
        }
      }
    } else {
      // Check if adding paragraph exceeds limit
      if (currentTokens + paragraphTokens > maxTokensPerChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
        currentTokens = paragraphTokens;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentTokens += paragraphTokens;
      }
    }
  }

  // Add remaining chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // Add overlap if specified
  if (overlap > 0 && chunks.length > 1) {
    return addOverlapToChunks(chunks, overlap);
  }

  return chunks;
}

/**
 * Add overlap between chunks
 */
function addOverlapToChunks(chunks: string[], overlapTokens: number): string[] {
  const overlappedChunks: string[] = [chunks[0]];

  for (let i = 1; i < chunks.length; i++) {
    const prevChunk = chunks[i - 1];
    const currentChunk = chunks[i];

    // Get last part of previous chunk for overlap
    const overlapText = getLastTokens(prevChunk, overlapTokens);
    overlappedChunks.push(overlapText + '\n\n' + currentChunk);
  }

  return overlappedChunks;
}

/**
 * Get last N tokens from text (approximate)
 */
function getLastTokens(text: string, tokenCount: number): string {
  const estimatedTokens = estimateTokenCount(text);
  if (estimatedTokens <= tokenCount) return text;

  const ratio = tokenCount / estimatedTokens;
  const startIndex = Math.floor(text.length * (1 - ratio));

  return '...' + text.substring(startIndex);
}

/**
 * Optimize prompt for model
 */
export function optimizePromptForModel(prompt: string, model: string): string {
  // For Gemma 2B: Keep prompts simple and direct
  if (model === OLLAMA_MODELS.GEMMA_2B) {
    return simplifyPrompt(prompt);
  }

  // For Phi-3 Mini: Add structure hints
  if (model === OLLAMA_MODELS.PHI3_MINI) {
    return addStructureHints(prompt);
  }

  // For Llama 3 8B: Can handle complex prompts
  return prompt;
}

/**
 * Simplify prompt for lighter models
 */
function simplifyPrompt(prompt: string): string {
  // Remove excessive formatting
  let simplified = prompt
    .replace(/\*\*\*+/g, '**') // Reduce excessive bold
    .replace(/---+/g, '---') // Simplify dividers
    .replace(/\n{3,}/g, '\n\n'); // Reduce excessive newlines

  return simplified;
}

/**
 * Add structure hints for Phi-3 Mini
 */
function addStructureHints(prompt: string): string {
  // Phi-3 benefits from clear structure indicators
  if (!prompt.includes('Output format:') && !prompt.includes('JSON')) {
    return prompt + '\n\nProvide a clear, structured response.';
  }
  return prompt;
}

/**
 * Get model-specific recommendations
 */
export interface ModelRecommendations {
  maxInputTokens: number;
  maxOutputTokens: number;
  optimalTemperature: number;
  useRAG: boolean;
  chunkLargeInputs: boolean;
  recommendations: string[];
}

export function getModelRecommendations(model: string): ModelRecommendations {
  switch (model) {
    case OLLAMA_MODELS.GEMMA_2B:
      return {
        maxInputTokens: 2048,
        maxOutputTokens: 512,
        optimalTemperature: 0.7,
        useRAG: false,
        chunkLargeInputs: true,
        recommendations: [
          'Keep prompts simple and direct',
          'Limit output to 200-300 words',
          'Best for text generation and conversion',
          'Can handle multiple concurrent requests',
        ],
      };

    case OLLAMA_MODELS.PHI3_MINI:
      return {
        maxInputTokens: 4096,
        maxOutputTokens: 1024,
        optimalTemperature: 0.5,
        useRAG: false,
        chunkLargeInputs: false,
        recommendations: [
          'Excellent for structured output',
          'Use clear formatting instructions',
          'Best for analysis and reports',
          'Limit to 2-3 concurrent requests',
        ],
      };

    case OLLAMA_MODELS.LLAMA3_8B:
      return {
        maxInputTokens: 8192,
        maxOutputTokens: 2048,
        optimalTemperature: 0.7,
        useRAG: true,
        chunkLargeInputs: false,
        recommendations: [
          'Always use with RAG for academic tasks',
          'Provide 500-1000 tokens of context',
          'Best for complex reasoning',
          'Run one request at a time',
          'Limit output to 300 words per generation',
        ],
      };

    default:
      return {
        maxInputTokens: 2048,
        maxOutputTokens: 512,
        optimalTemperature: 0.7,
        useRAG: false,
        chunkLargeInputs: true,
        recommendations: ['Use default settings'],
      };
  }
}

/**
 * Calculate optimal chunk size for model
 */
export function getOptimalChunkSize(model: string): number {
  const recommendations = getModelRecommendations(model);
  // Use 80% of max input tokens to leave room for prompt
  return Math.floor(recommendations.maxInputTokens * 0.8);
}

/**
 * Validate model configuration
 */
export interface ModelConfigValidation {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export function validateModelConfig(
  model: string,
  inputText: string,
  maxOutputTokens?: number,
  temperature?: number
): ModelConfigValidation {
  const warnings: string[] = [];
  const errors: string[] = [];
  const recommendations = getModelRecommendations(model);

  // Check input size
  const inputTokens = estimateTokenCount(inputText);
  if (inputTokens > recommendations.maxInputTokens) {
    errors.push(
      `Input too large: ${inputTokens} tokens exceeds ${recommendations.maxInputTokens} limit for ${model}`
    );
  } else if (inputTokens > recommendations.maxInputTokens * 0.8) {
    warnings.push(`Input size is ${Math.round((inputTokens / recommendations.maxInputTokens) * 100)}% of limit`);
  }

  // Check output size
  if (maxOutputTokens && maxOutputTokens > recommendations.maxOutputTokens) {
    warnings.push(
      `Requested output (${maxOutputTokens} tokens) exceeds recommended ${recommendations.maxOutputTokens} for ${model}`
    );
  }

  // Check temperature
  if (temperature !== undefined) {
    if (temperature < 0 || temperature > 2) {
      errors.push(`Temperature ${temperature} is out of valid range (0-2)`);
    } else if (Math.abs(temperature - recommendations.optimalTemperature) > 0.5) {
      warnings.push(
        `Temperature ${temperature} differs significantly from optimal ${recommendations.optimalTemperature} for ${model}`
      );
    }
  }

  // Model-specific checks
  if (model === OLLAMA_MODELS.LLAMA3_8B && inputTokens < 500 && recommendations.useRAG) {
    warnings.push('Llama 3 8B works best with RAG context (500+ tokens recommended)');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Format model name for display
 */
export function formatModelName(model: string): string {
  const name = model.replace('ollama/', '');
  return name
    .split(/[:-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Get model nickname
 */
export function getModelNickname(model: string): string {
  switch (model) {
    case OLLAMA_MODELS.GEMMA_2B:
      return 'Fast';
    case OLLAMA_MODELS.PHI3_MINI:
      return 'Smart';
    case OLLAMA_MODELS.LLAMA3_8B:
      return 'Quality';
    default:
      return 'Unknown';
  }
}

/**
 * Compare model capabilities
 */
export function compareModelCapabilities(model1: string, model2: string): {
  faster: string;
  smarter: string;
  largerContext: string;
  moreEfficient: string;
} {
  const rec1 = getModelRecommendations(model1);
  const rec2 = getModelRecommendations(model2);

  return {
    faster: rec1.maxInputTokens < rec2.maxInputTokens ? model1 : model2,
    smarter: rec1.maxInputTokens > rec2.maxInputTokens ? model1 : model2,
    largerContext: rec1.maxInputTokens > rec2.maxInputTokens ? model1 : model2,
    moreEfficient: rec1.maxInputTokens < rec2.maxInputTokens ? model1 : model2,
  };
}
