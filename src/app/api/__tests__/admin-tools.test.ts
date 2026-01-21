/**
 * Admin Tools API Route Tests
 * 
 * Tests for /api/admin/tools endpoints
 */

import { NextRequest } from 'next/server';
import { GET as listTools, POST as registerTool } from '../admin/tools/route';
import * as toolService from '@/services/tool-registry-service';

// Mock the tool registry service
jest.mock('@/services/tool-registry-service');

describe('Admin Tools API Routes', () => {
  const mockTool = {
    name: 'test-tool',
    displayName: 'Test Tool',
    description: 'Test tool description',
    category: 'text-generation' as const,
    inputSchema: {
      type: 'object' as const,
      properties: { text: { type: 'string' as const } },
    },
    outputSchema: {
      type: 'object' as const,
      properties: { result: { type: 'string' as const } },
    },
    enabled: true,
    isBuiltIn: false,
    implementation: {
      type: 'genkit-flow' as const,
      flowName: 'test-flow',
    },
    metadata: {
      createdBy: 'user-123',
      updatedBy: 'user-123',
      version: '1.0.0',
      tags: ['test'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // GET /api/admin/tools - List Tools
  // ============================================================================

  describe('GET /api/admin/tools', () => {
    it('should list all tools', async () => {
      const mockTools = [mockTool];
      (toolService.listTools as jest.Mock).mockResolvedValue(mockTools);

      const request = new NextRequest('http://localhost:3000/api/admin/tools');
      const response = await listTools(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTools);
      expect(data.count).toBe(1);
      expect(toolService.listTools).toHaveBeenCalledWith({
        category: undefined,
        enabled: undefined,
        isBuiltIn: undefined,
        tags: undefined,
        limit: 50,
      });
    });

    it('should filter tools by category', async () => {
      (toolService.listTools as jest.Mock).mockResolvedValue([mockTool]);

      const request = new NextRequest('http://localhost:3000/api/admin/tools?category=text-generation');
      const response = await listTools(request);

      expect(toolService.listTools).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'text-generation' })
      );
    });

    it('should filter tools by enabled status', async () => {
      (toolService.listTools as jest.Mock).mockResolvedValue([mockTool]);

      const request = new NextRequest('http://localhost:3000/api/admin/tools?enabled=true');
      await listTools(request);

      expect(toolService.listTools).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      );
    });

    it('should filter tools by isBuiltIn', async () => {
      (toolService.listTools as jest.Mock).mockResolvedValue([mockTool]);

      const request = new NextRequest('http://localhost:3000/api/admin/tools?isBuiltIn=false');
      await listTools(request);

      expect(toolService.listTools).toHaveBeenCalledWith(
        expect.objectContaining({ isBuiltIn: false })
      );
    });

    it('should filter tools by tags', async () => {
      (toolService.listTools as jest.Mock).mockResolvedValue([mockTool]);

      const request = new NextRequest('http://localhost:3000/api/admin/tools?tags=test,production');
      await listTools(request);

      expect(toolService.listTools).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['test', 'production'] })
      );
    });

    it('should respect limit parameter', async () => {
      (toolService.listTools as jest.Mock).mockResolvedValue([mockTool]);

      const request = new NextRequest('http://localhost:3000/api/admin/tools?limit=10');
      await listTools(request);

      expect(toolService.listTools).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 })
      );
    });

    it('should search tools when search param provided', async () => {
      (toolService.searchTools as jest.Mock).mockResolvedValue([mockTool]);

      const request = new NextRequest('http://localhost:3000/api/admin/tools?search=test');
      const response = await listTools(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(toolService.searchTools).toHaveBeenCalledWith('test', 50);
    });

    it('should handle empty results', async () => {
      (toolService.listTools as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/admin/tools');
      const response = await listTools(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.count).toBe(0);
    });

    it('should handle service errors', async () => {
      (toolService.listTools as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/admin/tools');
      const response = await listTools(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to list tools');
      expect(data.message).toBe('Database error');
    });
  });

  // ============================================================================
  // POST /api/admin/tools - Register Tool
  // ============================================================================

  describe('POST /api/admin/tools', () => {
    it('should register tool successfully', async () => {
      (toolService.registerTool as jest.Mock).mockResolvedValue(mockTool);

      const requestBody = {
        name: 'test-tool',
        displayName: 'Test Tool',
        description: 'Test description',
        category: 'text-generation',
        inputSchema: { type: 'object', properties: {} },
        outputSchema: { type: 'object', properties: {} },
        implementation: { type: 'genkit-flow', flowName: 'test-flow' },
      };

      const request = new NextRequest('http://localhost:3000/api/admin/tools', {
        method: 'POST',
        headers: { 'x-user-id': 'user-123' },
        body: JSON.stringify(requestBody),
      });

      const response = await registerTool(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTool);
      expect(data.message).toBe('Tool registered successfully');
    });

    it('should require name field', async () => {
      const requestBody = {
        displayName: 'Test Tool',
        category: 'text-generation',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/tools', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await registerTool(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required fields');
      expect(data.required).toContain('name');
    });

    it('should require displayName field', async () => {
      const requestBody = {
        name: 'test-tool',
        category: 'text-generation',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/tools', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await registerTool(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.required).toContain('displayName');
    });

    it('should require category field', async () => {
      const requestBody = {
        name: 'test-tool',
        displayName: 'Test Tool',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/tools', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await registerTool(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.required).toContain('category');
    });

    it('should default enabled to true', async () => {
      (toolService.registerTool as jest.Mock).mockResolvedValue(mockTool);

      const requestBody = {
        name: 'test-tool',
        displayName: 'Test',
        category: 'text-generation',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/tools', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await registerTool(request);

      expect(toolService.registerTool).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      );
    });

    it('should always set isBuiltIn to false for custom tools', async () => {
      (toolService.registerTool as jest.Mock).mockResolvedValue(mockTool);

      const requestBody = {
        name: 'test-tool',
        displayName: 'Test',
        category: 'text-generation',
        isBuiltIn: true, // Should be ignored
      };

      const request = new NextRequest('http://localhost:3000/api/admin/tools', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await registerTool(request);

      expect(toolService.registerTool).toHaveBeenCalledWith(
        expect.objectContaining({ isBuiltIn: false })
      );
    });

    it('should use system as default user', async () => {
      (toolService.registerTool as jest.Mock).mockResolvedValue(mockTool);

      const requestBody = {
        name: 'test-tool',
        displayName: 'Test',
        category: 'text-generation',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/tools', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await registerTool(request);

      expect(toolService.registerTool).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            createdBy: 'system',
            updatedBy: 'system',
          }),
        })
      );
    });

    it('should default version to 1.0.0', async () => {
      (toolService.registerTool as jest.Mock).mockResolvedValue(mockTool);

      const requestBody = {
        name: 'test-tool',
        displayName: 'Test',
        category: 'text-generation',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/tools', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await registerTool(request);

      expect(toolService.registerTool).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ version: '1.0.0' }),
        })
      );
    });

    it('should handle service errors', async () => {
      (toolService.registerTool as jest.Mock).mockRejectedValue(new Error('Registration failed'));

      const requestBody = {
        name: 'test-tool',
        displayName: 'Test',
        category: 'text-generation',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/tools', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await registerTool(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to register tool');
    });
  });
});
