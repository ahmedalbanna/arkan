/**
 * Admin Flow API Routes Tests
 * 
 * Tests for /api/admin/flows/* endpoints
 */

import { GET, POST, PUT, DELETE } from '../admin/flows/route';
import { GET as GET_BY_ID } from '../admin/flows/[flowId]/route';

// Mock authentication
jest.mock('../../../middleware/auth', () => ({
  withAuth: (handler: any) => handler,
}));

describe('/api/admin/flows', () => {
  let mockRequest: any;
  let mockContext: any;

  beforeEach(() => {
    mockRequest = {
      url: 'http://localhost:3000/api/admin/flows',
      json: jest.fn(),
      headers: new Headers(),
    };
    mockContext = {
      params: {},
      user: { uid: 'admin_test_user', role: 'admin' },
    };
    jest.clearAllMocks();
  });

  describe('GET /api/admin/flows', () => {
    it('should list all flows', async () => {
      const response = await GET({ request: mockRequest, ...mockContext });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.flows)).toBe(true);
    });

    it('should filter flows by status', async () => {
      mockRequest.url = 'http://localhost:3000/api/admin/flows?status=active';

      const response = await GET({ request: mockRequest, ...mockContext });
      const data = await response.json();

      expect(data.flows.every((f: any) => f.status === 'active')).toBe(true);
    });

    it('should search flows by name', async () => {
      mockRequest.url = 'http://localhost:3000/api/admin/flows?search=test';

      const response = await GET({ request: mockRequest, ...mockContext });
      const data = await response.json();

      expect(data.flows.every((f: any) => f.name.includes('test'))).toBe(true);
    });

    it('should paginate results', async () => {
      mockRequest.url = 'http://localhost:3000/api/admin/flows?limit=5';

      const response = await GET({ request: mockRequest, ...mockContext });
      const data = await response.json();

      expect(data.flows.length).toBeLessThanOrEqual(5);
    });
  });

  describe('POST /api/admin/flows', () => {
    it('should create new flow', async () => {
      const flowData = {
        name: 'test-flow',
        description: 'Test flow',
        steps: [
          {
            id: 'step_1',
            name: 'Test Step',
            type: 'generate',
            config: { prompt: 'Test' },
          },
        ],
      };

      mockRequest.json.mockResolvedValue(flowData);

      const response = await POST({ request: mockRequest, ...mockContext });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.flow.name).toBe('test-flow');
    });

    it('should validate flow configuration', async () => {
      const invalidFlow = { name: 'test' }; // Missing required fields

      mockRequest.json.mockResolvedValue(invalidFlow);

      const response = await POST({ request: mockRequest, ...mockContext });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const contextWithoutAuth = { ...mockContext, user: null };

      const response = await POST({
        request: mockRequest,
        ...contextWithoutAuth,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/admin/flows/[flowId]', () => {
    it('should retrieve flow by ID', async () => {
      mockContext.params = { flowId: 'flow_test_001' };

      const response = await GET_BY_ID({
        request: mockRequest,
        params: mockContext.params,
        ...mockContext,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.flow.id).toBe('flow_test_001');
    });

    it('should return 404 for non-existent flow', async () => {
      mockContext.params = { flowId: 'non_existent' };

      const response = await GET_BY_ID({
        request: mockRequest,
        params: mockContext.params,
        ...mockContext,
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/admin/flows/[flowId]', () => {
    it('should update flow', async () => {
      mockContext.params = { flowId: 'flow_test_001' };
      const updates = { description: 'Updated description' };
      mockRequest.json.mockResolvedValue(updates);

      const response = await PUT({
        request: mockRequest,
        params: mockContext.params,
        ...mockContext,
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.flow.description).toBe('Updated description');
    });

    it('should validate update data', async () => {
      mockContext.params = { flowId: 'flow_test_001' };
      mockRequest.json.mockResolvedValue({ steps: 'invalid' });

      const response = await PUT({
        request: mockRequest,
        params: mockContext.params,
        ...mockContext,
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/admin/flows/[flowId]', () => {
    it('should delete flow', async () => {
      mockContext.params = { flowId: 'flow_test_001' };

      const response = await DELETE({
        request: mockRequest,
        params: mockContext.params,
        ...mockContext,
      });

      expect(response.status).toBe(200);
    });

    it('should prevent deletion without permission', async () => {
      mockContext.params = { flowId: 'flow_test_001' };
      mockContext.user.role = 'user';

      const response = await DELETE({
        request: mockRequest,
        params: mockContext.params,
        ...mockContext,
      });

      expect(response.status).toBe(403);
    });
  });
});
