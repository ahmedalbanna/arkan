
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// Mock getAuth to avoid Firebase initialization issues in tests
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      uid: 'test-user-id',
      displayName: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      phoneNumber: null,
      providerData: [{ providerId: 'password' }],
      tenantId: null,
    }
  })),
}));

describe('Firebase Errors and Emitter', () => {

  describe('FirestorePermissionError', () => {
    it('should create a correctly formatted error for a get operation', () => {
      const context = {
        operation: 'get' as const,
        path: 'users/user123',
      };
      const error = new FirestorePermissionError(context);

      expect(error.name).toBe('FirebaseError');
      expect(error.message).toContain('Missing or insufficient permissions');
      expect(error.request.method).toBe('get');
      expect(error.request.path).toBe('/databases/(default)/documents/users/user123');
      expect(error.request.auth).not.toBeNull();
      expect(error.request.auth?.uid).toBe('test-user-id');
    });

    it('should include request resource data for write operations', () => {
      const context = {
        operation: 'create' as const,
        path: 'posts/post456',
        requestResourceData: { title: 'New Post', content: 'Hello' },
      };
      const error = new FirestorePermissionError(context);

      expect(error.request.method).toBe('create');
      expect(error.request.resource?.data).toEqual({ title: 'New Post', content: 'Hello' });
    });
  });

  describe('errorEmitter', () => {
    it('should emit and listen for permission-error events', () => {
      const listener = jest.fn();
      const context = { operation: 'delete' as const, path: 'items/item789' };
      const error = new FirestorePermissionError(context);

      // Subscribe
      errorEmitter.on('permission-error', listener);

      // Emit
      errorEmitter.emit('permission-error', error);

      // Assert
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(error);

      const receivedError = listener.mock.calls[0][0];
      expect(receivedError.request.path).toContain('items/item789');

      // Unsubscribe
      errorEmitter.off('permission-error', listener);

      // Emit again
      errorEmitter.emit('permission-error', error);

      // Assert listener was not called again
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
