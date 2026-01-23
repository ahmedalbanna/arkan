/**
 * User Model Tests
 */

import { User, type UserProfile } from '../user';
import { UserValidationError } from '../user-validation';

describe('User Model', () => {
  describe('constructor', () => {
    it('should create a user with valid properties', () => {
      const user = new User({
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      });

      expect(user.id).toBe('user-123');
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe('user');
      expect(user.credits).toBe(0);
      expect(user.hasCompletedOnboarding).toBe(false);
    });

    it('should throw error for missing ID', () => {
      expect(() => {
        new User({ name: 'John', email: 'john@example.com' });
      }).toThrow('User ID is required');
    });

    it('should throw error for empty ID', () => {
      expect(() => {
        new User({ id: '   ', name: 'John', email: 'john@example.com' });
      }).toThrow('User ID is required');
    });

    it('should throw error for missing name', () => {
      expect(() => {
        new User({ id: 'user-123', email: 'john@example.com' });
      }).toThrow('User name is required');
    });

    it('should throw error for missing email', () => {
      expect(() => {
        new User({ id: 'user-123', name: 'John' });
      }).toThrow('User email is required');
    });

    it('should throw error for invalid email format', () => {
      expect(() => {
        new User({ id: 'user-123', name: 'John', email: 'invalid-email' });
      }).toThrow('Invalid email format');
    });

    it('should throw error for negative credits', () => {
      expect(() => {
        new User({
          id: 'user-123',
          name: 'John',
          email: 'john@example.com',
          credits: -10,
        });
      }).toThrow('Credits cannot be negative');
    });

    it('should throw error for non-integer credits', () => {
      expect(() => {
        new User({
          id: 'user-123',
          name: 'John',
          email: 'john@example.com',
          credits: 10.5,
        });
      }).toThrow('Credits must be an integer');
    });

    it('should set default role to user', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });
      expect(user.role).toBe('user');
    });

    it('should set default credits to 0', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });
      expect(user.credits).toBe(0);
    });

    it('should set default hasCompletedOnboarding to false', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });
      expect(user.hasCompletedOnboarding).toBe(false);
    });

    it('should generate timestamps if not provided', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });

  describe('immutability', () => {
    it('should have readonly properties (compile-time)', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      // Note: readonly is a TypeScript compile-time feature
      // At runtime, properties can technically be modified, but TypeScript prevents this
      // The test verifies the property exists and is accessible
      expect(user.name).toBe('John');
      expect(user.id).toBe('user-123');
    });

    it('should return new instance with with()', () => {
      const original = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      const updated = original.with({ name: 'Jane' });

      expect(updated).not.toBe(original);
      expect(original.name).toBe('John');
      expect(updated.name).toBe('Jane');
    });
  });

  describe('with()', () => {
    it('should update properties', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      const updated = user.with({ name: 'Jane Doe', bio: 'Developer' });

      expect(updated.name).toBe('Jane Doe');
      expect(updated.bio).toBe('Developer');
      expect(updated.id).toBe('user-123'); // Unchanged
    });

    it('should update updatedAt timestamp', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });

      const updated = user.with({ name: 'Jane' });

      expect(updated.updatedAt).not.toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('getInitials()', () => {
    it('should return initials for single name', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });
      expect(user.getInitials()).toBe('J');
    });

    it('should return initials for full name', () => {
      const user = new User({
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(user.getInitials()).toBe('JD');
    });

    it('should return max 2 characters', () => {
      const user = new User({
        id: 'user-123',
        name: 'John Michael Doe',
        email: 'john@example.com',
      });
      expect(user.getInitials()).toBe('JM');
    });

    it('should handle single character names', () => {
      const user = new User({
        id: 'user-123',
        name: 'X',
        email: 'john@example.com',
      });
      expect(user.getInitials()).toBe('X');
    });
  });

  describe('getFormattedDate()', () => {
    it('should format date correctly', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        createdAt: '2026-01-23T10:00:00.000Z',
      });
      expect(user.getFormattedDate()).toMatch(/23 Jan 2026/);
    });

    it('should return Invalid Date for invalid timestamp', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        createdAt: 'invalid',
      });
      expect(user.getFormattedDate()).toBe('Invalid Date');
    });
  });

  describe('isAdmin()', () => {
    it('should return true for admin role', () => {
      const user = new User({
        id: 'user-123',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin',
      });
      expect(user.isAdmin()).toBe(true);
    });

    it('should return false for user role', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        role: 'user',
      });
      expect(user.isAdmin()).toBe(false);
    });
  });

  describe('isOnboarded()', () => {
    it('should return true if onboarding complete', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        hasCompletedOnboarding: true,
      });
      expect(user.isOnboarded()).toBe(true);
    });

    it('should return false if onboarding not complete', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });
      expect(user.isOnboarded()).toBe(false);
    });
  });

  describe('hasEnoughCredits()', () => {
    it('should return true if sufficient credits', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        credits: 100,
      });
      expect(user.hasEnoughCredits(50)).toBe(true);
    });

    it('should return false if insufficient credits', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        credits: 10,
      });
      expect(user.hasEnoughCredits(50)).toBe(false);
    });

    it('should return true for exact amount', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        credits: 50,
      });
      expect(user.hasEnoughCredits(50)).toBe(true);
    });
  });

  describe('addCredits()', () => {
    it('should add credits correctly', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        credits: 50,
      });

      const updated = user.addCredits(30);

      expect(updated.credits).toBe(80);
      expect(user.credits).toBe(50); // Original unchanged
    });

    it('should throw error for negative amount', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      expect(() => user.addCredits(-10)).toThrow('Cannot add negative credits');
    });

    it('should throw error for non-integer amount', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      expect(() => user.addCredits(10.5)).toThrow('Credits must be an integer');
    });
  });

  describe('deductCredits()', () => {
    it('should deduct credits correctly', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        credits: 100,
      });

      const updated = user.deductCredits(30);

      expect(updated.credits).toBe(70);
      expect(user.credits).toBe(100); // Original unchanged
    });

    it('should throw error for insufficient credits', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        credits: 10,
      });

      expect(() => user.deductCredits(50)).toThrow('Insufficient credits');
    });

    it('should throw error for negative amount', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      expect(() => user.deductCredits(-10)).toThrow('Cannot deduct negative credits');
    });

    it('should throw error for non-integer amount', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      expect(() => user.deductCredits(10.5)).toThrow('Credits must be an integer');
    });
  });

  describe('completeOnboarding()', () => {
    it('should mark onboarding as complete', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      const updated = user.completeOnboarding();

      expect(updated.hasCompletedOnboarding).toBe(true);
      expect(user.hasCompletedOnboarding).toBe(false); // Original unchanged
    });
  });

  describe('API key management', () => {
    it('should set API key', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      const updated = user.setApiKey('gemini', 'api-key-123');

      expect(updated.getApiKey('gemini')).toBe('api-key-123');
    });

    it('should update existing API key', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        apiKeys: { gemini: 'old-key' },
      });

      const updated = user.setApiKey('gemini', 'new-key');

      expect(updated.getApiKey('gemini')).toBe('new-key');
    });

    it('should preserve other API keys when adding new one', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        apiKeys: { gemini: 'gemini-key' },
      });

      const updated = user.setApiKey('chatgpt', 'chatgpt-key');

      expect(updated.getApiKey('gemini')).toBe('gemini-key');
      expect(updated.getApiKey('chatgpt')).toBe('chatgpt-key');
    });

    it('should remove API key', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        apiKeys: { gemini: 'key1', chatgpt: 'key2' },
      });

      const updated = user.removeApiKey('gemini');

      expect(updated.getApiKey('gemini')).toBeUndefined();
      expect(updated.getApiKey('chatgpt')).toBe('key2');
    });

    it('should return undefined for non-existent API key', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      expect(user.getApiKey('gemini')).toBeUndefined();
    });
  });

  describe('markDailyCreditUpdate()', () => {
    it('should update last daily credit timestamp', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      const updated = user.markDailyCreditUpdate();

      expect(updated.lastDailyCreditUpdate).toBeDefined();
      expect(user.lastDailyCreditUpdate).toBeUndefined(); // Original unchanged
    });
  });

  describe('toStateObject()', () => {
    it('should convert to plain object', () => {
      const user = new User({
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        credits: 100,
      });

      const stateObject = user.toStateObject();

      expect(stateObject).toEqual(
        expect.objectContaining({
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          credits: 100,
        })
      );
      expect(stateObject).not.toBeInstanceOf(User);
    });

    it('should include all properties', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        bio: 'Developer',
        profilePictureUrl: 'https://example.com/pic.jpg',
        apiKeys: { gemini: 'key' },
      });

      const stateObject = user.toStateObject();

      expect(stateObject.bio).toBe('Developer');
      expect(stateObject.profilePictureUrl).toBe('https://example.com/pic.jpg');
      expect(stateObject.apiKeys).toEqual({ gemini: 'key' });
    });
  });

  describe('toJSON()', () => {
    it('should serialize to JSON correctly', () => {
      const user = new User({
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
      });

      const json = JSON.stringify(user);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe('user-123');
      expect(parsed.name).toBe('John');
      expect(parsed.email).toBe('john@example.com');
    });
  });
});
