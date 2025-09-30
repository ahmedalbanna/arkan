/**
 * Hooks للمصادقة
 *
 * هذا الملف يحتوي على React hooks للمصادقة
 * باستخدام Firebase Authentication
 */

'use client';

import { User, onAuthStateChanged } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { auth } from '../../lib/firebase/client-init';
import { AuthResult, AuthService, ChangePasswordData, ConfirmResetPasswordData, LoginCredentials, RegisterCredentials, ResetPasswordData, UpdateProfileData } from './auth-service';

/**
 * حالة المصادقة
 */
export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isLoggedIn: boolean;
}

/**
 * Hook للمصادقة
 */
export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
        isLoggedIn: false,
    });

    // مراقبة تغيير حالة المصادقة
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthState({
                user,
                loading: false,
                error: null,
                isLoggedIn: !!user,
            });
        });

        return () => unsubscribe();
    }, []);

    // تسجيل الدخول
    const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            const result = await AuthService.login(credentials);

            if (!result.success) {
                setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Login failed' }));
            } else {
                setAuthState(prev => ({ ...prev, loading: false, error: null }));
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // التسجيل
    const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResult> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            const result = await AuthService.register(credentials);

            if (!result.success) {
                setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Registration failed' }));
            } else {
                setAuthState(prev => ({ ...prev, loading: false, error: null }));
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // تسجيل الخروج
    const logout = useCallback(async (): Promise<AuthResult> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            const result = await AuthService.logout();

            if (!result.success) {
                setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Logout failed' }));
            } else {
                setAuthState(prev => ({ ...prev, loading: false, error: null }));
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Logout failed';
            setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // تغيير كلمة المرور
    const changePassword = useCallback(async (data: ChangePasswordData): Promise<AuthResult> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            const result = await AuthService.changePassword(data);

            if (!result.success) {
                setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Password change failed' }));
            } else {
                setAuthState(prev => ({ ...prev, loading: false, error: null }));
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Password change failed';
            setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // إعادة تعيين كلمة المرور
    const resetPassword = useCallback(async (data: ResetPasswordData): Promise<AuthResult> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            const result = await AuthService.resetPassword(data);

            if (!result.success) {
                setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Password reset failed' }));
            } else {
                setAuthState(prev => ({ ...prev, loading: false, error: null }));
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
            setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // تأكيد إعادة تعيين كلمة المرور
    const confirmResetPassword = useCallback(async (data: ConfirmResetPasswordData): Promise<AuthResult> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            const result = await AuthService.confirmResetPassword(data);

            if (!result.success) {
                setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Password reset confirmation failed' }));
            } else {
                setAuthState(prev => ({ ...prev, loading: false, error: null }));
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Password reset confirmation failed';
            setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // تحديث الملف الشخصي
    const updateProfile = useCallback(async (data: UpdateProfileData): Promise<AuthResult> => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            const result = await AuthService.updateProfile(data);

            if (!result.success) {
                setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Profile update failed' }));
            } else {
                setAuthState(prev => ({ ...prev, loading: false, error: null }));
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
            setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // مسح الخطأ
    const clearError = useCallback(() => {
        setAuthState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        ...authState,
        login,
        register,
        logout,
        changePassword,
        resetPassword,
        confirmResetPassword,
        updateProfile,
        clearError,
    };
}

/**
 * Hook للتحقق من حالة تسجيل الدخول
 */
export function useAuthState() {
    const { user, loading, isLoggedIn } = useAuth();

    return {
        user,
        loading,
        isLoggedIn,
    };
}

/**
 * Hook للتحقق من الصلاحيات
 */
export function useAuthPermissions() {
    const { user } = useAuth();

    const isAdmin = user?.uid === 'admin-id'; // TODO: تنفيذ منطق الصلاحيات
    const isUser = !!user;
    const canEdit = isUser;
    const canDelete = isAdmin;
    const canManage = isAdmin;

    return {
        isAdmin,
        isUser,
        canEdit,
        canDelete,
        canManage,
    };
}

/**
 * Hook للتحقق من المستخدم الحالي
 */
export function useCurrentUser() {
    const { user, loading } = useAuth();

    return {
        user,
        loading,
        userId: user?.uid || null,
        email: user?.email || null,
        displayName: user?.displayName || null,
        photoURL: user?.photoURL || null,
        emailVerified: user?.emailVerified || false,
    };
}
