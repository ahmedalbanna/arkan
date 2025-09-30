/**
 * اختبارات المصادقة
 *
 * هذا الملف يحتوي على اختبارات شاملة لجميع مكونات المصادقة
 */

import { describe, expect, it, vi } from 'vitest';
import {
    useAuth,
    useAuthPermissions,
    useAuthState,
    useCurrentUser
} from '../auth/auth-hooks';
import {
    AuthService,
    ChangePasswordData,
    LoginCredentials,
    RegisterCredentials,
    ResetPasswordData,
    UpdateProfileData
} from '../auth/auth-service';
import {
    AuthUtils,
    ExtendedUser,
    UserPermission,
    UserRole
} from '../auth/auth-utils';

// Mock Firebase
vi.mock('../firebase/client-init', () => ({
    auth: {
        currentUser: null,
        signInWithEmailAndPassword: vi.fn(),
        createUserWithEmailAndPassword: vi.fn(),
        signOut: vi.fn(),
        sendPasswordResetEmail: vi.fn(),
        confirmPasswordReset: vi.fn(),
        updatePassword: vi.fn(),
        updateProfile: vi.fn(),
    },
}));

// Mock React hooks
vi.mock('react', () => ({
    useState: vi.fn((initial) => [initial, vi.fn()]),
    useEffect: vi.fn((fn) => fn()),
    useCallback: vi.fn((fn) => fn),
}));

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn((auth, callback) => {
        callback(null); // Simulate no user
        return vi.fn(); // Return unsubscribe function
    }),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    confirmPasswordReset: vi.fn(),
    updatePassword: vi.fn(),
    updateProfile: vi.fn(),
}));

describe('Auth Service Tests', () => {
    describe('Login', () => {
        it('should login with valid credentials', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
                rememberMe: false,
            };

            // Mock Firebase auth
            const mockSignIn = vi.fn().mockResolvedValue({
                user: { uid: '123', email: 'test@example.com' },
            });

            vi.mocked(require('../firebase/client-init').auth).signInWithEmailAndPassword = mockSignIn;

            const result = await AuthService.login(credentials);

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
            expect(result.message).toBe('Login successful');
        });

        it('should fail with invalid credentials', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'wrongpassword',
                rememberMe: false,
            };

            // Mock Firebase auth error
            const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));

            vi.mocked(require('../firebase/client-init').auth).signInWithEmailAndPassword = mockSignIn;

            const result = await AuthService.login(credentials);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should fail with missing credentials', async () => {
            const credentials: LoginCredentials = {
                email: '',
                password: '',
                rememberMe: false,
            };

            const result = await AuthService.login(credentials);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Email and password are required');
        });
    });

    describe('Register', () => {
        it('should register with valid data', async () => {
            const credentials: RegisterCredentials = {
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'user',
            };

            // Mock Firebase auth
            const mockCreateUser = vi.fn().mockResolvedValue({
                user: { uid: '123', email: 'test@example.com' },
            });

            vi.mocked(require('../firebase/client-init').auth).createUserWithEmailAndPassword = mockCreateUser;

            const result = await AuthService.register(credentials);

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
            expect(result.message).toBe('Registration successful');
        });

        it('should fail with mismatched passwords', async () => {
            const credentials: RegisterCredentials = {
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'differentpassword',
                firstName: 'John',
                lastName: 'Doe',
                role: 'user',
            };

            const result = await AuthService.register(credentials);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Passwords do not match');
        });

        it('should fail with short password', async () => {
            const credentials: RegisterCredentials = {
                email: 'test@example.com',
                password: '123',
                confirmPassword: '123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'user',
            };

            const result = await AuthService.register(credentials);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Password must be at least 6 characters');
        });
    });

    describe('Logout', () => {
        it('should logout successfully', async () => {
            // Mock Firebase auth
            const mockSignOut = vi.fn().mockResolvedValue(undefined);

            vi.mocked(require('../firebase/client-init').auth).signOut = mockSignOut;

            const result = await AuthService.logout();

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.message).toBe('Logout successful');
        });
    });

    describe('Change Password', () => {
        it('should change password successfully', async () => {
            const data: ChangePasswordData = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123',
            };

            // Mock current user
            vi.mocked(require('../firebase/client-init').auth).currentUser = {
                uid: '123',
                email: 'test@example.com',
            };

            // Mock Firebase auth
            const mockUpdatePassword = vi.fn().mockResolvedValue(undefined);

            vi.mocked(require('../firebase/client-init').auth).updatePassword = mockUpdatePassword;

            const result = await AuthService.changePassword(data);

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.message).toBe('Password changed successfully');
        });

        it('should fail with mismatched passwords', async () => {
            const data: ChangePasswordData = {
                currentPassword: 'oldpassword',
                newPassword: 'newpassword123',
                confirmPassword: 'differentpassword',
            };

            const result = await AuthService.changePassword(data);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBe('New passwords do not match');
        });
    });

    describe('Reset Password', () => {
        it('should send reset email successfully', async () => {
            const data: ResetPasswordData = {
                email: 'test@example.com',
            };

            // Mock Firebase auth
            const mockSendResetEmail = vi.fn().mockResolvedValue(undefined);

            vi.mocked(require('../firebase/client-init').auth).sendPasswordResetEmail = mockSendResetEmail;

            const result = await AuthService.resetPassword(data);

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.message).toBe('Password reset email sent');
        });
    });

    describe('Update Profile', () => {
        it('should update profile successfully', async () => {
            const data: UpdateProfileData = {
                firstName: 'John',
                lastName: 'Doe',
                displayName: 'John Doe',
            };

            // Mock current user
            vi.mocked(require('../firebase/client-init').auth).currentUser = {
                uid: '123',
                email: 'test@example.com',
            };

            // Mock Firebase auth
            const mockUpdateProfile = vi.fn().mockResolvedValue(undefined);

            vi.mocked(require('../firebase/client-init').auth).updateProfile = mockUpdateProfile;

            const result = await AuthService.updateProfile(data);

            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.message).toBe('Profile updated successfully');
        });
    });
});

