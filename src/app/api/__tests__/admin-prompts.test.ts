/**
 * Admin Prompts API Route Tests
 * 
 * Tests for /api/admin/prompts endpoints
 */

import { NextRequest } from 'next/server';
import { GET as listPrompts, POST as createPrompt } from '../admin/prompts/route';
import { GET as getPrompt, PUT as updatePrompt, DELETE as deletePrompt } from '../admin/prompts/[promptId]/route';
import * as promptService from '@/services/prompt-management-service';

// Mock the prompt management service
jest.mock('@/services/prompt-management-service');

describe('Admin Prompts API Routes', () => {
  const mockPrompt = {
    id: 'prompt-123',
    name: 'Test Prompt',
    description: 'Test prompt description',
    version: '1.0.0',
    tags: ['test'],
    status: 'active' as const,
    template: 'Hello {{name}}',
    variables: [
      { name: 'name', type: 'string' as const, required: true },
    ],
    inputSchema: {
      type: 'object' as const,
      properties: { name: { type: 'string' as const } },
    },
    outputFormat: { type: 'text' as const },
    examples: [],
    metadata: {
      createdBy: 'user-123',
      updatedBy: 'user-123',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // GET /api/admin/prompts - List Prompts
  // ============================================================================

  describe('GET /api/admin/prompts', () => {
    it('should list all prompts', async () => {
      const mockPrompts = [mockPrompt];
      (promptService.listPrompts as jest.Mock).mockResolvedValue(mockPrompts);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts');
      const response = await listPrompts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPrompts);
      expect(data.count).toBe(1);
      expect(promptService.listPrompts).toHaveBeenCalledWith({
        status: undefined,
        category: undefined,
        language: undefined,
        tags: undefined,
        limit: 50,
      });
    });

    it('should filter prompts by status', async () => {
      (promptService.listPrompts as jest.Mock).mockResolvedValue([mockPrompt]);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts?status=active');
      const response = await listPrompts(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(promptService.listPrompts).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' })
      );
    });

    it('should filter prompts by category', async () => {
      (promptService.listPrompts as jest.Mock).mockResolvedValue([mockPrompt]);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts?category=text-generation');
      const response = await listPrompts(request);

      expect(promptService.listPrompts).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'text-generation' })
      );
    });

    it('should filter prompts by language', async () => {
      (promptService.listPrompts as jest.Mock).mockResolvedValue([mockPrompt]);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts?language=en');
      const response = await listPrompts(request);

      expect(promptService.listPrompts).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'en' })
      );
    });

    it('should filter prompts by tags', async () => {
      (promptService.listPrompts as jest.Mock).mockResolvedValue([mockPrompt]);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts?tags=test,production');
      const response = await listPrompts(request);

      expect(promptService.listPrompts).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['test', 'production'] })
      );
    });

    it('should respect limit parameter', async () => {
      (promptService.listPrompts as jest.Mock).mockResolvedValue([mockPrompt]);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts?limit=10');
      const response = await listPrompts(request);

      expect(promptService.listPrompts).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 })
      );
    });

    it('should search prompts when search param provided', async () => {
      (promptService.searchPrompts as jest.Mock).mockResolvedValue([mockPrompt]);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts?search=test');
      const response = await listPrompts(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(promptService.searchPrompts).toHaveBeenCalledWith('test', 50);
    });

    it('should handle empty results', async () => {
      (promptService.listPrompts as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts');
      const response = await listPrompts(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(data.count).toBe(0);
    });

    it('should handle service errors', async () => {
      (promptService.listPrompts as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/admin/prompts');
      const response = await listPrompts(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to list prompts');
      expect(data.message).toBe('Database error');
    });
  });

  // ============================================================================
  // POST /api/admin/prompts - Create Prompt
  // ============================================================================

  describe('POST /api/admin/prompts', () => {
    it('should create prompt successfully', async () => {
      (promptService.createPrompt as jest.Mock).mockResolvedValue(mockPrompt);

      const requestBody = {
        id: 'prompt-123',
        name: 'Test Prompt',
        description: 'Test description',
        version: '1.0.0',
        template: 'Hello {{name}}',
        variables: [{ name: 'name', type: 'string', required: true }],
      };

      const request = new NextRequest('http://localhost:3000/api/admin/prompts', {
        method: 'POST',
        headers: { 'x-user-id': 'user-123', 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await createPrompt(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPrompt);
      expect(data.message).toBe('Prompt created successfully');
      expect(promptService.createPrompt).toHaveBeenCalled();
    });

    it('should require id field', async () => {
      const requestBody = {
        name: 'Test Prompt',
        version: '1.0.0',
        template: 'Hello',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createPrompt(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required fields');
      expect(data.required).toContain('id');
    });

    it('should require name field', async () => {
      const requestBody = {
        id: 'prompt-123',
        version: '1.0.0',
        template: 'Hello',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createPrompt(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.required).toContain('name');
    });

    it('should require template field', async () => {
      const requestBody = {
        id: 'prompt-123',
        name: 'Test',
        version: '1.0.0',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createPrompt(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.required).toContain('template');
    });

    it('should require version field', async () => {
      const requestBody = {
        id: 'prompt-123',
        name: 'Test',
        template: 'Hello',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createPrompt(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.required).toContain('version');
    });

    it('should use system as default user', async () => {
      (promptService.createPrompt as jest.Mock).mockResolvedValue(mockPrompt);

      const requestBody = {
        id: 'prompt-123',
        name: 'Test',
        version: '1.0.0',
        template: 'Hello',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await createPrompt(request);

      expect(promptService.createPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            createdBy: 'system',
            updatedBy: 'system',
          }),
        })
      );
    });

    it('should set draft status by default', async () => {
      (promptService.createPrompt as jest.Mock).mockResolvedValue(mockPrompt);

      const requestBody = {
        id: 'prompt-123',
        name: 'Test',
        version: '1.0.0',
        template: 'Hello',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await createPrompt(request);

      expect(promptService.createPrompt).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'draft' })
      );
    });

    it('should handle service errors', async () => {
      (promptService.createPrompt as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      const requestBody = {
        id: 'prompt-123',
        name: 'Test',
        version: '1.0.0',
        template: 'Hello',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/prompts', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await createPrompt(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create prompt');
    });
  });

  // ============================================================================
  // GET /api/admin/prompts/[promptId] - Get Prompt
  // ============================================================================

  describe('GET /api/admin/prompts/[promptId]', () => {
    it('should get prompt by ID', async () => {
      (promptService.getPromptById as jest.Mock).mockResolvedValue(mockPrompt);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts/prompt-123');
      const params = Promise.resolve({ promptId: 'prompt-123' });
      const response = await getPrompt(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPrompt);
      expect(promptService.getPromptById).toHaveBeenCalledWith('prompt-123', undefined);
    });

    it('should get specific prompt version', async () => {
      (promptService.getPromptById as jest.Mock).mockResolvedValue(mockPrompt);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts/prompt-123?version=2.0.0');
      const params = Promise.resolve({ promptId: 'prompt-123' });
      await getPrompt(request, { params });

      expect(promptService.getPromptById).toHaveBeenCalledWith('prompt-123', '2.0.0');
    });

    it('should return 404 for non-existent prompt', async () => {
      (promptService.getPromptById as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts/non-existent');
      const params = Promise.resolve({ promptId: 'non-existent' });
      const response = await getPrompt(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Prompt not found');
    });

    it('should handle service errors', async () => {
      (promptService.getPromptById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/admin/prompts/prompt-123');
      const params = Promise.resolve({ promptId: 'prompt-123' });
      const response = await getPrompt(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to get prompt');
    });
  });

  // ============================================================================
  // PUT /api/admin/prompts/[promptId] - Update Prompt
  // ============================================================================

  describe('PUT /api/admin/prompts/[promptId]', () => {
    it('should update prompt successfully', async () => {
      const updatedPrompt = { ...mockPrompt, name: 'Updated Prompt' };
      (promptService.updatePrompt as jest.Mock).mockResolvedValue(updatedPrompt);

      const requestBody = { name: 'Updated Prompt' };
      const request = new NextRequest('http://localhost:3000/api/admin/prompts/prompt-123', {
        method: 'PUT',
        headers: { 'x-user-id': 'user-123' },
        body: JSON.stringify(requestBody),
      });

      const params = Promise.resolve({ promptId: 'prompt-123' });
      const response = await updatePrompt(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedPrompt);
      expect(data.message).toBe('Prompt updated successfully');
    });

    it('should track updatedBy user', async () => {
      (promptService.updatePrompt as jest.Mock).mockResolvedValue(mockPrompt);

      const requestBody = { name: 'Updated' };
      const request = new NextRequest('http://localhost:3000/api/admin/prompts/prompt-123', {
        method: 'PUT',
        headers: { 'x-user-id': 'user-456' },
        body: JSON.stringify(requestBody),
      });

      const params = Promise.resolve({ promptId: 'prompt-123' });
      await updatePrompt(request, { params });

      expect(promptService.updatePrompt).toHaveBeenCalledWith(
        'prompt-123',
        expect.objectContaining({
          metadata: expect.objectContaining({
            updatedBy: 'user-456',
          }),
        }),
        undefined
      );
    });

    it('should accept change description from query params', async () => {
      (promptService.updatePrompt as jest.Mock).mockResolvedValue(mockPrompt);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/prompts/prompt-123?changeDescription=Updated%20template',
        {
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        }
      );

      const params = Promise.resolve({ promptId: 'prompt-123' });
      await updatePrompt(request, { params });

      expect(promptService.updatePrompt).toHaveBeenCalledWith(
        'prompt-123',
        expect.any(Object),
        'Updated template'
      );
    });

    it('should accept change description from body', async () => {
      (promptService.updatePrompt as jest.Mock).mockResolvedValue(mockPrompt);

      const requestBody = {
        name: 'Updated',
        changeDescription: 'Updated via API',
      };

      const request = new NextRequest('http://localhost:3000/api/admin/prompts/prompt-123', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      const params = Promise.resolve({ promptId: 'prompt-123' });
      await updatePrompt(request, { params });

      expect(promptService.updatePrompt).toHaveBeenCalledWith(
        'prompt-123',
        expect.any(Object),
        'Updated via API'
      );
    });

    it('should handle service errors', async () => {
      (promptService.updatePrompt as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const request = new NextRequest('http://localhost:3000/api/admin/prompts/prompt-123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });

      const params = Promise.resolve({ promptId: 'prompt-123' });
      const response = await updatePrompt(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to update prompt');
    });
  });

  // ============================================================================
  // DELETE /api/admin/prompts/[promptId] - Delete Prompt
  // ============================================================================

  describe('DELETE /api/admin/prompts/[promptId]', () => {
    it('should delete prompt successfully', async () => {
      (promptService.deletePrompt as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/admin/prompts/prompt-123', {
        method: 'DELETE',
      });

      const params = Promise.resolve({ promptId: 'prompt-123' });
      const response = await deletePrompt(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Prompt deleted successfully');
      expect(promptService.deletePrompt).toHaveBeenCalledWith('prompt-123');
    });

    it('should handle service errors', async () => {
      (promptService.deletePrompt as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const request = new NextRequest('http://localhost:3000/api/admin/prompts/prompt-123', {
        method: 'DELETE',
      });

      const params = Promise.resolve({ promptId: 'prompt-123' });
      const response = await deletePrompt(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to delete prompt');
    });
  });
});
