/**
 * Prompt Management Service Tests
 * 
 * Tests for PromptManagementService - Critical component for prompt management
 */

import { PromptManagementService } from '../prompt-management-service';
import type { PromptConfiguration } from '../../lib/models/prompt-config';

describe('PromptManagementService', () => {
  let service: PromptManagementService;
  let mockPrompt: PromptConfiguration;

  beforeEach(() => {
    service = new PromptManagementService();
    jest.clearAllMocks();

    mockPrompt = {
      id: 'prompt_test_001',
      name: 'test-prompt',
      description: 'Test prompt template',
      template: 'Write about {{topic}} in {{style}} style.',
      variables: [
        { name: 'topic', type: 'string', required: true },
        { name: 'style', type: 'string', required: false, default: 'formal' },
      ],
      version: '1.0.0',
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('createPrompt', () => {
    it('should create new prompt', async () => {
      const result = await service.createPrompt(mockPrompt);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('test-prompt');
    });

    it('should validate template syntax', async () => {
      const invalidPrompt = { ...mockPrompt, template: '{{unclosed' };

      await expect(service.createPrompt(invalidPrompt)).rejects.toThrow();
    });
  });

  describe('getPrompt', () => {
    it('should retrieve prompt by ID', async () => {
      const result = await service.getPrompt('prompt_test_001');

      expect(result).toBeDefined();
      expect(result?.id).toBe('prompt_test_001');
    });

    it('should retrieve specific version', async () => {
      const result = await service.getPrompt('prompt_test_001', '1.0.0');

      expect(result?.version).toBe('1.0.0');
    });
  });

  describe('updatePrompt', () => {
    it('should update prompt template', async () => {
      const updates = { template: 'Updated: {{topic}}' };

      const result = await service.updatePrompt('prompt_test_001', updates);

      expect(result.template).toBe('Updated: {{topic}}');
    });

    it('should create version history', async () => {
      await service.updatePrompt('prompt_test_001', { template: 'v2' });

      const versions = await service.getPromptVersions('prompt_test_001');
      expect(versions.length).toBeGreaterThan(0);
    });
  });

  describe('renderPrompt', () => {
    it('should render template with variables', async () => {
      const result = await service.renderPrompt('prompt_test_001', {
        topic: 'AI',
        style: 'casual',
      });

      expect(result).toBe('Write about AI in casual style.');
    });

    it('should use default values for missing variables', async () => {
      const result = await service.renderPrompt('prompt_test_001', {
        topic: 'AI',
      });

      expect(result).toBe('Write about AI in formal style.');
    });

    it('should validate required variables', async () => {
      await expect(
        service.renderPrompt('prompt_test_001', {})
      ).rejects.toThrow();
    });
  });

  describe('validatePrompt', () => {
    it('should validate correct prompt', () => {
      const result = service.validatePrompt(mockPrompt);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect template errors', () => {
      const invalid = { ...mockPrompt, template: '{{unclosed' };

      const result = service.validatePrompt(invalid);

      expect(result.valid).toBe(false);
    });
  });
});