describe('Auth Utils Tests', () => {
    describe('User Validation', () => {
        it('should validate user data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            const result = AuthUtils.validateUserData(validData);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid email', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            const result = AuthUtils.validateUserData(invalidData);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid email format');
        });

        it('should detect short password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '123',
                confirmPassword: '123',
                firstName: 'John',
                lastName: 'Doe',
            };

            const result = AuthUtils.validateUserData(invalidData);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 6 characters');
        });
    });

    describe('Permission Checking', () => {
        const adminUser: ExtendedUser = {
            uid: '123',
            email: 'admin@example.com',
            role: UserRole.ADMIN,
            permissions: [UserPermission.READ, UserPermission.WRITE, UserPermission.DELETE, UserPermission.MANAGE, UserPermission.ADMIN],
        } as ExtendedUser;

        const regularUser: ExtendedUser = {
            uid: '456',
            email: 'user@example.com',
            role: UserRole.USER,
            permissions: [UserPermission.READ, UserPermission.WRITE],
        } as ExtendedUser;

        it('should check user permissions correctly', () => {
            expect(AuthUtils.hasPermission(adminUser, UserPermission.READ)).toBe(true);
            expect(AuthUtils.hasPermission(adminUser, UserPermission.ADMIN)).toBe(true);
            expect(AuthUtils.hasPermission(regularUser, UserPermission.READ)).toBe(true);
            expect(AuthUtils.hasPermission(regularUser, UserPermission.ADMIN)).toBe(false);
        });

        it('should check user roles correctly', () => {
            expect(AuthUtils.hasRole(adminUser, UserRole.ADMIN)).toBe(true);
            expect(AuthUtils.hasRole(adminUser, UserRole.USER)).toBe(false);
            expect(AuthUtils.hasRole(regularUser, UserRole.USER)).toBe(true);
            expect(AuthUtils.hasRole(regularUser, UserRole.ADMIN)).toBe(false);
        });

        it('should check multiple permissions', () => {
            expect(AuthUtils.hasAnyPermission(adminUser, [UserPermission.READ, UserPermission.WRITE])).toBe(true);
            expect(AuthUtils.hasAllPermissions(adminUser, [UserPermission.READ, UserPermission.WRITE])).toBe(true);
            expect(AuthUtils.hasAnyPermission(regularUser, [UserPermission.DELETE, UserPermission.ADMIN])).toBe(false);
            expect(AuthUtils.hasAllPermissions(regularUser, [UserPermission.READ, UserPermission.WRITE])).toBe(true);
        });

        it('should check permissions with details', () => {
            const result = AuthUtils.checkPermission(adminUser, UserPermission.READ, UserRole.ADMIN);
            expect(result.hasPermission).toBe(true);

            const result2 = AuthUtils.checkPermission(regularUser, UserPermission.ADMIN, UserRole.ADMIN);
            expect(result2.hasPermission).toBe(false);
            expect(result2.reason).toBe('Insufficient role');
        });
    });

    describe('Session Management', () => {
        it('should generate session token', () => {
            const token = AuthUtils.generateSessionToken();
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token).toContain('-');
        });

        it('should validate session token', () => {
            const token = AuthUtils.generateSessionToken();
            const isValid = AuthUtils.validateSessionToken(token);
            expect(isValid).toBe(true);
        });

        it('should detect invalid session token', () => {
            const invalidToken = 'invalid-token';
            const isValid = AuthUtils.validateSessionToken(invalidToken);
            expect(isValid).toBe(false);
        });
    });

    describe('User Info Extraction', () => {
        it('should extract basic user info', () => {
            const user = {
                uid: '123',
                email: 'test@example.com',
                displayName: 'John Doe',
                photoURL: 'https://example.com/photo.jpg',
                emailVerified: true,
            };

            const result = AuthUtils.getUserBasicInfo(user as any);

            expect(result).toBeDefined();
            expect(result?.uid).toBe('123');
            expect(result?.email).toBe('test@example.com');
            expect(result?.displayName).toBe('John Doe');
            expect(result?.photoURL).toBe('https://example.com/photo.jpg');
            expect(result?.emailVerified).toBe(true);
        });

        it('should extract extended user info', () => {
            const user: ExtendedUser = {
                uid: '123',
                email: 'test@example.com',
                displayName: 'John Doe',
                photoURL: 'https://example.com/photo.jpg',
                emailVerified: true,
                role: UserRole.ADMIN,
                permissions: [UserPermission.READ, UserPermission.WRITE],
                profile: {
                    firstName: 'John',
                    lastName: 'Doe',
                    bio: 'Test bio',
                },
            } as ExtendedUser;

            const result = AuthUtils.getExtendedUserInfo(user);

            expect(result).toBeDefined();
            expect(result?.uid).toBe('123');
            expect(result?.role).toBe(UserRole.ADMIN);
            expect(result?.permissions).toContain(UserPermission.READ);
            expect(result?.profile.firstName).toBe('John');
        });
    });
});

