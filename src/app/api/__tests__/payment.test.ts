/**
 * Payment API Route Tests
 * 
 * Tests for /api/payment/request endpoint
 */

import { POST as requestPayment } from '../payment/request/route';
import * as transactionService from '@/services/transactionService';
import { getStorage } from 'firebase-admin/storage';
import { getDatabase } from 'firebase-admin/database';
import { adminDb } from '@/lib/firebase/server-init';

// Mock dependencies
jest.mock('@/services/transactionService');
jest.mock('firebase-admin/storage', () => ({
  getStorage: jest.fn(),
}));
jest.mock('firebase-admin/database', () => ({
  getDatabase: jest.fn(),
}));
jest.mock('@/lib/firebase/server-init', () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

describe('Payment API Routes', () => {
  let mockRequest: any;
  let mockBucket: any;
  let mockFile: any;
  let mockDatabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock file upload
    mockFile = {
      save: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue(['https://example.com/proof.jpg']),
    };

    mockBucket = {
      file: jest.fn().mockReturnValue(mockFile),
    };

    (getStorage as jest.Mock).mockReturnValue({
      bucket: jest.fn().mockReturnValue(mockBucket),
    });

    // Mock database for notifications
    mockDatabase = {
      ref: jest.fn().mockReturnValue({
        push: jest.fn().mockReturnValue({
          set: jest.fn().mockResolvedValue(undefined),
        }),
      }),
    };
    (getDatabase as jest.Mock).mockReturnValue(mockDatabase);

    // Mock Firestore for admin lookup
    const mockSnapshot = {
      empty: false,
      docs: [
        { id: 'admin-1' },
        { id: 'admin-2' },
      ],
    };
    const mockCollection = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockSnapshot),
    };
    (adminDb.collection as jest.Mock).mockReturnValue(mockCollection);
  });

  // ============================================================================
  // POST /api/payment/request - Submit Payment Request
  // ============================================================================

  describe('POST /api/payment/request', () => {
    it('should submit payment request successfully', async () => {
      (transactionService.createTransaction as jest.Mock).mockResolvedValue({
        id: 'transaction-123',
      });

      const formData = new FormData();
      formData.append('file', new Blob(['test'], { type: 'image/jpeg' }), 'proof.jpg');
      formData.append('userId', 'user-123');
      formData.append('planId', 'plan-basic');
      formData.append('planName', 'Basic Plan');
      formData.append('credits', '100');
      formData.append('price', '9.99');
      formData.append('userName', 'Test User');
      formData.append('userEmail', 'test@example.com');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await requestPayment(context as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('submitted successfully');
      expect(data.transactionId).toBe('transaction-123');
    });

    it('should require file', async () => {
      const formData = new FormData();
      formData.append('userId', 'user-123');
      formData.append('planId', 'plan-basic');
      formData.append('credits', '100');
      formData.append('price', '9.99');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await requestPayment(context as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should require userId', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'proof.jpg');
      formData.append('planId', 'plan-basic');
      formData.append('credits', '100');
      formData.append('price', '9.99');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await requestPayment(context as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should require planId', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'proof.jpg');
      formData.append('userId', 'user-123');
      formData.append('credits', '100');
      formData.append('price', '9.99');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await requestPayment(context as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should require credits', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'proof.jpg');
      formData.append('userId', 'user-123');
      formData.append('planId', 'plan-basic');
      formData.append('price', '9.99');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await requestPayment(context as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should require price', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'proof.jpg');
      formData.append('userId', 'user-123');
      formData.append('planId', 'plan-basic');
      formData.append('credits', '100');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await requestPayment(context as any);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should upload proof file to storage', async () => {
      (transactionService.createTransaction as jest.Mock).mockResolvedValue({
        id: 'transaction-123',
      });

      const formData = new FormData();
      formData.append('file', new Blob(['test'], { type: 'image/jpeg' }), 'proof.jpg');
      formData.append('userId', 'user-123');
      formData.append('planId', 'plan-basic');
      formData.append('credits', '100');
      formData.append('price', '9.99');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      await requestPayment(context as any);

      expect(mockBucket.file).toHaveBeenCalledWith(
        expect.stringContaining('payment_proofs/user-123/')
      );
      expect(mockFile.save).toHaveBeenCalled();
    });

    it('should create transaction with pending status', async () => {
      (transactionService.createTransaction as jest.Mock).mockResolvedValue({
        id: 'transaction-123',
      });

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'proof.jpg');
      formData.append('userId', 'user-123');
      formData.append('planId', 'plan-basic');
      formData.append('planName', 'Basic Plan');
      formData.append('credits', '100');
      formData.append('price', '9.99');
      formData.append('userName', 'Test User');
      formData.append('userEmail', 'test@example.com');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      await requestPayment(context as any);

      expect(transactionService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          planId: 'plan-basic',
          status: 'pending',
          credits: 100,
          price: 9.99,
        })
      );
    });

    it('should notify all admins', async () => {
      (transactionService.createTransaction as jest.Mock).mockResolvedValue({
        id: 'transaction-123',
      });

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'proof.jpg');
      formData.append('userId', 'user-123');
      formData.append('planId', 'plan-basic');
      formData.append('credits', '100');
      formData.append('price', '9.99');
      formData.append('userName', 'Test User');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      await requestPayment(context as any);

      // Should query for admins
      const mockCollection = (adminDb.collection as jest.Mock).mock.results[0].value;
      expect(mockCollection.where).toHaveBeenCalledWith('role', '==', 'admin');
      
      // Should create notifications
      expect(mockDatabase.ref).toHaveBeenCalledTimes(2); // For 2 admins
    });

    it('should use default values for optional fields', async () => {
      (transactionService.createTransaction as jest.Mock).mockResolvedValue({
        id: 'transaction-123',
      });

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'proof.jpg');
      formData.append('userId', 'user-123');
      formData.append('planId', 'plan-basic');
      formData.append('credits', '100');
      formData.append('price', '9.99');
      // No planName, userName, userEmail

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      await requestPayment(context as any);

      expect(transactionService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          planName: 'Unknown Plan',
          userName: 'N/A',
          userEmail: 'N/A',
        })
      );
    });

    it('should handle storage upload errors', async () => {
      mockFile.save.mockRejectedValue(new Error('Storage error'));

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'proof.jpg');
      formData.append('userId', 'user-123');
      formData.append('planId', 'plan-basic');
      formData.append('credits', '100');
      formData.append('price', '9.99');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await requestPayment(context as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle transaction creation errors', async () => {
      (transactionService.createTransaction as jest.Mock).mockRejectedValue(
        new Error('Transaction failed')
      );

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'proof.jpg');
      formData.append('userId', 'user-123');
      formData.append('planId', 'plan-basic');
      formData.append('credits', '100');
      formData.append('price', '9.99');

      mockRequest = {
        formData: jest.fn().mockResolvedValue(formData),
      };

      const context = {
        request: mockRequest,
        user: { id: 'user-123', role: 'user' },
      };

      const response = await requestPayment(context as any);
      const data = await response.json();

      expect(response.status).toBe(500);
    });
  });
});
