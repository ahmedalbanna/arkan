/**
 * Tests for Unified Model Manager
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  ModelManager, 
  getModel, 
  getModelForTask,
  MODEL_REGISTRY,
  type ModelQuality,
  type TaskCategory,
} from '../model-manager';

describe('ModelManager', () => {
  let manager: ModelManager;

  beforeEach(() => {
    manager = ModelManager.getInstance();
    manager.resetOllamaCheck();
  });

  describe('getModel', () => {
    it('should return correct Google model for fast quality', async () => {
      const model = await getModel('fast', 'google');
      expect(model).toBe('googleai/gemini-2.5-flash-lite');
    });

    it('should return correct Google model for balanced quality', async () => {
      const model = await getModel('balanced', 'google');
      expect(model).toBe('googleai/gemini-2.0-flash-lite');
    });

    it('should return correct Google model for quality tier', async () => {
      const model = await getModel('quality', 'google');
      expect(model).toBe('googleai/gemini-2.0-flash-exp');
    });

    it('should return correct Ollama model for fast quality', async () => {
      const model = await getModel('fast', 'ollama');
      expect(model).toMatch(/llama3\.2:1b|googleai/); // Falls back to Google if Ollama unavailable
    });

    it('should return correct Ollama model for balanced quality', async () => {
      const model = await getModel('balanced', 'ollama');
      expect(model).toMatch(/gemma:2b|googleai/); // Falls back to Google if Ollama unavailable
    });

    it('should use default balanced quality when not specified', async () => {
      const model = await getModel();
      expect(model).toBeTruthy();
      expect(typeof model).toBe('string');
    });
  });

  describe('getModelForTask', () => {
    const testCases: Array<[TaskCategory, ModelQuality]> = [
      ['drafting', 'fast'],
      ['writing', 'balanced'],
      ['academic', 'quality'],
      ['analysis', 'quality'],
      ['documentation', 'quality'],
      ['translation', 'balanced'],
      ['summarization', 'fast'],
      ['creative', 'quality'],
    ];

    testCases.forEach(([task, expectedQuality]) => {
      it(`should map ${task} to ${expectedQuality} quality`, async () => {
        const model = await getModelForTask(task, 'google');
        const expectedModel = MODEL_REGISTRY.google[expectedQuality];
        expect(model).toBe(expectedModel);
      });
    });
  });

  describe('Model Registry', () => {
    it('should have all quality tiers for Google', () => {
      expect(MODEL_REGISTRY.google.fast).toBeDefined();
      expect(MODEL_REGISTRY.google.balanced).toBeDefined();
      expect(MODEL_REGISTRY.google.quality).toBeDefined();
      expect(MODEL_REGISTRY.google.premium).toBeDefined();
    });

    it('should have all quality tiers for Ollama', () => {
      expect(MODEL_REGISTRY.ollama.fast).toBeDefined();
      expect(MODEL_REGISTRY.ollama.balanced).toBeDefined();
      expect(MODEL_REGISTRY.ollama.quality).toBeDefined();
      expect(MODEL_REGISTRY.ollama.premium).toBeDefined();
    });

    it('should use different models for different tiers', () => {
      const google = MODEL_REGISTRY.google;
      expect(google.fast).not.toBe(google.quality);
      
      const ollama = MODEL_REGISTRY.ollama;
      expect(ollama.fast).not.toBe(ollama.quality);
    });
  });

  describe('Provider fallback', () => {
    it('should fallback to Google when Ollama is unavailable', async () => {
      // Ollama likely not available in test environment
      const model = await getModel('balanced', 'ollama');
      
      // Should either get Ollama model or fallback to Google
      const isValidModel = 
        model.includes('gemma') || 
        model.includes('googleai') ||
        model.includes('llama');
      
      expect(isValidModel).toBe(true);
    });
  });

  describe('Singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ModelManager.getInstance();
      const instance2 = ModelManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
