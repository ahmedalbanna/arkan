/**
 * Tool Registry Service Tests
 * 
 * Tests for ToolRegistryService - Critical component for tool management
 */

import { ToolRegistryService } from '../tool-registry-service';
import type { ToolConfiguration, ToolCategory } from '@/lib/models/tool-config';
import { adminDb } from '@/lib/firebase/server-init';

// Mock Firebase Admin
jest.mock('@/lib/firebase/server-init', () => ({
  adminDb: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
  },
}));

describe('ToolRegistryService', () => {
  let service: ToolRegistryService;
  let mockToolRef: any;
  let mockCollection: any;

  const mockTool: ToolConfiguration = {
    name: 'test-tool',
    displayName: 'Test Tool',
    description: 'A test tool for unit testing',
    category: 'text-generation' as ToolCategory,
    version: '1.0.0',
    enabled: true,
    isBuiltIn: false,
    schema: {
      input: {
        type: 'object',
        properties: {
          text: { type: 'string' },
        },
        required: ['text'],
      },
      output: {
        type: 'object',
        properties: {
          result: { type: 'string' },
        },
      },
    },
    implementation: {
      type: 'genkit-flow',
      flowName: 'test-flow',
    },
    config: {
      timeout: 30000,
      retries: 3,
    },
    tags: ['test', 'utility'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'system',
    updatedBy: 'system',
    stats: {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalExecutionTime: 0,
      avgExecutionTime: 0,
    },
  };

  beforeEach(() => {
    service = new ToolRegistryService();
    jest.clearAllMocks();

    // Setup mock Firestore references
    mockToolRef = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockCollection = {
      doc: jest.fn().mockReturnValue(mockToolRef),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);
  });

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  describe('registerTool', () => {
    it('should register a new tool successfully', async () => {
      const toolData = {
        name: 'new-tool',
        displayName: 'New Tool',
        description: 'A new tool',
        category: 'text-generation' as ToolCategory,
        schema: mockTool.schema,
        implementation: mockTool.implementation,
        config: mockTool.config,
      };

      const result = await service.registerTool(toolData);

      expect(result.name).toBe('new-tool');
      expect(result.enabled).toBe(true);
      expect(result.version).toBe('1.0.0');
      expect(result.stats?.totalCalls).toBe(0);
      expect(mockToolRef.set).toHaveBeenCalled();
    });

    it('should set default values for optional fields', async () => {
      const minimalTool = {
        name: 'minimal-tool',
        displayName: 'Minimal',
        description: 'Minimal tool',
        category: 'analysis' as ToolCategory,
        schema: mockTool.schema,
        implementation: mockTool.implementation,
      };

      const result = await service.registerTool(minimalTool);

      expect(result.enabled).toBe(true);
      expect(result.isBuiltIn).toBe(false);
      expect(result.version).toBe('1.0.0');
      expect(result.createdBy).toBe('system');
    });

    it('should handle registration errors', async () => {
      mockToolRef.set.mockRejectedValue(new Error('Firestore error'));

      await expect(
        service.registerTool(mockTool)
      ).rejects.toThrow('Failed to register tool');
    });
  });

  describe('getTool', () => {
    it('should retrieve an existing tool', async () => {
      mockToolRef.get.mockResolvedValue({
        exists: true,
        data: () => mockTool,
      });

      const result = await service.getTool('test-tool');

      expect(result).toBeDefined();
      expect(result?.name).toBe('test-tool');
      expect(mockCollection.doc).toHaveBeenCalledWith('test-tool');
    });

    it('should return null for non-existent tool', async () => {
      mockToolRef.get.mockResolvedValue({
        exists: false,
      });

      const result = await service.getTool('non-existent');

      expect(result).toBeNull();
    });

    it('should handle retrieval errors', async () => {
      mockToolRef.get.mockRejectedValue(new Error('Database error'));

      await expect(
        service.getTool('test-tool')
      ).rejects.toThrow('Failed to get tool');
    });
  });

  describe('updateTool', () => {
    beforeEach(() => {
      mockToolRef.get.mockResolvedValue({
        exists: true,
        data: () => mockTool,
      });
    });

    it('should update tool successfully', async () => {
      const updates = {
        displayName: 'Updated Tool',
        description: 'Updated description',
      };

      const result = await service.updateTool('test-tool', updates);

      expect(result.displayName).toBe('Updated Tool');
      expect(result.description).toBe('Updated description');
      expect(mockToolRef.update).toHaveBeenCalled();
    });

    it('should update the updatedAt timestamp', async () => {
      const beforeUpdate = new Date();
      
      const result = await service.updateTool('test-tool', {
        displayName: 'New Name',
      });

      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('should throw error for non-existent tool', async () => {
      mockToolRef.get.mockResolvedValue({
        exists: false,
      });

      await expect(
        service.updateTool('non-existent', { displayName: 'Test' })
      ).rejects.toThrow('Tool not found: non-existent');
    });

    it('should handle update errors', async () => {
      mockToolRef.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.updateTool('test-tool', { displayName: 'Test' })
      ).rejects.toThrow('Failed to update tool');
    });
  });

  describe('deleteTool', () => {
    it('should delete a custom tool', async () => {
      mockToolRef.get.mockResolvedValue({
        exists: true,
        data: () => ({ ...mockTool, isBuiltIn: false }),
      });

      await service.deleteTool('test-tool');

      expect(mockToolRef.delete).toHaveBeenCalled();
    });

    it('should prevent deletion of built-in tools', async () => {
      mockToolRef.get.mockResolvedValue({
        exists: true,
        data: () => ({ ...mockTool, isBuiltIn: true }),
      });

      await expect(
        service.deleteTool('built-in-tool')
      ).rejects.toThrow('Cannot delete built-in tool');

      expect(mockToolRef.delete).not.toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      mockToolRef.get.mockResolvedValue({
        exists: true,
        data: () => mockTool,
      });
      mockToolRef.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(
        service.deleteTool('test-tool')
      ).rejects.toThrow('Failed to delete tool');
    });
  });

  // ============================================================================
  // Query Operations
  // ============================================================================

  describe('listTools', () => {
    const mockTools = [
      { ...mockTool, name: 'tool1', category: 'text-generation' as ToolCategory },
      { ...mockTool, name: 'tool2', category: 'analysis' as ToolCategory },
      { ...mockTool, name: 'tool3', category: 'text-generation' as ToolCategory, enabled: false },
    ];

    beforeEach(() => {
      mockCollection.get.mockResolvedValue({
        docs: mockTools.map(tool => ({
          data: () => tool,
        })),
      });
    });

    it('should list all tools without filters', async () => {
      const result = await service.listTools();

      expect(result).toHaveLength(3);
      expect(mockCollection.orderBy).toHaveBeenCalledWith('updatedAt', 'desc');
    });

    it('should filter by category', async () => {
      await service.listTools({ category: 'text-generation' as ToolCategory });

      expect(mockCollection.where).toHaveBeenCalledWith('category', '==', 'text-generation');
    });

    it('should filter by enabled status', async () => {
      await service.listTools({ enabled: true });

      expect(mockCollection.where).toHaveBeenCalledWith('enabled', '==', true);
    });

    it('should filter by isBuiltIn', async () => {
      await service.listTools({ isBuiltIn: false });

      expect(mockCollection.where).toHaveBeenCalledWith('isBuiltIn', '==', false);
    });

    it('should filter by tags', async () => {
      await service.listTools({ tags: ['test', 'utility'] });

      expect(mockCollection.where).toHaveBeenCalledWith('tags', 'array-contains-any', ['test', 'utility']);
    });

    it('should apply limit', async () => {
      await service.listTools({ limit: 10 });

      expect(mockCollection.limit).toHaveBeenCalledWith(10);
    });

    it('should handle query errors', async () => {
      mockCollection.get.mockRejectedValue(new Error('Query failed'));

      await expect(
        service.listTools()
      ).rejects.toThrow('Failed to list tools');
    });
  });

  describe('searchTools', () => {
    const mockTools = [
      { ...mockTool, name: 'text-tool', displayName: 'Text Tool', description: 'Process text' },
      { ...mockTool, name: 'image-tool', displayName: 'Image Tool', description: 'Process images' },
      { ...mockTool, name: 'data-tool', displayName: 'Data Tool', description: 'Analyze data', tags: ['analysis', 'text'] },
    ];

    beforeEach(() => {
      mockCollection.get.mockResolvedValue({
        docs: mockTools.map(tool => ({
          data: () => tool,
        })),
      });
    });

    it('should search by name', async () => {
      const result = await service.searchTools('text');

      expect(result.length).toBeGreaterThan(0);
      expect(result.some(t => t.name.includes('text'))).toBe(true);
    });

    it('should search by display name', async () => {
      const result = await service.searchTools('image');

      expect(result.some(t => t.displayName.toLowerCase().includes('image'))).toBe(true);
    });

    it('should search by description', async () => {
      const result = await service.searchTools('analyze');

      expect(result.some(t => t.description.toLowerCase().includes('analyze'))).toBe(true);
    });

    it('should search by tags', async () => {
      const result = await service.searchTools('analysis');

      expect(result.some(t => t.tags?.includes('analysis'))).toBe(true);
    });

    it('should be case insensitive', async () => {
      const result = await service.searchTools('TEXT');

      expect(result.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      const result = await service.searchTools('tool', 2);

      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should handle search errors', async () => {
      mockCollection.get.mockRejectedValue(new Error('Search failed'));

      await expect(
        service.searchTools('test')
      ).rejects.toThrow('Failed to search tools');
    });
  });

  describe('setToolEnabled', () => {
    it('should enable a tool', async () => {
      await service.setToolEnabled('test-tool', true);

      expect(mockToolRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        })
      );
    });

    it('should disable a tool', async () => {
      await service.setToolEnabled('test-tool', false);

      expect(mockToolRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should handle enable/disable errors', async () => {
      mockToolRef.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        service.setToolEnabled('test-tool', true)
      ).rejects.toThrow('Failed to set tool enabled');
    });
  });

  // ============================================================================
  // Statistics
  // ============================================================================

  describe('updateStats', () => {
    it('should update stats on successful execution', async () => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockTool,
        }),
        update: jest.fn(),
      };

      (adminDb.runTransaction as jest.Mock).mockImplementation(
        async (callback) => callback(mockTransaction)
      );

      await service.updateStats('test-tool', true, 1500);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        mockToolRef,
        expect.objectContaining({
          stats: expect.objectContaining({
            totalCalls: 1,
            successfulCalls: 1,
            failedCalls: 0,
            totalExecutionTime: 1500,
            avgExecutionTime: 1500,
          }),
        })
      );
    });

    it('should update stats on failed execution', async () => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockTool,
        }),
        update: jest.fn(),
      };

      (adminDb.runTransaction as jest.Mock).mockImplementation(
        async (callback) => callback(mockTransaction)
      );

      await service.updateStats('test-tool', false, 500);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        mockToolRef,
        expect.objectContaining({
          stats: expect.objectContaining({
            totalCalls: 1,
            successfulCalls: 0,
            failedCalls: 1,
          }),
        })
      );
    });

    it('should calculate average execution time correctly', async () => {
      const toolWithStats = {
        ...mockTool,
        stats: {
          totalCalls: 2,
          successfulCalls: 2,
          failedCalls: 0,
          totalExecutionTime: 3000,
          avgExecutionTime: 1500,
        },
      };

      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => toolWithStats,
        }),
        update: jest.fn(),
      };

      (adminDb.runTransaction as jest.Mock).mockImplementation(
        async (callback) => callback(mockTransaction)
      );

      await service.updateStats('test-tool', true, 1500);

      expect(mockTransaction.update).toHaveBeenCalledWith(
        mockToolRef,
        expect.objectContaining({
          stats: expect.objectContaining({
            totalCalls: 3,
            totalExecutionTime: 4500,
            avgExecutionTime: 1500, // 4500 / 3
          }),
        })
      );
    });

    it('should handle non-existent tool gracefully', async () => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
        update: jest.fn(),
      };

      (adminDb.runTransaction as jest.Mock).mockImplementation(
        async (callback) => callback(mockTransaction)
      );

      // Should not throw error
      await service.updateStats('non-existent', true, 1000);

      expect(mockTransaction.update).not.toHaveBeenCalled();
    });

    it('should not throw on stats update error', async () => {
      (adminDb.runTransaction as jest.Mock).mockRejectedValue(
        new Error('Transaction failed')
      );

      // Should not throw - stats update is non-critical
      await expect(
        service.updateStats('test-tool', true, 1000)
      ).resolves.not.toThrow();
    });
  });

  describe('getToolStats', () => {
    it('should return tool statistics', async () => {
      mockToolRef.get.mockResolvedValue({
        exists: true,
        data: () => mockTool,
      });

      const result = await service.getToolStats('test-tool');

      expect(result).toEqual(mockTool.stats);
    });

    it('should return null for non-existent tool', async () => {
      mockToolRef.get.mockResolvedValue({
        exists: false,
      });

      const result = await service.getToolStats('non-existent');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockToolRef.get.mockRejectedValue(new Error('Database error'));

      const result = await service.getToolStats('test-tool');

      expect(result).toBeNull();
    });
  });
});
