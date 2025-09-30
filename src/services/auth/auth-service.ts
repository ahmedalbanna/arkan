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
 */
export async function loginWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
    return authService.login.call(credentials, '');
}

/**
 * دالة التسجيل
 */
export async function signupUser(credentials: SignupCredentials): Promise<SignupResponse> {
    return authService.signup.call(credentials, '');
}

/**
 * دالة تسجيل الخروج
 */
export async function logoutUser(token: string): Promise<{ message: string }> {
    return authService.logout.call(token);
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
