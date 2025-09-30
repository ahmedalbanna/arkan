/**
 * خدمة المصادقة
 *
 * هذا الملف يحتوي على جميع وظائف المصادقة والتسجيل
 */

import { AuthSchemas } from '@/app/api/shared/validators/api-validators';
import type { SignupCredentials } from "@/components/auth/SignupForm";
import { apiClient } from '../shared/api-client';
import { ComplexService, SimpleService } from '../shared/base-service';

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

/**
 * خدمة تسجيل الدخول
 */
export class LoginService extends ComplexService<LoginCredentials, AuthResponse> {
    protected endpoint = '/api/auth/login';
    protected method: 'POST' = 'POST';
    protected inputSchema = AuthSchemas.login;
    protected requiresAuth = false;
}

/**
 * خدمة التسجيل
 */
export class SignupService extends ComplexService<SignupCredentials, SignupResponse> {
    protected endpoint = '/api/auth/signup';
    protected method: 'POST' = 'POST';
    protected inputSchema = AuthSchemas.signup;
    protected requiresAuth = false;
}

/**
 * خدمة تسجيل الخروج
 */
export class LogoutService extends SimpleService<{ message: string }> {
    protected endpoint = '/api/auth/logout';
    protected requiresAuth = true;

    async call(token: string): Promise<{ message: string }> {
        return apiClient.post(this.endpoint, {}, { token });
    }
}

/**
 * خدمة إعادة تعيين كلمة المرور
 */
export class ResetPasswordService extends ComplexService<{ email: string }, ResetPasswordResponse> {
    protected endpoint = '/api/auth/reset-password';
    protected method: 'POST' = 'POST';
    protected inputSchema = AuthSchemas.resetPassword;
    protected requiresAuth = false;
}

/**
 * خدمة تغيير كلمة المرور
 */
export class ChangePasswordService extends ComplexService<{ currentPassword: string; newPassword: string }, { message: string }> {
    protected endpoint = '/api/auth/change-password';
    protected method: 'POST' = 'POST';
    protected inputSchema = AuthSchemas.changePassword;
    protected requiresAuth = true;
}

/**
 * دوال مساعدة للمصادقة
 */
export const authService = {
    login: new LoginService(),
    signup: new SignupService(),
    logout: new LogoutService(),
    resetPassword: new ResetPasswordService(),
    changePassword: new ChangePasswordService(),
};

/**
 * دالة تسجيل الدخول بالبريد الإلكتروني
 * تستخدم Firebase Client SDK لإنشاء جلسة مصادقة صحيحة
 */
export async function loginWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
    const { auth } = await import('@/lib/firebase/client-init');
    const { signInWithEmailAndPassword } = await import('firebase/auth');

    try {
        // تسجيل الدخول باستخدام Firebase Client SDK
        const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        const user = userCredential.user;

        if (!user) {
            throw new Error('Authentication failed');
        }

        // الحصول على ID token
        const idToken = await user.getIdToken();

        // إنشاء جلسة مصادقة
        await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });

        // إنشاء ملف المستخدم إذا لم يكن موجوداً
        await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                phoneNumber: user.phoneNumber,
            })
        });

        return {
            user: {
                id: user.uid,
                email: user.email || '',
                name: user.displayName || user.email?.split('@')[0] || 'User',
                role: 'user' as const,
            },
            token: idToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
    } catch (error: any) {
        console.error('Login error:', error);

        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            throw new Error('Invalid email or password');
        }

        if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email format');
        }

        if (error.code === 'auth/too-many-requests') {
            throw new Error('Too many failed attempts. Please try again later.');
        }

        throw new Error('Login failed');
    }
}

/**
 * دالة التسجيل
 * تستخدم Firebase Client SDK لإنشاء حساب جديد وجلسة مصادقة
 */
export async function signupUser(credentials: SignupCredentials): Promise<SignupResponse> {
    const { auth } = await import('@/lib/firebase/client-init');
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');

    try {
        // إنشاء حساب جديد باستخدام Firebase Client SDK
        const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
        const user = userCredential.user;

        if (!user) {
            throw new Error('Account creation failed');
        }

        // تحديث ملف المستخدم
        await updateProfile(user, {
            displayName: credentials.name,
        });

        // الحصول على ID token
        const idToken = await user.getIdToken();

        // إنشاء جلسة مصادقة
        await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });

        // إنشاء ملف المستخدم في Firestore
        await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: credentials.name,
                phoneNumber: user.phoneNumber,
            })
        });

        return {
            user: {
                id: user.uid,
                email: user.email || '',
                name: credentials.name,
                role: 'user' as const,
            },
            message: 'Account created successfully',
        };
    } catch (error: any) {
        console.error('Signup error:', error);

        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Email already in use');
        }

        if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email format');
        }

        if (error.code === 'auth/weak-password') {
            throw new Error('Password is too weak');
        }

        throw new Error('Account creation failed');
    }
}

/**
 * دالة تسجيل الخروج
 * تنظف الجلسة وتخرج من Firebase
 */
export async function logoutUser(token: string): Promise<{ message: string }> {
    try {
        // تنظيف جلسة الخادم
        await fetch('/api/auth/session', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        // تسجيل الخروج من Firebase
        const { auth } = await import('@/lib/firebase/client-init');
        const { signOut } = await import('firebase/auth');
        await signOut(auth);

        return { message: 'Logged out successfully' };
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Logout failed');
    }
}

/**
 * دالة إعادة تعيين كلمة المرور
 */
export async function resetPassword(email: string): Promise<ResetPasswordResponse> {
    return authService.resetPassword.call({ email }, '');
}

/**
 * دالة تغيير كلمة المرور
 */
export async function changePassword(
    currentPassword: string,
    newPassword: string,
    token: string
): Promise<{ message: string }> {
    return authService.changePassword.call({ currentPassword, newPassword }, token);
}
