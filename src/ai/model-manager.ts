
/**
 * Unified Model Manager for AI Operations
 * 
 * This module provides centralized model selection and management across all
 * flows, tools, and prompts. It supports both Google Gemini and Ollama models
 * with automatic fallback and intelligent model selection.
 */

import { ai } from './genkit';
import type { ModelReference } from 'genkit';
import { z } from 'zod';

/**
 * Model quality tiers
 */
export type ModelQuality = 'fast' | 'balanced' | 'quality' | 'premium';

/**
 * Model provider types
 */
export type ModelProvider = 'google' | 'ollama' | 'auto';

/**
 * Task categories for model selection
 */
export type TaskCategory = 
  | 'drafting'           // Quick drafts, simple generation
  | 'writing'            // General writing tasks
  | 'academic'           // Academic writing, research
  | 'analysis'           // Code analysis, document analysis
  | 'documentation'      // Technical documentation
  | 'translation'        // Language translation
  | 'summarization'      // Text summarization
  | 'creative';          // Creative writing

/**
 * Model configuration interface
 */
interface ModelConfig {
  google: {
    fast: string;
    balanced: string;
    quality: string;
    premium: string;
  };
  ollama: {
    fast: string;
    balanced: string;
    quality: string;
    premium: string;
  };
}

/**
 * Default model configuration
 */
export const MODEL_REGISTRY: ModelConfig = {
  google: {
    fast: 'googleai/gemini-2.5-flash-lite',
    balanced: 'googleai/gemini-2.0-flash-lite',
    quality: 'googleai/gemini-2.0-flash-exp',
    premium: 'googleai/gemini-2.0-flash-exp',
  },
  ollama: {
    fast: 'llama3.2:1b',
    balanced: 'gemma:2b',
    quality: 'phi3:mini',
    premium: 'phi3:mini',
  },
};

/**
 * Task to quality mapping
 */
export const TASK_QUALITY_MAP: Record<TaskCategory, ModelQuality> = {
  drafting: 'fast',
  writing: 'balanced',
  academic: 'quality',
  analysis: 'quality',
  documentation: 'quality',
  translation: 'balanced',
  summarization: 'fast',
  creative: 'quality',
};

/**
 * Environment-based configuration
 */
export class ModelManager {
  private static instance: ModelManager;
  private provider: ModelProvider;
  private ollamaAvailable: boolean = false;
  private checkedOllama: boolean = false;

  private constructor() {
    this.provider = (process.env.GENKIT_MODEL_PROVIDER as ModelProvider) || 'auto';
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  /**
   * Check if Ollama is available
   */
  async checkOllamaAvailability(): Promise<boolean> {
    if (this.checkedOllama) {
      return this.ollamaAvailable;
    }

    try {
      const serverUrl = process.env.OLLAMA_SERVER_URL || 'http://localhost:11434';
      const response = await fetch(`${serverUrl}/api/tags`, {
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      this.ollamaAvailable = response.ok;
    } catch (error) {
      this.ollamaAvailable = false;
    }

    this.checkedOllama = true;
    return this.ollamaAvailable;
  }

  /**
   * Reset Ollama availability check (useful for testing)
   */
  resetOllamaCheck(): void {
    this.checkedOllama = false;
    this.ollamaAvailable = false;
  }

  /**
   * Get model for specific quality tier
   */
  async getModel(
    quality: ModelQuality = 'balanced',
    provider?: ModelProvider
  ): Promise<string> {
    const effectiveProvider = provider || this.provider;

    // If provider is 'auto', check Ollama availability
    if (effectiveProvider === 'auto') {
      const isOllamaAvailable = await this.checkOllamaAvailability();
      const resolvedProvider = isOllamaAvailable ? 'ollama' : 'google';
      return MODEL_REGISTRY[resolvedProvider][quality];
    }

    // If provider is 'ollama', check availability and fallback to Google
    if (effectiveProvider === 'ollama') {
      const isOllamaAvailable = await this.checkOllamaAvailability();
      if (!isOllamaAvailable) {
        console.warn('⚠️ Ollama not available, falling back to Google Gemini');
        return MODEL_REGISTRY.google[quality];
      }
      return MODEL_REGISTRY.ollama[quality];
    }

    // Default to Google
    return MODEL_REGISTRY.google[quality];
  }

  /**
   * Get model for specific task category
   */
  async getModelForTask(
    task: TaskCategory,
    provider?: ModelProvider
  ): Promise<string> {
    const quality = TASK_QUALITY_MAP[task];
    return this.getModel(quality, provider);
  }

  /**
   * Get AI instance with appropriate model
   */
  async getAIInstance(
    provider?: ModelProvider
  ) {
    const effectiveProvider = provider || this.provider;

    // Check if we should use Ollama
    if (effectiveProvider === 'ollama' || effectiveProvider === 'auto') {
      const isOllamaAvailable = await this.checkOllamaAvailability();
      
      if (isOllamaAvailable) {
        try {
          const { ollamaAi } = await import('./ollama.config');
          return ollamaAi;
        } catch (error) {
          console.warn('⚠️ Failed to load Ollama AI, using Google Gemini');
        }
      }
    }

    // Default to Google AI
    return ai;
  }

  /**
   * Generate with automatic model selection
   */
  async generate(options: {
    prompt: string;
    task?: TaskCategory;
    quality?: ModelQuality;
    provider?: ModelProvider;
    config?: any;
    output?: any;
  }) {
    const { prompt, task, quality, provider, config, output } = options;

    // Determine model
    let model: string;
    if (task) {
      model = await this.getModelForTask(task, provider);
    } else {
      model = await this.getModel(quality || 'balanced', provider);
    }

    // Get AI instance
    const aiInstance = await this.getAIInstance(provider);

    // Generate
    return aiInstance.generate({
      model,
      prompt,
      config: config || {},
      output: output
    });
  }
}

/**
 * Convenience functions for direct use
 */

/**
 * Get the global model manager instance
 */
export function getModelManager(): ModelManager {
  return ModelManager.getInstance();
}

/**
 * Get model for quality tier
 */
export async function getModel(
  quality: ModelQuality = 'balanced',
  provider?: ModelProvider
): Promise<string> {
  return getModelManager().getModel(quality, provider);
}

/**
 * Get model for task category
 */
export async function getModelForTask(
  task: TaskCategory,
  provider?: ModelProvider
): Promise<string> {
  return getModelManager().getModelForTask(task, provider);
}

/**
 * Generate with automatic model selection
 */
export async function generateWithModel(options: {
  prompt: string;
  task?: TaskCategory;
  quality?: ModelQuality;
  provider?: ModelProvider;
  config?: any;
  output?: any;
}) {
  return getModelManager().generate(options);
}

/**
 * Get AI instance for specific provider
 */
export async function getAIInstance(
  provider?: ModelProvider
): Promise<typeof ai> {
  return getModelManager().getAIInstance(provider);
}

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  return getModelManager().checkOllamaAvailability();
}

/**
 * Export task categories for reference
 */
export const TASK_CATEGORIES: TaskCategory[] = [
  'drafting',
  'writing',
  'academic',
  'analysis',
  'documentation',
  'translation',
  'summarization',
  'creative',
];
