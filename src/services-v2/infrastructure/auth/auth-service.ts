/**
 * خدمة المصادقة - Infrastructure v2.0
 *
 * خدمة محدثة تستخدم BaseServiceV2 مع مراقبة متقدمة للأداء والأخطاء
 */

import { z } from 'zod';
import { BaseServiceV2, ComplexServiceV2 } from '../../core/base-service';

// مخططات التحقق من البيانات
const LoginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const SignupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const ResetPasswordSchema = z.object({
    email: z.string().email('Invalid email format'),
});

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// أنواع البيانات
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: 'user' | 'admin';
    };
    token: string;
    expiresAt: string;
}

export interface SignupResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: 'user';
    };
    message: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface ChangePasswordResponse {
    message: string;
}

/**
 * خدمة تسجيل الدخول المحسنة
 */
export class LoginServiceV2 extends ComplexServiceV2<LoginCredentials, AuthResponse> {
    protected endpoint = '/api/auth/login';
    protected method: 'POST' = 'POST';
    protected inputSchema = LoginSchema;
    protected requiresAuth = false;

    constructor() {
        super(
            {
                endpoint: '/api/auth/login',
                method: 'POST',
                requiresAuth: false,
                timeout: 10000,
                retries: 2,
                retryDelay: 1000,
            },
            {
                name: 'LoginService',
                version: '2.0.0',
                description: 'User login service with enhanced security',
                category: 'infrastructure',
                dependencies: ['Firebase Auth', 'JWT'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<LoginCredentials> {
        const result = LoginSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Login validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }
}

/**
 * خدمة التسجيل المحسنة
 */
export class SignupServiceV2 extends ComplexServiceV2<SignupCredentials, SignupResponse> {
    protected endpoint = '/api/auth/signup';
    protected method: 'POST' = 'POST';
    protected inputSchema = SignupSchema;
    protected requiresAuth = false;

    constructor() {
        super(
            {
                endpoint: '/api/auth/signup',
                method: 'POST',
                requiresAuth: false,
                timeout: 15000,
                retries: 1,
                retryDelay: 2000,
            },
            {
                name: 'SignupService',
                version: '2.0.0',
                description: 'User registration service with validation',
                category: 'infrastructure',
                dependencies: ['Firebase Auth', 'Email Service'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<SignupCredentials> {
        const result = SignupSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Signup validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }
}

/**
 * خدمة إعادة تعيين كلمة المرور المحسنة
 */
export class ResetPasswordServiceV2 extends ComplexServiceV2<{ email: string }, ResetPasswordResponse> {
    protected endpoint = '/api/auth/reset-password';
    protected method: 'POST' = 'POST';
    protected inputSchema = ResetPasswordSchema;
    protected requiresAuth = false;

    constructor() {
        super(
            {
                endpoint: '/api/auth/reset-password',
                method: 'POST',
                requiresAuth: false,
                timeout: 10000,
                retries: 2,
                retryDelay: 1000,
            },
            {
                name: 'ResetPasswordService',
                version: '2.0.0',
                description: 'Password reset service with email delivery',
                category: 'infrastructure',
                dependencies: ['Email Service', 'Firebase Auth'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<{ email: string }> {
        const result = ResetPasswordSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Reset password validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }
}

/**
 * خدمة تغيير كلمة المرور المحسنة
 */
export class ChangePasswordServiceV2 extends ComplexServiceV2<{ currentPassword: string, newPassword: string }, ChangePasswordResponse> {
    protected endpoint = '/api/auth/change-password';
    protected method: 'POST' = 'POST';
    protected inputSchema = ChangePasswordSchema;
    protected requiresAuth = true;

    constructor() {
        super(
            {
                endpoint: '/api/auth/change-password',
                method: 'POST',
                requiresAuth: true,
                timeout: 10000,
                retries: 2,
                retryDelay: 1000,
            },
            {
                name: 'ChangePasswordService',
                version: '2.0.0',
                description: 'Password change service with security validation',
                category: 'infrastructure',
                dependencies: ['Firebase Auth', 'Security Validation'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<{ currentPassword: string, newPassword: string }> {
        const result = ChangePasswordSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Change password validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }
}

/**
 * خدمة تسجيل الخروج المحسنة
 */
export class LogoutServiceV2 extends BaseServiceV2 {
    protected endpoint = '/api/auth/logout';
    protected method: 'POST' = 'POST';
    protected requiresAuth = true;

    constructor() {
        super(
            {
                endpoint: '/api/auth/logout',
                method: 'POST',
                requiresAuth: true,
                timeout: 5000,
                retries: 1,
                retryDelay: 1000,
            },
            {
                name: 'LogoutService',
                version: '2.0.0',
                description: 'User logout service with session cleanup',
                category: 'infrastructure',
                dependencies: ['Firebase Auth', 'Session Management'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<unknown> {
        // لا نحتاج إلى بيانات إدخال لتسجيل الخروج
        return data;
    }
}

/**
 * خدمة التحقق من الجلسة المحسنة
 */
export class SessionServiceV2 extends BaseServiceV2 {
    protected endpoint = '/api/auth/session';
    protected method: 'GET' = 'GET';
    protected requiresAuth = true;

    constructor() {
        super(
            {
                endpoint: '/api/auth/session',
                method: 'GET',
                requiresAuth: true,
                timeout: 5000,
                retries: 2,
                retryDelay: 1000,
            },
            {
                name: 'SessionService',
                version: '2.0.0',
                description: 'Session validation service',
                category: 'infrastructure',
                dependencies: ['Firebase Auth', 'JWT'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<unknown> {
        return data;
    }
}

/**
 * خدمة إدارة الرموز المميزة المحسنة
 */
export class TokenServiceV2 extends BaseServiceV2 {
    protected endpoint = '/api/auth/token';
    protected method: 'POST' = 'POST';
    protected requiresAuth = true;

    constructor() {
        super(
            {
                endpoint: '/api/auth/token',
                method: 'POST',
                requiresAuth: true,
                timeout: 10000,
                retries: 2,
                retryDelay: 1000,
            },
            {
                name: 'TokenService',
                version: '2.0.0',
                description: 'JWT token management service',
                category: 'infrastructure',
                dependencies: ['JWT', 'Redis Cache'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<unknown> {
        // يمكن إضافة مخطط للتحقق من بيانات الرمز المميز هنا
        return data;
    }
}

// نسخ من الخدمات الأصلية للحفاظ على التوافق
export class LoginService extends LoginServiceV2 { }
export class SignupService extends SignupServiceV2 { }
export class ResetPasswordService extends ResetPasswordServiceV2 { }
export class ChangePasswordService extends ChangePasswordServiceV2 { }
export class LogoutService extends LogoutServiceV2 { }
export class SessionService extends SessionServiceV2 { }
export class TokenService extends TokenServiceV2 { }
