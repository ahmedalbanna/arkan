/**
 * Integration Tests for Flow Execution APIs
 */

import { NextRequest } from 'next/server';
import { POST as executeFlow } from '../flows/execute/route';
import { POST as testFlow } from '../flows/test/route';

// Mock dependencies
jest.mock('@/ai/flows/dynamic-flow-executor');
jest.mock('@/services/flow-config-service');

describe('Flow Execution API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/flows/execute', () => {
    it('should execute a flow successfully', async () => {
      const { dynamicFlowExecutor } = require('@/ai/flows/dynamic-flow-executor');
      
      const mockResult = {
        success: true,
        executionId: 'exec_test123',
        traceId: 'trace_test123',
        output: {
          result: 'Execution result',
        },
        steps: [
          {
            stepId: 'step1',
            name: 'Test Step',
            status: 'completed',
            duration: 100,
          },
        ],
      };
      
      dynamicFlowExecutor.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify({
          flowName: 'test-flow',
          payload: {
            query: 'Test query',
          },
          userId: 'test-user',
          enableTracing: true,
        }),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.executionId).toBe('exec_test123');
      expect(data.traceId).toBe('trace_test123');
      expect(dynamicFlowExecutor).toHaveBeenCalledWith({
        flowName: 'test-flow',
        payload: { query: 'Test query' },
        userId: 'test-user',
        requestId: expect.any(String),
        enableTracing: true,
      });
    });

    it('should return 400 when flowName is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify({
          payload: { query: 'Test' },
        }),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Flow name is required');
    });

    it('should return 400 when payload is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify({
          flowName: 'test-flow',
        }),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Payload object is required');
    });

    it('should handle execution errors', async () => {
      const { dynamicFlowExecutor } = require('@/ai/flows/dynamic-flow-executor');
      
      dynamicFlowExecutor.mockRejectedValue(new Error('Execution failed'));

      const request = new NextRequest('http://localhost:3000/api/flows/execute', {
        method: 'POST',
        body: JSON.stringify({
          flowName: 'test-flow',
          payload: { query: 'Test' },
        }),
      });

      const response = await executeFlow(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Execution failed');
    });
  });

  describe('POST /api/flows/test', () => {
    it('should test a flow configuration', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      const { dynamicFlowExecutor } = require('@/ai/flows/dynamic-flow-executor');
      
      const mockTempFlow = {
        id: 'flow_temp123',
        name: 'test_temp_flow',
      };
      
      const mockResult = {
        success: true,
        output: { result: 'Test result' },
      };
      
      flowConfigService.createFlow.mockResolvedValue(mockTempFlow);
      flowConfigService.deleteFlow.mockResolvedValue(undefined);
      flowConfigService.listFlows.mockResolvedValue([]);
      dynamicFlowExecutor.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/flows/test', {
        method: 'POST',
        body: JSON.stringify({
          flowConfig: {
            name: 'temp-test-flow',
            displayName: 'Temp Test Flow',
            steps: [
              {
                id: 'step1',
                name: 'Format Step',
                type: 'format',
                handler: 'format',
                inputMapping: {},
                outputMapping: {},
              },
            ],
          },
          payload: {
            text: 'test input',
          },
        }),
      });

      const response = await testFlow(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.result).toBeDefined();
      expect(flowConfigService.createFlow).toHaveBeenCalled();
      expect(dynamicFlowExecutor).toHaveBeenCalled();
      expect(flowConfigService.deleteFlow).toHaveBeenCalledWith(mockTempFlow.id);
    });

    it('should return 400 when flowConfig is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/flows/test', {
        method: 'POST',
        body: JSON.stringify({
          payload: { test: 'data' },
        }),
      });

      const response = await testFlow(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Flow configuration is required');
    });

    it('should cleanup temporary flow on error', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      const { dynamicFlowExecutor } = require('@/ai/flows/dynamic-flow-executor');
      
      const mockTempFlow = {
        id: 'flow_temp123',
        name: 'test_temp_flow',
      };
      
      flowConfigService.createFlow.mockResolvedValue(mockTempFlow);
      flowConfigService.listFlows.mockResolvedValue([mockTempFlow]);
      flowConfigService.deleteFlow.mockResolvedValue(undefined);
      dynamicFlowExecutor.mockRejectedValue(new Error('Test execution failed'));

      const request = new NextRequest('http://localhost:3000/api/flows/test', {
        method: 'POST',
        body: JSON.stringify({
          flowConfig: {
            name: 'temp-test-flow',
            steps: [],
          },
          payload: { test: 'data' },
        }),
      });

      const response = await testFlow(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      // Verify cleanup was attempted
      expect(flowConfigService.listFlows).toHaveBeenCalled();
    });
  });
});
