/**
 * خدمة المصادقة الموحدة
 *
 * هذا الملف يحتوي على خدمة المصادقة الموحدة
 * التي تدعم Firebase Authentication
 */

import {
    AuthError,
    confirmPasswordReset,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    updateProfile,
    User,
    UserCredential,
} from 'firebase/auth';
import { handleClientError } from '../error-handling';
import { auth } from '../../lib/firebase/client-init';

/**
 * بيانات تسجيل الدخول
 */
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

/**
 * بيانات التسجيل
 */
export interface RegisterCredentials {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    role?: 'user' | 'admin';
}

/**
 * بيانات تغيير كلمة المرور
 */
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * بيانات إعادة تعيين كلمة المرور
 */
export interface ResetPasswordData {
    email: string;
}

/**
 * بيانات تأكيد إعادة تعيين كلمة المرور
 */
export interface ConfirmResetPasswordData {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * بيانات تحديث الملف الشخصي
 */
export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    photoURL?: string;
}

/**
 * نتيجة المصادقة
 */
export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
    message?: string;
}

/**
 * خدمة المصادقة
 */
export class AuthService {
    /**
     * تسجيل الدخول
     */
    static async login(credentials: LoginCredentials): Promise<AuthResult> {
        try {
            const { email, password, rememberMe = false } = credentials;

            // التحقق من صحة البيانات
            if (!email || !password) {
                return {
                    success: false,
                    error: 'Email and password are required',
                };
            }

            // تسجيل الدخول
            const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // تحديث حالة التذكر
            if (rememberMe) {
                // TODO: تنفيذ منطق التذكر
                // يمكن استخدام localStorage أو cookies
            }

            return {
                success: true,
                user,
                message: 'Login successful',
            };

        } catch (error) {
            const authError = error as AuthError;
            const errorResult = handleClientError(authError, { context: 'Login' });
            return {
                success: false,
                error: errorResult.message,
            };
        }
    }