describe('Auth Hooks Tests', () => {
    describe('useAuth', () => {
        it('should provide auth state and methods', () => {
            const auth = useAuth();

            expect(auth).toBeDefined();
            expect(auth.user).toBeDefined();
            expect(auth.loading).toBeDefined();
            expect(auth.error).toBeDefined();
            expect(auth.isLoggedIn).toBeDefined();
            expect(auth.login).toBeDefined();
            expect(auth.register).toBeDefined();
            expect(auth.logout).toBeDefined();
            expect(auth.changePassword).toBeDefined();
            expect(auth.resetPassword).toBeDefined();
            expect(auth.updateProfile).toBeDefined();
            expect(auth.clearError).toBeDefined();
        });
    });

    describe('useAuthState', () => {
        it('should provide auth state', () => {
            const authState = useAuthState();

            expect(authState).toBeDefined();
            expect(authState.user).toBeDefined();
            expect(authState.loading).toBeDefined();
            expect(authState.isLoggedIn).toBeDefined();
        });
    });

    describe('useAuthPermissions', () => {
        it('should provide permission checks', () => {
            const permissions = useAuthPermissions();

            expect(permissions).toBeDefined();
            expect(permissions.isAdmin).toBeDefined();
            expect(permissions.isUser).toBeDefined();
            expect(permissions.canEdit).toBeDefined();
            expect(permissions.canDelete).toBeDefined();
            expect(permissions.canManage).toBeDefined();
        });
    });

    describe('useCurrentUser', () => {
        it('should provide current user info', () => {
            const currentUser = useCurrentUser();

            expect(currentUser).toBeDefined();
            expect(currentUser.user).toBeDefined();
            expect(currentUser.loading).toBeDefined();
            expect(currentUser.userId).toBeDefined();
            expect(currentUser.email).toBeDefined();
            expect(currentUser.displayName).toBeDefined();
            expect(currentUser.photoURL).toBeDefined();
            expect(currentUser.emailVerified).toBeDefined();
        });
    });
});
