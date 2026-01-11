/**
 * Integration Tests for Flow Management APIs
 */

import { NextRequest } from 'next/server';
import { GET as listFlows, POST as createFlow } from '../admin/flows/route';
import { 
  GET as getFlow, 
  PUT as updateFlow, 
  DELETE as deleteFlow 
} from '../admin/flows/[flowId]/route';

// Mock Firebase and services
jest.mock('@/lib/firebase/server-init');
jest.mock('@/services/flow-config-service');

describe('Flow Management API', () => {
  let createdFlowId: string;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/flows', () => {
    it('should create a new flow', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      
      const mockFlow = {
        id: 'flow_test123',
        name: 'test-flow',
        displayName: 'Test Flow',
        version: 1,
        status: 'draft',
        steps: [],
      };
      
      flowConfigService.createFlow.mockResolvedValue(mockFlow);

      const request = new NextRequest('http://localhost:3000/api/admin/flows', {
        method: 'POST',
        body: JSON.stringify({
          name: 'test-flow',
          displayName: 'Test Flow',
          description: 'Test flow description',
          steps: [
            {
              id: 'step1',
              name: 'Test Step',
              type: 'format',
              handler: 'format',
              inputMapping: {},
              outputMapping: {},
            },
          ],
        }),
      });

      const response = await createFlow(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.flow).toBeDefined();
      expect(data.flow.id).toBe('flow_test123');
      expect(flowConfigService.createFlow).toHaveBeenCalled();
    });

    it('should return 400 for invalid flow data', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      flowConfigService.createFlow.mockRejectedValue(validationError);

      const request = new NextRequest('http://localhost:3000/api/admin/flows', {
        method: 'POST',
        body: JSON.stringify({
          name: '', // Invalid: empty name
        }),
      });

      const response = await createFlow(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/admin/flows', () => {
    it('should list all flows', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      
      const mockFlows = [
        { id: 'flow1', name: 'flow-1', status: 'active' },
        { id: 'flow2', name: 'flow-2', status: 'draft' },
      ];
      
      flowConfigService.listFlows.mockResolvedValue(mockFlows);

      const request = new NextRequest('http://localhost:3000/api/admin/flows');

      const response = await listFlows(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.flows).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('should filter flows by status', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      
      const mockFlows = [
        { id: 'flow1', name: 'flow-1', status: 'active' },
      ];
      
      flowConfigService.listFlows.mockResolvedValue(mockFlows);

      const request = new NextRequest('http://localhost:3000/api/admin/flows?status=active');

      const response = await listFlows(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.flows).toHaveLength(1);
      expect(flowConfigService.listFlows).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' })
      );
    });
  });

  describe('GET /api/admin/flows/{flowId}', () => {
    it('should get flow by ID', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      
      const mockFlow = {
        id: 'flow_test123',
        name: 'test-flow',
        displayName: 'Test Flow',
      };
      
      flowConfigService.getFlowById.mockResolvedValue(mockFlow);

      const request = new NextRequest('http://localhost:3000/api/admin/flows/flow_test123');

      const response = await getFlow(request, { params: { flowId: 'flow_test123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.flow.id).toBe('flow_test123');
    });

    it('should return 404 for non-existent flow', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      
      flowConfigService.getFlowById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/flows/nonexistent');

      const response = await getFlow(request, { params: { flowId: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Flow not found');
    });
  });

  describe('PUT /api/admin/flows/{flowId}', () => {
    it('should update flow', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      
      const mockUpdatedFlow = {
        id: 'flow_test123',
        name: 'test-flow',
        displayName: 'Updated Test Flow',
        version: 2,
      };
      
      flowConfigService.updateFlow.mockResolvedValue(mockUpdatedFlow);

      const request = new NextRequest('http://localhost:3000/api/admin/flows/flow_test123', {
        method: 'PUT',
        body: JSON.stringify({
          displayName: 'Updated Test Flow',
          versionMessage: 'Updated via test',
        }),
      });

      const response = await updateFlow(request, { params: { flowId: 'flow_test123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.flow.version).toBe(2);
    });

    it('should return 404 for updating non-existent flow', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      
      const notFoundError = new Error('Flow not found');
      notFoundError.name = 'FlowNotFoundError';
      flowConfigService.updateFlow.mockRejectedValue(notFoundError);

      const request = new NextRequest('http://localhost:3000/api/admin/flows/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ displayName: 'Updated' }),
      });

      const response = await updateFlow(request, { params: { flowId: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/admin/flows/{flowId}', () => {
    it('should delete flow', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      
      flowConfigService.deleteFlow.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/admin/flows/flow_test123', {
        method: 'DELETE',
      });

      const response = await deleteFlow(request, { params: { flowId: 'flow_test123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Flow deleted successfully');
    });

    it('should return 404 for deleting non-existent flow', async () => {
      const { flowConfigService } = require('@/services/flow-config-service');
      
      const notFoundError = new Error('Flow not found');
      notFoundError.name = 'FlowNotFoundError';
      flowConfigService.deleteFlow.mockRejectedValue(notFoundError);

      const request = new NextRequest('http://localhost:3000/api/admin/flows/nonexistent', {
        method: 'DELETE',
      });

      const response = await deleteFlow(request, { params: { flowId: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
