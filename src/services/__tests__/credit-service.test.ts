/**
 * Credit Service Tests
 * 
 * Tests for credit management service - Critical for monetization
 */

import { deductCredit, refundCredit } from '../credit-service';
import * as userService from '../userService';

// Mock userService
jest.mock('../userService', () => ({
  getUserProfile: jest.fn(),
  deductUserCredits: jest.fn(),
  addUserCredits: jest.fn(),
}));

describe('Credit Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.DEDUCT_CREDITS;
  });

  // ============================================================================
  // deductCredit
  // ============================================================================

  describe('deductCredit', () => {
    const mockUser = {
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      credits: 100,
      role: 'user' as const,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    it('should deduct credits successfully', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
      (userService.deductUserCredits as jest.Mock).mockResolvedValue(95);

      await deductCredit('user_123', 5);

      expect(userService.getUserProfile).toHaveBeenCalledWith('user_123');
      expect(userService.deductUserCredits).toHaveBeenCalledWith('user_123', 5);
    });

    it('should deduct 1 credit by default', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
      (userService.deductUserCredits as jest.Mock).mockResolvedValue(99);

      await deductCredit('user_123');

      expect(userService.deductUserCredits).toHaveBeenCalledWith('user_123', 1);
    });

    it('should throw error when user not found', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(null);

      await expect(
        deductCredit('non_existent_user', 5)
      ).rejects.toThrow('User not found to deduct credits.');
    });

    it('should throw error for insufficient credits', async () => {
      const poorUser = { ...mockUser, credits: 3 };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(poorUser);

      await expect(
        deductCredit('user_123', 5)
      ).rejects.toMatchObject({
        status: 402,
        message: 'Insufficient credits. Please purchase more to continue.',
      });

      expect(userService.deductUserCredits).not.toHaveBeenCalled();
    });

    it('should throw error when credits is undefined', async () => {
      const userWithoutCredits = { ...mockUser, credits: undefined };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(userWithoutCredits);

      await expect(
        deductCredit('user_123', 5)
      ).rejects.toMatchObject({
        status: 402,
        message: 'Insufficient credits. Please purchase more to continue.',
      });
    });

    it('should throw error when credits is 0', async () => {
      const zeroCreditsUser = { ...mockUser, credits: 0 };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(zeroCreditsUser);

      await expect(
        deductCredit('user_123', 1)
      ).rejects.toMatchObject({
        status: 402,
      });
    });

    it('should not deduct when amount is 0', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);

      await deductCredit('user_123', 0);

      expect(userService.getUserProfile).not.toHaveBeenCalled();
      expect(userService.deductUserCredits).not.toHaveBeenCalled();
    });

    it('should skip deduction when DEDUCT_CREDITS is false', async () => {
      process.env.DEDUCT_CREDITS = 'false';

      await deductCredit('user_123', 10);

      expect(userService.getUserProfile).not.toHaveBeenCalled();
      expect(userService.deductUserCredits).not.toHaveBeenCalled();
    });

    it('should still check credits when DEDUCT_CREDITS is true', async () => {
      process.env.DEDUCT_CREDITS = 'true';
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
      (userService.deductUserCredits as jest.Mock).mockResolvedValue(90);

      await deductCredit('user_123', 10);

      expect(userService.getUserProfile).toHaveBeenCalled();
      expect(userService.deductUserCredits).toHaveBeenCalled();
    });

    it('should handle large deductions', async () => {
      const richUser = { ...mockUser, credits: 1000 };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(richUser);
      (userService.deductUserCredits as jest.Mock).mockResolvedValue(500);

      await deductCredit('user_123', 500);

      expect(userService.deductUserCredits).toHaveBeenCalledWith('user_123', 500);
    });

    it('should handle decimal amounts', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
      (userService.deductUserCredits as jest.Mock).mockResolvedValue(97.5);

      await deductCredit('user_123', 2.5);

      expect(userService.deductUserCredits).toHaveBeenCalledWith('user_123', 2.5);
    });

    it('should pre-check credits before transaction', async () => {
      const userWithExactAmount = { ...mockUser, credits: 10 };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(userWithExactAmount);
      (userService.deductUserCredits as jest.Mock).mockResolvedValue(0);

      await deductCredit('user_123', 10);

      expect(userService.deductUserCredits).toHaveBeenCalled();
    });

    it('should propagate deduction errors', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
      (userService.deductUserCredits as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        deductCredit('user_123', 5)
      ).rejects.toThrow('Database error');
    });
  });

  // ============================================================================
  // refundCredit
  // ============================================================================

  describe('refundCredit', () => {
    it('should refund credits successfully', async () => {
      (userService.addUserCredits as jest.Mock).mockResolvedValue(undefined);

      await refundCredit('user_123', 10);

      expect(userService.addUserCredits).toHaveBeenCalledWith('user_123', 10);
    });

    it('should not refund when amount is 0', async () => {
      await refundCredit('user_123', 0);

      expect(userService.addUserCredits).not.toHaveBeenCalled();
    });

    it('should handle large refunds', async () => {
      (userService.addUserCredits as jest.Mock).mockResolvedValue(undefined);

      await refundCredit('user_123', 500);

      expect(userService.addUserCredits).toHaveBeenCalledWith('user_123', 500);
    });

    it('should handle decimal refunds', async () => {
      (userService.addUserCredits as jest.Mock).mockResolvedValue(undefined);

      await refundCredit('user_123', 3.5);

      expect(userService.addUserCredits).toHaveBeenCalledWith('user_123', 3.5);
    });

    it('should propagate refund errors', async () => {
      (userService.addUserCredits as jest.Mock).mockRejectedValue(
        new Error('Refund failed')
      );

      await expect(
        refundCredit('user_123', 10)
      ).rejects.toThrow('Refund failed');
    });

    it('should work with different user IDs', async () => {
      (userService.addUserCredits as jest.Mock).mockResolvedValue(undefined);

      await refundCredit('user_abc', 5);
      await refundCredit('user_xyz', 15);

      expect(userService.addUserCredits).toHaveBeenCalledTimes(2);
      expect(userService.addUserCredits).toHaveBeenCalledWith('user_abc', 5);
      expect(userService.addUserCredits).toHaveBeenCalledWith('user_xyz', 15);
    });
  });

  // ============================================================================
  // Integration Scenarios
  // ============================================================================

  describe('Integration scenarios', () => {
    const mockUser = {
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      credits: 50,
      role: 'user' as const,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    it('should handle deduct and refund flow', async () => {
      // Deduct credits
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
      (userService.deductUserCredits as jest.Mock).mockResolvedValue(40);

      await deductCredit('user_123', 10);

      expect(userService.deductUserCredits).toHaveBeenCalledWith('user_123', 10);

      // Refund credits (e.g., on error)
      (userService.addUserCredits as jest.Mock).mockResolvedValue(undefined);

      await refundCredit('user_123', 10);

      expect(userService.addUserCredits).toHaveBeenCalledWith('user_123', 10);
    });

    it('should handle multiple deductions', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
      (userService.deductUserCredits as jest.Mock)
        .mockResolvedValueOnce(48)
        .mockResolvedValueOnce(45)
        .mockResolvedValueOnce(42);

      await deductCredit('user_123', 2);
      await deductCredit('user_123', 3);
      await deductCredit('user_123', 3);

      expect(userService.deductUserCredits).toHaveBeenCalledTimes(3);
    });

    it('should fail fast on insufficient credits', async () => {
      const lowCreditUser = { ...mockUser, credits: 5 };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(lowCreditUser);

      await expect(
        deductCredit('user_123', 10)
      ).rejects.toMatchObject({ status: 402 });

      // Should not attempt deduction
      expect(userService.deductUserCredits).not.toHaveBeenCalled();
    });

    it('should handle zero-credit operations gracefully', async () => {
      // Deduct 0
      await deductCredit('user_123', 0);
      expect(userService.getUserProfile).not.toHaveBeenCalled();

      // Refund 0
      await refundCredit('user_123', 0);
      expect(userService.addUserCredits).not.toHaveBeenCalled();
    });

    it('should handle development mode correctly', async () => {
      process.env.DEDUCT_CREDITS = 'false';

      // Should skip all credit checks in dev mode
      await deductCredit('user_123', 100);

      expect(userService.getUserProfile).not.toHaveBeenCalled();
      expect(userService.deductUserCredits).not.toHaveBeenCalled();

      // Refunds should still work in dev mode
      (userService.addUserCredits as jest.Mock).mockResolvedValue(undefined);
      await refundCredit('user_123', 100);

      expect(userService.addUserCredits).toHaveBeenCalledWith('user_123', 100);
    });

    it('should handle edge case: exact credit match', async () => {
      const exactMatchUser = { ...mockUser, credits: 25 };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(exactMatchUser);
      (userService.deductUserCredits as jest.Mock).mockResolvedValue(0);

      // Should succeed when credits exactly match deduction
      await deductCredit('user_123', 25);

      expect(userService.deductUserCredits).toHaveBeenCalledWith('user_123', 25);
    });

    it('should handle edge case: one less than needed', async () => {
      const almostEnoughUser = { ...mockUser, credits: 24 };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(almostEnoughUser);

      // Should fail when 1 credit short
      await expect(
        deductCredit('user_123', 25)
      ).rejects.toMatchObject({ status: 402 });
    });

    it('should handle concurrent deduction attempts', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
      (userService.deductUserCredits as jest.Mock)
        .mockResolvedValueOnce(49)
        .mockResolvedValueOnce(48)
        .mockResolvedValueOnce(47);

      // Simulate concurrent deductions
      await Promise.all([
        deductCredit('user_123', 1),
        deductCredit('user_123', 1),
        deductCredit('user_123', 1),
      ]);

      expect(userService.deductUserCredits).toHaveBeenCalledTimes(3);
    });
  });

  // ============================================================================
  // Error Handling
  // ============================================================================

  describe('Error handling', () => {
    it('should handle getUserProfile errors', async () => {
      (userService.getUserProfile as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        deductCredit('user_123', 5)
      ).rejects.toThrow('Database connection failed');
    });

    it('should preserve error status codes', async () => {
      const lowCreditUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        credits: 1,
        role: 'user' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      (userService.getUserProfile as jest.Mock).mockResolvedValue(lowCreditUser);

      try {
        await deductCredit('user_123', 10);
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.status).toBe(402);
        expect(error.message).toContain('Insufficient credits');
      }
    });

    it('should handle null user profile', async () => {
      (userService.getUserProfile as jest.Mock).mockResolvedValue(null);

      await expect(
        deductCredit('user_123', 1)
      ).rejects.toThrow('User not found');
    });

    it('should handle refund errors gracefully', async () => {
      (userService.addUserCredits as jest.Mock).mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(
        refundCredit('user_123', 10)
      ).rejects.toThrow('Network timeout');
    });
  });
});
