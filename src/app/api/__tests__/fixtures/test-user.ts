/**
 * Test User Fixtures
 * 
 * Provides mock user data for testing authentication and user-related workflows
 */

export const testUser = {
  id: 'test-user-123',
  email: 'testuser@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  emailVerified: true,
  role: 'user' as const,
};

export const testAdminUser = {
  id: 'test-admin-123',
  email: 'admin@example.com',
  password: 'AdminPassword123!',
  name: 'Test Admin',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  emailVerified: true,
  role: 'admin' as const,
};

export const testSignupData = {
  email: 'newuser@example.com',
  password: 'NewPassword123!',
  name: 'New User',
};

export const testLoginData = {
  email: testUser.email,
  password: testUser.password,
};

export const testInvalidLoginData = {
  email: 'wrong@example.com',
  password: 'WrongPassword123!',
};

export const testPasswordResetData = {
  email: testUser.email,
  newPassword: 'NewResetPassword123!',
};

export const testSessionToken = {
  userId: testUser.id,
  email: testUser.email,
  role: testUser.role,
  issuedAt: Date.now(),
  expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
};

export const createMockAuthResponse = (user: typeof testUser) => ({
  success: true,
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  },
  token: testSessionToken,
  expiresIn: 86400,
});

export const createMockErrorResponse = (message: string, code: string) => ({
  success: false,
  error: {
    message,
    code,
  },
});
