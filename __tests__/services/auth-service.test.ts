import { AuthService } from '@/services/auth/auth-service';
import { createMockUser } from '../helpers/test-helpers';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    updatePassword: jest.fn(),
    updateProfile: jest.fn(),
    getAuth: jest.fn(() => ({
        currentUser: null,
    })),
}));

// Mock Firebase Admin
jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn(() => ({
        verifyIdToken: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
        setCustomUserClaims: jest.fn(),
    })),
}));

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        jest.clearAllMocks();
        authService = new AuthService();
    });

    describe('User Authentication', () => {
        it('should sign in user with valid credentials', async () => {
            const mockUser = createMockUser();
            const mockAuthResult = {
                user: {
                    uid: mockUser.id,
                    email: mockUser.email,
                    displayName: mockUser.name,
                    emailVerified: true,
                },
            };

            const { signInWithEmailAndPassword } = require('firebase/auth');
            signInWithEmailAndPassword.mockResolvedValue(mockAuthResult);

            const result = await authService.signIn('test@example.com', 'password123');

            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                emailVerified: true,
            });
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                expect.anything(),
                'test@example.com',
                'password123'
            );
        });

        it('should handle sign in errors', async () => {
            const { signInWithEmailAndPassword } = require('firebase/auth');
            signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));

            const result = await authService.signIn('test@example.com', 'wrongpassword');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid credentials');
        });

        it('should create new user account', async () => {
            const mockUser = createMockUser();
            const mockAuthResult = {
                user: {
                    uid: mockUser.id,
                    email: mockUser.email,
                    displayName: mockUser.name,
                    emailVerified: false,
                },
            };

            const { createUserWithEmailAndPassword } = require('firebase/auth');
            createUserWithEmailAndPassword.mockResolvedValue(mockAuthResult);

            const result = await authService.signUp('test@example.com', 'password123', 'Test User');

            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                emailVerified: false,
            });
        });

        it('should handle sign up errors', async () => {
            const { createUserWithEmailAndPassword } = require('firebase/auth');
            createUserWithEmailAndPassword.mockRejectedValue(new Error('Email already exists'));

            const result = await authService.signUp('existing@example.com', 'password123', 'Test User');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Email already exists');
        });

        it('should sign out user', async () => {
            const { signOut } = require('firebase/auth');
            signOut.mockResolvedValue(undefined);

            const result = await authService.signOut();

            expect(result.success).toBe(true);
            expect(signOut).toHaveBeenCalled();
        });
    });

    describe('Password Management', () => {
        it('should send password reset email', async () => {
            const { sendPasswordResetEmail } = require('firebase/auth');
            sendPasswordResetEmail.mockResolvedValue(undefined);

            const result = await authService.sendPasswordResetEmail('test@example.com');

            expect(result.success).toBe(true);
            expect(sendPasswordResetEmail).toHaveBeenCalledWith(
                expect.anything(),
                'test@example.com'
            );
        });

        it('should handle password reset errors', async () => {
            const { sendPasswordResetEmail } = require('firebase/auth');
            sendPasswordResetEmail.mockRejectedValue(new Error('User not found'));

            const result = await authService.sendPasswordResetEmail('nonexistent@example.com');

            expect(result.success).toBe(false);
            expect(result.error).toBe('User not found');
        });

        it('should update user password', async () => {
            const { updatePassword } = require('firebase/auth');
            updatePassword.mockResolvedValue(undefined);

            const mockUser = {
                uid: 'user123',
                email: 'test@example.com',
                updatePassword: updatePassword,
            };

            const result = await authService.updatePassword(mockUser as any, 'newpassword123');

            expect(result.success).toBe(true);
            expect(updatePassword).toHaveBeenCalledWith('newpassword123');
        });
    });

    describe('User Profile Management', () => {
        it('should update user profile', async () => {
            const { updateProfile } = require('firebase/auth');
            updateProfile.mockResolvedValue(undefined);

            const mockUser = {
                uid: 'user123',
                email: 'test@example.com',
                updateProfile: updateProfile,
            };

            const profileData = {
                displayName: 'Updated Name',
                photoURL: 'https://example.com/photo.jpg',
            };

            const result = await authService.updateProfile(mockUser as any, profileData);

            expect(result.success).toBe(true);
            expect(updateProfile).toHaveBeenCalledWith(profileData);
        });

        it('should handle profile update errors', async () => {
            const { updateProfile } = require('firebase/auth');
            updateProfile.mockRejectedValue(new Error('Profile update failed'));

            const mockUser = {
                uid: 'user123',
                email: 'test@example.com',
                updateProfile: updateProfile,
            };

            const result = await authService.updateProfile(mockUser as any, {
                displayName: 'Updated Name',
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Profile update failed');
        });
    });

    describe('Authentication State', () => {
        it('should listen to auth state changes', () => {
            const { onAuthStateChanged } = require('firebase/auth');
            const mockCallback = jest.fn();

            onAuthStateChanged.mockImplementation((auth, callback) => {
                callback(null); // Simulate no user
                return jest.fn(); // Return unsubscribe function
            });

            authService.onAuthStateChanged(mockCallback);

            expect(onAuthStateChanged).toHaveBeenCalled();
        });

        it('should get current user', () => {
            const mockUser = {
                uid: 'user123',
                email: 'test@example.com',
                displayName: 'Test User',
                emailVerified: true,
            };

            const { getAuth } = require('firebase/auth');
            getAuth.mockReturnValue({
                currentUser: mockUser,
            });

            const result = authService.getCurrentUser();

            expect(result).toEqual({
                id: mockUser.uid,
                email: mockUser.email,
                name: mockUser.displayName,
                emailVerified: mockUser.emailVerified,
            });
        });

        it('should return null when no current user', () => {
            const { getAuth } = require('firebase/auth');
            getAuth.mockReturnValue({
                currentUser: null,
            });

            const result = authService.getCurrentUser();

            expect(result).toBeNull();
        });
    });

    describe('Token Management', () => {
        it('should get ID token', async () => {
            const mockToken = 'mock-id-token';
            const mockUser = {
                uid: 'user123',
                getIdToken: jest.fn().mockResolvedValue(mockToken),
            };

            const result = await authService.getIdToken(mockUser as any);

            expect(result.success).toBe(true);
            expect(result.data).toBe(mockToken);
        });

        it('should handle token errors', async () => {
            const mockUser = {
                uid: 'user123',
                getIdToken: jest.fn().mockRejectedValue(new Error('Token expired')),
            };

            const result = await authService.getIdToken(mockUser as any);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Token expired');
        });

        it('should verify ID token', async () => {
            const mockToken = 'mock-id-token';
            const mockDecodedToken = {
                uid: 'user123',
                email: 'test@example.com',
                email_verified: true,
            };

            const { getAuth } = require('firebase-admin/auth');
            const mockAuth = {
                verifyIdToken: jest.fn().mockResolvedValue(mockDecodedToken),
            };
            getAuth.mockReturnValue(mockAuth);

            const result = await authService.verifyIdToken(mockToken);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockDecodedToken);
            expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(mockToken);
        });
    });

    describe('User Management (Admin)', () => {
        it('should create user (admin)', async () => {
            const mockUserData = {
                email: 'newuser@example.com',
                password: 'password123',
                displayName: 'New User',
            };

            const mockCreatedUser = {
                uid: 'newuser123',
                email: mockUserData.email,
                displayName: mockUserData.displayName,
            };

            const { getAuth } = require('firebase-admin/auth');
            const mockAuth = {
                createUser: jest.fn().mockResolvedValue(mockCreatedUser),
            };
            getAuth.mockReturnValue(mockAuth);

            const result = await authService.createUser(mockUserData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockCreatedUser);
            expect(mockAuth.createUser).toHaveBeenCalledWith(mockUserData);
        });

        it('should update user (admin)', async () => {
            const userId = 'user123';
            const updateData = {
                displayName: 'Updated Name',
                email: 'updated@example.com',
            };

            const mockUpdatedUser = {
                uid: userId,
                ...updateData,
            };

            const { getAuth } = require('firebase-admin/auth');
            const mockAuth = {
                updateUser: jest.fn().mockResolvedValue(mockUpdatedUser),
            };
            getAuth.mockReturnValue(mockAuth);

            const result = await authService.updateUser(userId, updateData);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockUpdatedUser);
            expect(mockAuth.updateUser).toHaveBeenCalledWith(userId, updateData);
        });

        it('should delete user (admin)', async () => {
            const userId = 'user123';

            const { getAuth } = require('firebase-admin/auth');
            const mockAuth = {
                deleteUser: jest.fn().mockResolvedValue(undefined),
            };
            getAuth.mockReturnValue(mockAuth);

            const result = await authService.deleteUser(userId);

            expect(result.success).toBe(true);
            expect(mockAuth.deleteUser).toHaveBeenCalledWith(userId);
        });

        it('should set custom user claims', async () => {
            const userId = 'user123';
            const customClaims = {
                role: 'admin',
                permissions: ['read', 'write'],
            };

            const { getAuth } = require('firebase-admin/auth');
            const mockAuth = {
                setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
            };
            getAuth.mockReturnValue(mockAuth);

            const result = await authService.setCustomUserClaims(userId, customClaims);

            expect(result.success).toBe(true);
            expect(mockAuth.setCustomUserClaims).toHaveBeenCalledWith(userId, customClaims);
        });
    });

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            const { signInWithEmailAndPassword } = require('firebase/auth');
            signInWithEmailAndPassword.mockRejectedValue(new Error('Network error'));

            const result = await authService.signIn('test@example.com', 'password123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Network error');
        });

        it('should handle invalid email format', async () => {
            const { signInWithEmailAndPassword } = require('firebase/auth');
            signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid email format'));

            const result = await authService.signIn('invalid-email', 'password123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid email format');
        });

        it('should handle weak password', async () => {
            const { createUserWithEmailAndPassword } = require('firebase/auth');
            createUserWithEmailAndPassword.mockRejectedValue(new Error('Password should be at least 6 characters'));

            const result = await authService.signUp('test@example.com', '123', 'Test User');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Password should be at least 6 characters');
        });
    });

    describe('Security', () => {
        it('should validate email format', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'test+tag@gmail.com',
            ];

            const invalidEmails = [
                'invalid-email',
                'test@',
                '@example.com',
                'test..test@example.com',
            ];

            validEmails.forEach(email => {
                expect(authService.validateEmail(email)).toBe(true);
            });

            invalidEmails.forEach(email => {
                expect(authService.validateEmail(email)).toBe(false);
            });
        });

        it('should validate password strength', () => {
            const strongPasswords = [
                'Password123!',
                'MyStr0ng@Pass',
                'Complex#Pass1',
            ];

            const weakPasswords = [
                '123456',
                'password',
                'PASSWORD',
                'Pass1',
            ];

            strongPasswords.forEach(password => {
                expect(authService.validatePasswordStrength(password)).toBe(true);
            });

            weakPasswords.forEach(password => {
                expect(authService.validatePasswordStrength(password)).toBe(false);
            });
        });

        it('should sanitize user input', () => {
            const maliciousInput = '<script>alert("xss")</script>John Doe';
            const sanitized = authService.sanitizeInput(maliciousInput);

            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('John Doe');
        });
    });

    describe('Performance', () => {
        it('should handle concurrent authentication requests', async () => {
            const { signInWithEmailAndPassword } = require('firebase/auth');
            signInWithEmailAndPassword.mockResolvedValue({
                user: { uid: 'user123', email: 'test@example.com' },
            });

            const startTime = performance.now();

            const promises = Array.from({ length: 10 }, () =>
                authService.signIn('test@example.com', 'password123')
            );

            const results = await Promise.all(promises);
            const endTime = performance.now();

            expect(results).toHaveLength(10);
            expect(results.every(result => result.success)).toBe(true);
            expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
        });

        it('should cache user data efficiently', async () => {
            const mockUser = createMockUser();

            // First call
            const result1 = await authService.getUserData(mockUser.id);

            // Second call should use cache
            const startTime = performance.now();
            const result2 = await authService.getUserData(mockUser.id);
            const endTime = performance.now();

            expect(result1).toEqual(result2);
            expect(endTime - startTime).toBeLessThan(10); // Should be very fast due to caching
        });
    });
});