    /**
     * التسجيل
     */
    static async register(credentials: RegisterCredentials): Promise<AuthResult> {
        try {
            const { email, password, confirmPassword, firstName, lastName, role = 'user' } = credentials;

            // التحقق من صحة البيانات
            if (!email || !password || !confirmPassword || !firstName || !lastName) {
                return {
                    success: false,
                    error: 'All fields are required',
                };
            }

            if (password !== confirmPassword) {
                return {
                    success: false,
                    error: 'Passwords do not match',
                };
            }

            if (password.length < 6) {
                return {
                    success: false,
                    error: 'Password must be at least 6 characters',
                };
            }

            // إنشاء حساب جديد
            const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // تحديث الملف الشخصي
            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`,
            });

            // TODO: حفظ البيانات الإضافية في Firestore
            // await saveUserProfile(user.uid, { firstName, lastName, role });

            return {
                success: true,
                user,
                message: 'Registration successful',
            };

        } catch (error) {
            const authError = error as AuthError;
            const errorResult = handleClientError(authError, { context: 'Registration' });
            return {
                success: false,
                error: errorResult.message,
            };
        }
    }

    /**
     * تسجيل الخروج
     */
    static async logout(): Promise<AuthResult> {
        try {
            await signOut(auth);

            return {
                success: true,
                message: 'Logout successful',
            };

        } catch (error) {
            const authError = error as AuthError;
            const errorResult = handleClientError(authError, { context: 'Logout' });
            return {
                success: false,
                error: errorResult.message,
            };
        }
    }

    /**
     * تغيير كلمة المرور
     */
    static async changePassword(data: ChangePasswordData): Promise<AuthResult> {
        try {
            const { currentPassword, newPassword, confirmPassword } = data;

            // التحقق من صحة البيانات
            if (!currentPassword || !newPassword || !confirmPassword) {
                return {
                    success: false,
                    error: 'All fields are required',
                };
            }

            if (newPassword !== confirmPassword) {
                return {
                    success: false,
                    error: 'New passwords do not match',
                };
            }

            if (newPassword.length < 6) {
                return {
                    success: false,
                    error: 'New password must be at least 6 characters',
                };
            }

            // التحقق من المستخدم الحالي
            const user = auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: 'No user logged in',
                };
            }

            // تحديث كلمة المرور
            await updatePassword(user, newPassword);

            return {
                success: true,
                message: 'Password changed successfully',
            };

        } catch (error) {
            const authError = error as AuthError;
            const errorResult = handleClientError(authError, { context: 'Change Password' });
            return {
                success: false,
                error: errorResult.message,
            };
        }
    }

    /**
     * إعادة تعيين كلمة المرور
     */
    static async resetPassword(data: ResetPasswordData): Promise<AuthResult> {
        try {
            const { email } = data;

            // التحقق من صحة البيانات
            if (!email) {
                return {
                    success: false,
                    error: 'Email is required',
                };
            }

            // إرسال رسالة إعادة تعيين
            await sendPasswordResetEmail(auth, email);

            return {
                success: true,
                message: 'Password reset email sent',
            };

        } catch (error) {
            const authError = error as AuthError;
            const errorResult = handleClientError(authError, { context: 'Reset Password' });
            return {
                success: false,
                error: errorResult.message,
            };
        }
    }

    /**
     * تأكيد إعادة تعيين كلمة المرور
     */
    static async confirmResetPassword(data: ConfirmResetPasswordData): Promise<AuthResult> {
        try {
            const { token, newPassword, confirmPassword } = data;

            // التحقق من صحة البيانات
            if (!token || !newPassword || !confirmPassword) {
                return {
                    success: false,
                    error: 'All fields are required',
                };
            }

            if (newPassword !== confirmPassword) {
                return {
                    success: false,
                    error: 'New passwords do not match',
                };
            }

            if (newPassword.length < 6) {
                return {
                    success: false,
                    error: 'New password must be at least 6 characters',
                };
            }

            // تأكيد إعادة تعيين كلمة المرور
            await confirmPasswordReset(auth, token, newPassword);

            return {
                success: true,
                message: 'Password reset successfully',
            };

        } catch (error) {
            const authError = error as AuthError;
            const errorResult = handleClientError(authError, { context: 'Confirm Reset Password' });
            return {
                success: false,
                error: errorResult.message,
            };
        }
    }

    /**
     * تحديث الملف الشخصي
     */
    static async updateProfile(data: UpdateProfileData): Promise<AuthResult> {
        try {
            const { firstName, lastName, displayName, photoURL } = data;

            // التحقق من المستخدم الحالي
            const user = auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: 'No user logged in',
                };
            }

            // تحديث الملف الشخصي
            await updateProfile(user, {
                displayName: displayName || (firstName && lastName ? `${firstName} ${lastName}` : user.displayName),
                photoURL: photoURL || user.photoURL,
            });

            // TODO: تحديث البيانات الإضافية في Firestore
            // if (firstName || lastName) {
            //   await updateUserProfile(user.uid, { firstName, lastName });
            // }

            return {
                success: true,
                user,
                message: 'Profile updated successfully',
            };

        } catch (error) {
            const authError = error as AuthError;
            const errorResult = handleClientError(authError, { context: 'Update Profile' });
            return {
                success: false,
                error: errorResult.message,
            };
        }
    }

    /**
     * الحصول على المستخدم الحالي
     */
    static getCurrentUser(): User | null {
        return auth.currentUser;
    }

    /**
     * التحقق من حالة تسجيل الدخول
     */
    static isLoggedIn(): boolean {
        return !!auth.currentUser;
    }

    /**
     * الحصول على معرف المستخدم
     */
    static getUserId(): string | null {
        return auth.currentUser?.uid || null;
    }

    /**
     * الحصول على بيانات المستخدم
     */
    static getUserData(): {
        uid: string;
        email: string | null;
        displayName: string | null;
        photoURL: string | null;
        emailVerified: boolean;
    } | null {
        const user = auth.currentUser;
        if (!user) return null;

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
        };
    }
}
