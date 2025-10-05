/**
 * خدمة المصادقة - Services v2.0
 *
 * خدمة محسنة للمصادقة والتسجيل مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface LoginCredentials {
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

export interface SignupCredentials {
    name: string;
    email: string;
    password: string;
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

export interface ChangePasswordCredentials {
    currentPassword: string;
    newPassword: string;
}

export interface SessionInfo {
    userId: string;
    sessionId: string;
    createdAt: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
}

export class AuthServiceV2 extends BaseService {
    constructor() {
        super('AuthServiceV2');
    }

    /**
     * تسجيل الدخول مع مراقبة الأداء
     */
    async loginWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
        const operationId = this.startOperation('loginWithEmail');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }

            const authResponse = await response.json();
            this.endOperation(operationId, { success: true });
            return authResponse;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.loginWithEmail');
            throw error;
        }
    }

    /**
     * تسجيل حساب جديد مع مراقبة شاملة
     */
    async signupUser(credentials: SignupCredentials): Promise<SignupResponse> {
        const operationId = this.startOperation('signupUser');

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Signup failed');
            }

            const signupResponse = await response.json();
            this.endOperation(operationId, { success: true });
            return signupResponse;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.signupUser');
            throw error;
        }
    }

    /**
     * تسجيل الخروج مع مراقبة الأداء
     */
    async logoutUser(token: string): Promise<void> {
        const operationId = this.startOperation('logoutUser');

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Logout failed');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.logoutUser');
            throw error;
        }
    }

    /**
     * إعادة تعيين كلمة المرور مع مراقبة شاملة
     */
    async resetPassword(email: string): Promise<ResetPasswordResponse> {
        const operationId = this.startOperation('resetPassword');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Reset password failed');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.resetPassword');
            throw error;
        }
    }

    /**
     * تغيير كلمة المرور مع مراقبة الأداء
     */
    async changePassword(credentials: ChangePasswordCredentials, token: string): Promise<{
        message: string;
        updatedAt: string;
    }> {
        const operationId = this.startOperation('changePassword');

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Change password failed');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.changePassword');
            throw error;
        }
    }

    /**
     * التحقق من صحة الرمز المميز مع مراقبة شاملة
     */
    async verifyToken(token: string): Promise<{
        valid: boolean;
        user?: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
        expiresAt?: string;
    }> {
        const operationId = this.startOperation('verifyToken');

        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                this.endOperation(operationId, { success: true, valid: false });
                return { valid: false };
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, valid: result.valid });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.verifyToken');
            throw error;
        }
    }

    /**
     * إعادة إرسال رمز التحقق مع مراقبة الأداء
     */
    async resendVerification(email: string): Promise<{
        message: string;
        expiresAt: string;
    }> {
        const operationId = this.startOperation('resendVerification');

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Resend verification failed');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.resendVerification');
            throw error;
        }
    }

    /**
     * التحقق من البريد الإلكتروني مع مراقبة شاملة
     */
    async verifyEmail(token: string): Promise<{
        verified: boolean;
        message: string;
    }> {
        const operationId = this.startOperation('verifyEmail');

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Email verification failed');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, verified: result.verified });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.verifyEmail');
            throw error;
        }
    }

    /**
     * جلب معلومات الجلسة مع مراقبة الأداء
     */
    async getSessionInfo(token: string): Promise<SessionInfo> {
        const operationId = this.startOperation('getSessionInfo');

        try {
            const response = await fetch('/api/auth/session', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get session info');
            }

            const sessionInfo = await response.json();
            this.endOperation(operationId, { success: true });
            return sessionInfo;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.getSessionInfo');
            throw error;
        }
    }

    /**
     * إنهاء جميع الجلسات مع مراقبة شاملة
     */
    async revokeAllSessions(token: string): Promise<{
        message: string;
        revokedSessions: number;
    }> {
        const operationId = this.startOperation('revokeAllSessions');

        try {
            const response = await fetch('/api/auth/revoke-all-sessions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to revoke all sessions');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, revokedCount: result.revokedSessions });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.revokeAllSessions');
            throw error;
        }
    }

    /**
     * تسجيل الدخول بحساب جوجل مع مراقبة الأداء
     */
    async loginWithGoogle(credentials: {
        idToken: string;
        accessToken?: string;
    }): Promise<AuthResponse> {
        const operationId = this.startOperation('loginWithGoogle');

        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Google login failed');
            }

            const authResponse = await response.json();
            this.endOperation(operationId, { success: true });
            return authResponse;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.loginWithGoogle');
            throw error;
        }
    }

    /**
     * جلب إحصائيات المصادقة مع مراقبة شاملة
     */
    async getAuthStats(token: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
        totalLogins: number;
        uniqueUsers: number;
        failedAttempts: number;
        loginByMethod: Record<string, number>;
        topCountries: Array<{
            country: string;
            count: number;
        }>;
    }> {
        const operationId = this.startOperation('getAuthStats');

        try {
            const response = await fetch(`/api/auth/stats?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch auth stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.getAuthStats');
            throw error;
        }
    }

    /**
     * فحص صحة المصادقة مع مراقبة الأداء
     */
    async checkAuthHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        responseTime: number;
        errorRate: number;
        uptime: number;
    }> {
        const operationId = this.startOperation('checkAuthHealth');

        try {
            const response = await fetch('/api/auth/health', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Auth service health check failed');
            }

            const health = await response.json();
            this.endOperation(operationId, { success: true, status: health.status });
            return health;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AuthServiceV2.checkAuthHealth');
            throw error;
        }
    }
}