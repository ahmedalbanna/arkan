
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
  serverAddress: process.env.OLLAMA_SERVER_URL || 'http://185.190.140.93:11434/',
  
  models: {
    primary: { name: 'gemma:2b', displayName: 'Gemma 2B (Local)', ramRequirement: '2-3GB', useCase: 'General text generation' },
    lightweight: { name: 'llama3.2:1b', displayName: 'Llama 3.2 1B (Local)', ramRequirement: '1-2GB', useCase: 'Ultra-lightweight, fast responses' },
    medium: { name: 'phi3:mini', displayName: 'Phi-3 Mini (Local)', ramRequirement: '3-4GB', useCase: 'Better quality, slower on 8GB systems' },
  },
  
  defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'gemma:2b',
} as const;

/**
 * Pre-configured Genkit instance for Ollama.
 * This instance is aware of ALL our supported local models, which is crucial.
 */
export const ollamaAi = genkit({
  plugins: [
    ollama({
      models: [
        { name: OLLAMA_CONFIG.models.primary.name, type: 'generate' },
        { name: OLLAMA_CONFIG.models.lightweight.name, type: 'generate' },
        { name: OLLAMA_CONFIG.models.medium.name, type: 'generate' },
      ],
      serverAddress: OLLAMA_CONFIG.serverAddress,
    }),
  ],
  tools: allTools,
});


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
