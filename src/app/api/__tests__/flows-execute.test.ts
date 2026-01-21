/**
 * Flow Execution API Route Tests
 * 
 * Tests for /api/flows/execute endpoint
 */

import { NextRequest } from 'next/server';
import { POST as executeFlow, GET as getNotAllowed } from '../flows/execute/route';
import * as flowService from '@/services/flow-config-service';
import { DynamicFlowExecutor } from '@/ai/flows/dynamic-flow-executor';

// Mock dependencies
jest.mock('@/services/flow-config-service');
jest.mock('@/ai/flows/dynamic-flow-executor');

describe('Flow Execution API Routes', () => {
  const mockFlow = {
    id: 'flow-123',
    name: 'Test Flow',
    version: '1.0.0',
    status: 'active' as const,
    steps: [],
    inputSchema: {},
    outputSchema: {},
  };

  const mockExecutionResult = {
    success: true,
    output: { result: 'Test output' },
    trace: {
      id: 'trace-123',
      flowId: 'flow-123',
      status: 'success' as const,
      duration: 1500,
      steps: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // POST /api/flows/execute - Execute Flow
  // ============================================================================

  describe('POST /api/flows/execute', () => {
    it('should execute flow successfully', async () => {
      (flowService.getFlow as jest.Mock).mockResolvedValue(mockFlow);
      (DynamicFlowExecutor as jest.Mock).mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(mockExecutionResult),
      }));

      const requestBody = {
        flowId: 'flow-123',
        input: { text: 'Test input' },
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.output).toEqual({ result: 'Test output' });
      expect(data.data.executionTime).toBe(1500);
    });

    it('should require flowId', async () => {
      const requestBody = {
        input: { text: 'Test' },
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('flowId is required');
    });

    it('should require input', async () => {
      const requestBody = {
        flowId: 'flow-123',
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('input is required');
    });

    it('should return 404 for non-existent flow', async () => {
      (flowService.getFlow as jest.Mock).mockResolvedValue(null);

      const requestBody = {
        flowId: 'non-existent',
        input: { text: 'Test' },
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Flow not found');
    });

    it('should reject inactive flows', async () => {
      const inactiveFlow = { ...mockFlow, status: 'draft' as const };
      (flowService.getFlow as jest.Mock).mockResolvedValue(inactiveFlow);

      const requestBody = {
        flowId: 'flow-123',
        input: { text: 'Test' },
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not active');
    });

    it('should allow inactive flows with ignoreStatus flag', async () => {
      const inactiveFlow = { ...mockFlow, status: 'draft' as const };
      (flowService.getFlow as jest.Mock).mockResolvedValue(inactiveFlow);
      (DynamicFlowExecutor as jest.Mock).mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(mockExecutionResult),
      }));

      const requestBody = {
        flowId: 'flow-123',
        input: { text: 'Test' },
        ignoreStatus: true,
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should support specific flow version', async () => {
      (flowService.getFlow as jest.Mock).mockResolvedValue(mockFlow);
      (DynamicFlowExecutor as jest.Mock).mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(mockExecutionResult),
      }));

      const requestBody = {
        flowId: 'flow-123',
        version: '2.0.0',
        input: { text: 'Test' },
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await executeFlow(request);

      expect(flowService.getFlow).toHaveBeenCalledWith('flow-123', '2.0.0');
    });

    it('should include trace when requested', async () => {
      (flowService.getFlow as jest.Mock).mockResolvedValue(mockFlow);
      (DynamicFlowExecutor as jest.Mock).mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(mockExecutionResult),
      }));

      const requestBody = {
        flowId: 'flow-123',
        input: { text: 'Test' },
        includeTrace: true,
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(data.data.trace).toBeDefined();
      expect(data.data.trace.id).toBe('trace-123');
    });

    it('should exclude trace by default', async () => {
      (flowService.getFlow as jest.Mock).mockResolvedValue(mockFlow);
      (DynamicFlowExecutor as jest.Mock).mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue(mockExecutionResult),
      }));

      const requestBody = {
        flowId: 'flow-123',
        input: { text: 'Test' },
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(data.data.trace).toBeUndefined();
    });

    it('should handle execution failures', async () => {
      (flowService.getFlow as jest.Mock).mockResolvedValue(mockFlow);
      (DynamicFlowExecutor as jest.Mock).mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue({
          success: false,
          error: { message: 'Execution error' },
          trace: { id: 'trace-123', status: 'error' },
        }),
      }));

      const requestBody = {
        flowId: 'flow-123',
        input: { text: 'Test' },
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Flow execution failed');
      expect(data.message).toBe('Execution error');
    });

    it('should handle service errors', async () => {
      (flowService.getFlow as jest.Mock).mockRejectedValue(new Error('Database error'));

      const requestBody = {
        flowId: 'flow-123',
        input: { text: 'Test' },
      };

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to execute flow');
    });
  });

  // ============================================================================
  // GET /api/flows/execute - Method Not Allowed
  // ============================================================================

  describe('GET /api/flows/execute', () => {
    it('should return 405 for GET requests', async () => {
      const response = await getNotAllowed();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Method not allowed');
      expect(data.message).toBe('Use POST to execute flows');
    });
  });
});
