/**
 * Flow Config Service Tests
 * 
 * Tests for FlowConfigService - Critical component for dynamic flow management
 */

import { FlowConfigService } from '../flow-config-service';
import type { FlowConfiguration } from '../../lib/models/flow-config';
import { z } from 'zod';

// Mock Firestore
jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
      add: jest.fn(),
    })),
  })),
}));

describe('FlowConfigService', () => {
  let service: FlowConfigService;
  let mockFlowConfig: FlowConfiguration;

  beforeEach(() => {
    service = new FlowConfigService();
    jest.clearAllMocks();

    mockFlowConfig = {
      id: 'flow_test_001',
      name: 'test-flow',
      description: 'Test flow for unit testing',
      version: '1.0.0',
      tags: ['test', 'unit'],
      status: 'active',
      inputSchema: z.object({
        input: z.string(),
      }),
      outputSchema: z.object({
        output: z.string(),
      }),
      steps: [
        {
          id: 'step_1',
          name: 'Test Step',
          type: 'generate',
          config: {
            prompt: 'Test prompt',
            model: 'gemini-2.0-flash-exp',
          },
        },
      ],
      outputMapping: {
        output: 'step_1.output',
      },
      config: {
        maxRetries: 3,
        timeout: 30000,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('createFlow', () => {
    it('should create a new flow configuration', async () => {
      const result = await service.createFlow(mockFlowConfig);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockFlowConfig.id);
      expect(result.name).toBe(mockFlowConfig.name);
      expect(result.version).toBe('1.0.0');
    });

    it('should validate flow configuration before creation', async () => {
      const invalidConfig = { ...mockFlowConfig, steps: [] };

      await expect(service.createFlow(invalidConfig as any)).rejects.toThrow();
    });

    it('should generate unique ID if not provided', async () => {
      const configWithoutId = { ...mockFlowConfig };
      delete (configWithoutId as any).id;

      const result = await service.createFlow(configWithoutId);

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^flow_/);
    });
  });

  describe('getFlow', () => {
    it('should retrieve flow by ID', async () => {
      const result = await service.getFlow('flow_test_001');

      expect(result).toBeDefined();
      expect(result?.id).toBe('flow_test_001');
    });

    it('should return null for non-existent flow', async () => {
      const result = await service.getFlow('non_existent');

      expect(result).toBeNull();
    });

    it('should retrieve specific version', async () => {
      const result = await service.getFlow('flow_test_001', '1.0.0');

      expect(result).toBeDefined();
      expect(result?.version).toBe('1.0.0');
    });
  });

  describe('updateFlow', () => {
    it('should update existing flow', async () => {
      const updates = {
        description: 'Updated description',
        tags: ['test', 'unit', 'updated'],
      };

      const result = await service.updateFlow('flow_test_001', updates);

      expect(result).toBeDefined();
      expect(result.description).toBe('Updated description');
      expect(result.tags).toContain('updated');
    });

    it('should increment version on update', async () => {
      const updates = { description: 'Version bump' };

      const result = await service.updateFlow('flow_test_001', updates);

      expect(result.version).not.toBe('1.0.0');
    });

    it('should create version history', async () => {
      const updates = { description: 'Version history test' };

      await service.updateFlow('flow_test_001', updates);

      const history = await service.getFlowVersions('flow_test_001');
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('deleteFlow', () => {
    it('should soft delete flow', async () => {
      await service.deleteFlow('flow_test_001');

      const flow = await service.getFlow('flow_test_001');
      expect(flow?.status).toBe('deleted');
    });

    it('should prevent deletion of active flows without force flag', async () => {
      await expect(
        service.deleteFlow('flow_test_001', false)
      ).rejects.toThrow();
    });

    it('should allow forced deletion', async () => {
      await service.deleteFlow('flow_test_001', true);

      const flow = await service.getFlow('flow_test_001');
      expect(flow).toBeNull();
    });
  });

  describe('listFlows', () => {
    it('should list all active flows', async () => {
      const result = await service.listFlows({ status: 'active' });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by tags', async () => {
      const result = await service.listFlows({ tags: ['test'] });

      expect(result.every((flow) => flow.tags.includes('test'))).toBe(true);
    });

    it('should search by name', async () => {
      const result = await service.listFlows({ search: 'test' });

      expect(result.every((flow) => flow.name.includes('test'))).toBe(true);
    });

    it('should paginate results', async () => {
      const result = await service.listFlows({ limit: 10, offset: 0 });

      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('validateFlow', () => {
    it('should validate correct flow configuration', () => {
      const result = service.validateFlow(mockFlowConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const invalidConfig = { ...mockFlowConfig };
      delete (invalidConfig as any).name;

      const result = service.validateFlow(invalidConfig as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('name'))).toBe(true);
    });

    it('should validate step configuration', () => {
      const invalidConfig = {
        ...mockFlowConfig,
        steps: [{ id: 'step_1', type: 'invalid_type' }],
      };

      const result = service.validateFlow(invalidConfig as any);

      expect(result.valid).toBe(false);
    });

    it('should validate step references', () => {
      const invalidConfig = {
        ...mockFlowConfig,
        outputMapping: {
          output: 'non_existent_step.output',
        },
      };

      const result = service.validateFlow(invalidConfig as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('step reference'))).toBe(
        true
      );
    });
  });

  describe('getFlowStatistics', () => {
    it('should return flow execution statistics', async () => {
      const stats = await service.getFlowStatistics('flow_test_001');

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('executionCount');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('avgDuration');
    });

    it('should calculate success rate correctly', async () => {
      const stats = await service.getFlowStatistics('flow_test_001');

      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);
    });
  });

  describe('cloneFlow', () => {
    it('should clone existing flow with new ID', async () => {
      const cloned = await service.cloneFlow('flow_test_001', {
        name: 'cloned-flow',
      });

      expect(cloned.id).not.toBe(mockFlowConfig.id);
      expect(cloned.name).toBe('cloned-flow');
      expect(cloned.steps).toEqual(mockFlowConfig.steps);
    });

    it('should reset version to 1.0.0', async () => {
      const cloned = await service.cloneFlow('flow_test_001');

      expect(cloned.version).toBe('1.0.0');
    });
  });

  describe('exportFlow', () => {
    it('should export flow as JSON', async () => {
      const exported = await service.exportFlow('flow_test_001');

      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed.id).toBe('flow_test_001');
    });

    it('should include all flow data', async () => {
      const exported = await service.exportFlow('flow_test_001');
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('steps');
      expect(parsed).toHaveProperty('inputSchema');
      expect(parsed).toHaveProperty('outputSchema');
    });
  });

  describe('importFlow', () => {
    it('should import flow from JSON', async () => {
      const jsonData = JSON.stringify(mockFlowConfig);
      const imported = await service.importFlow(jsonData);

      expect(imported.name).toBe(mockFlowConfig.name);
      expect(imported.steps).toEqual(mockFlowConfig.steps);
    });

    it('should validate imported flow', async () => {
      const invalidJson = JSON.stringify({ invalid: 'data' });

      await expect(service.importFlow(invalidJson)).rejects.toThrow();
    });
  });

  describe('caching', () => {
    it('should cache frequently accessed flows', async () => {
      await service.getFlow('flow_test_001');
      await service.getFlow('flow_test_001');

      // Second call should be from cache (faster)
      const start = Date.now();
      await service.getFlow('flow_test_001');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10); // Cache hit should be < 10ms
    });

    it('should invalidate cache on update', async () => {
      await service.getFlow('flow_test_001');
      await service.updateFlow('flow_test_001', { description: 'Updated' });

      const flow = await service.getFlow('flow_test_001');
      expect(flow?.description).toBe('Updated');
    });
  });
});
