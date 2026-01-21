/**
 * Users API Route Tests
 * 
 * Tests for /api/users/[id] endpoints
 */

import { GET as getUser, PUT as updateUser } from '../users/[id]/route';
import * as userService from '@/services/userService';
import { adminAuth, adminDb } from '@/lib/firebase/server-init';

// Mock dependencies
jest.mock('@/services/userService');
jest.mock('@/lib/firebase/server-init', () => ({
  adminAuth: {
    updateUser: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(),
  },
}));

describe('Users API Routes', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    bio: 'Test bio',
    credits: 100,
    role: 'user' as const,
    hasCompletedOnboarding: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  let mockRequest: any;
  let mockParams: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      json: jest.fn(),
    };

    mockParams = Promise.resolve({ id: 'user-123' });

    // Setup adminDb collection mock
    const mockDocRef = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    const mockCollection = {
      doc: jest.fn().mockReturnValue(mockDocRef),
    };
    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);
  });

  // ============================================================================
  // GET /api/users/[id] - Get User Profile
  // ============================================================================

  describe('GET /api/users/[id]', () => {
    it('should allow admin to get any user', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);

      const context = {
        params: mockParams,
        user: { id: 'admin-123', role: 'admin' },
      };

      const response = await getUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
      expect(userService.getUserProfile).toHaveBeenCalledWith('user-123');
    });

    it('should allow user to get own profile', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);

      const context = {
        params: mockParams,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await getUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
    });

    it('should forbid user from getting other profiles', async () => {
      const context = {
        params: mockParams,
        user: { id: 'user-456', role: 'user' },
      };

      const response = await getUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('should return 404 for non-existent user', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(null);

      const context = {
        params: mockParams,
        user: { id: 'admin-123', role: 'admin' },
      };

      const response = await getUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found.');
    });

    it('should handle service errors', async () => {
      (userService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Database error'));

      const context = {
        params: mockParams,
        user: { id: 'admin-123', role: 'admin' },
      };

      const response = await getUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  // ============================================================================
  // PUT /api/users/[id] - Update User Profile
  // ============================================================================

  describe('PUT /api/users/[id]', () => {
    it('should allow user to update own profile', async () => {
      mockRequest.json.mockResolvedValue({ name: 'Updated Name' });
      (userService.getUserProfile as jest.Mock).mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      const context = {
        request: mockRequest,
        params: mockParams,
        user: { id: 'user-123', role: 'user', email: 'test@example.com' },
      };

      const response = await updateUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Updated Name');
    });

    it('should allow admin to update any user', async () => {
      mockRequest.json.mockResolvedValue({ credits: 200 });
      (userService.getUserProfile as jest.Mock).mockResolvedValue({
        ...mockUser,
        credits: 200,
      });

      const context = {
        request: mockRequest,
        params: mockParams,
        user: { id: 'admin-123', role: 'admin', email: 'admin@example.com' },
      };

      const response = await updateUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.credits).toBe(200);
    });

    it('should forbid user from updating other profiles', async () => {
      mockRequest.json.mockResolvedValue({ name: 'Hacker' });

      const context = {
        request: mockRequest,
        params: mockParams,
        user: { id: 'user-456', role: 'user' },
      };

      const response = await updateUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    it('should prevent non-admin from updating credits', async () => {
      mockRequest.json.mockResolvedValue({ credits: 9999 });

      const context = {
        request: mockRequest,
        params: mockParams,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await updateUser(context as any);
      const data = await response.json();

      // User schema doesn't include credits, so it should be rejected
      expect(response.status).toBe(400);
    });

    it('should update email in Firebase Auth when changed', async () => {
      mockRequest.json.mockResolvedValue({ email: 'newemail@example.com' });
      (userService.getUserProfile as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: 'newemail@example.com',
      });

      const context = {
        request: mockRequest,
        params: mockParams,
        user: { id: 'user-123', role: 'user', email: 'test@example.com' },
      };

      await updateUser(context as any);

      expect(adminAuth.updateUser).toHaveBeenCalledWith('user-123', {
        email: 'newemail@example.com',
      });
    });

    it('should handle email already exists error', async () => {
      mockRequest.json.mockResolvedValue({ email: 'existing@example.com' });
      const authError = new Error('Email exists');
      (authError as any).code = 'auth/email-already-exists';
      (adminAuth.updateUser as jest.Mock).mockRejectedValue(authError);

      const context = {
        request: mockRequest,
        params: mockParams,
        user: { id: 'user-123', role: 'user', email: 'test@example.com' },
      };

      const response = await updateUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain('already in use');
    });

    it('should validate email format', async () => {
      mockRequest.json.mockResolvedValue({ email: 'invalid-email' });

      const context = {
        request: mockRequest,
        params: mockParams,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await updateUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate required name field', async () => {
      mockRequest.json.mockResolvedValue({ name: '' });

      const context = {
        request: mockRequest,
        params: mockParams,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await updateUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should allow admin to update role', async () => {
      mockRequest.json.mockResolvedValue({ role: 'admin' });
      (userService.getUserProfile as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: 'admin',
      });

      const context = {
        request: mockRequest,
        params: mockParams,
        user: { id: 'admin-123', role: 'admin' },
      };

      const response = await updateUser(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.role).toBe('admin');
    });

    it('should update updatedAt timestamp', async () => {
      mockRequest.json.mockResolvedValue({ name: 'Updated' });
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);

      const context = {
        request: mockRequest,
        params: mockParams,
        user: { id: 'user-123', role: 'user', email: 'test@example.com' },
      };

      await updateUser(context as any);

      const mockCollection = (adminDb.collection as jest.Mock).mock.results[0].value;
      const mockDoc = mockCollection.doc.mock.results[0].value;

      expect(mockDoc.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: expect.any(String),
        })
      );
    });
  });
});
