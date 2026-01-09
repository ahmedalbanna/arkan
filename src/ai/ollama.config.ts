/**
 * Ollama Configuration for Local LLM Support
 * 
 * This file provides configuration for running local LLM models using Ollama.
 * Suitable for resource-constrained environments (8GB RAM).
 * 
 * Recommended models:
 * - gemma:2b (2-3GB RAM) - Best for 8GB systems
 * - phi3:mini (3-4GB RAM) - Alternative option
 * - llama3.2:1b (1-2GB RAM) - Ultra-lightweight option
 */

import { ollama } from 'genkitx-ollama';
import { genkit } from 'genkit';
import { allTools } from './tools';

/**
 * Ollama server configuration
 */
export const OLLAMA_CONFIG = {
  // Default Ollama server address
  serverAddress: process.env.OLLAMA_SERVER_URL || 'http://localhost:11434',
  
  // Recommended models for 8GB RAM
  models: {
    // Primary model - Best balance for 8GB RAM
    primary: {
      name: 'gemma:2b',
      displayName: 'Gemma 2B (Local)',
      ramRequirement: '2-3GB',
      useCase: 'General text generation, suitable for most tasks',
    },
    
    // Lightweight alternative
    lightweight: {
      name: 'llama3.2:1b',
      displayName: 'Llama 3.2 1B (Local)',
      ramRequirement: '1-2GB',
      useCase: 'Ultra-lightweight, fast responses',
    },
    
    // Medium model (use with caution on 8GB)
    medium: {
      name: 'phi3:mini',
      displayName: 'Phi-3 Mini (Local)',
      ramRequirement: '3-4GB',
      useCase: 'Better quality, slower on 8GB systems',
    },
  },
  
  // Default model selection
  defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'gemma:2b',
} as const;

/**
 * Creates an Ollama-configured Genkit instance
 * 
 * @param modelName - The Ollama model to use (default: gemma:2b)
 * @returns Configured Genkit instance with Ollama support
 */
export function configureOllamaAi(modelName?: string) {
  const selectedModel = modelName || OLLAMA_CONFIG.defaultModel;
  
  return genkit({
    plugins: [
      ollama({
        models: [
          {
            name: selectedModel,
            type: 'chat',
          },
        ],
        serverAddress: OLLAMA_CONFIG.serverAddress,
      }),
    ],
    tools: Object.values(allTools),
  });
}

/**
 * Standalone Ollama AI instance for local inference
 * Uses the default model (gemma:2b) optimized for 8GB RAM
 */
export const ollamaAi = configureOllamaAi();

/**
 * Model selector utility - returns appropriate model based on task
 */
export function selectOllamaModel(task: 'fast' | 'balanced' | 'quality'): string {
  switch (task) {
    case 'fast':
      return OLLAMA_CONFIG.models.lightweight.name;
    case 'balanced':
      return OLLAMA_CONFIG.models.primary.name;
    case 'quality':
      return OLLAMA_CONFIG.models.medium.name;
    default:
      return OLLAMA_CONFIG.defaultModel;
  }
}

/**
 * Check if Ollama server is available
 */
export async function checkOllamaAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_CONFIG.serverAddress}/api/tags`);
    return response.ok;
  } catch (error) {
    console.warn('Ollama server not available:', error);
    return false;
  }
}

/**
 * Get list of available models from Ollama server
 */
export async function getAvailableOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_CONFIG.serverAddress}/api/tags`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error);
    return [];
  }
}
