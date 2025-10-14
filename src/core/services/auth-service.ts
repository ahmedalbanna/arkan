/**
 * خدمات المصادقة المبسطة
 *
 * نظام مبسط لخدمات المصادقة والتسجيل
 */

import type { SignupCredentials } from "@/components/auth/SignupForm";
import { AuthSchemas } from '@/core/validation/api-validators';
import type { UserProfile } from './admin-service';
import { api } from './simple-service';

// أنواع البيانات
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

// دوال المصادقة المبسطة
export const authService = {
  // تسجيل الدخول
  async login(credentials: LoginCredentials) {
    const validatedData = AuthSchemas.login.parse(credentials);
    return api.post<AuthResponse>('/auth/login', validatedData);
  },

  // التسجيل
  async signup(credentials: SignupCredentials) {
    const validatedData = AuthSchemas.signup.parse(credentials);
    return api.post<SignupResponse>('/auth/signup', validatedData);
  },

  // تسجيل الخروج
  async logout(token: string) {
    return api.post<{ message: string }>('/auth/logout', {}, { token });
  },

  // إعادة تعيين كلمة المرور
  async resetPassword(email: string) {
    const validatedData = AuthSchemas.resetPassword.parse({ email });
    return api.post<ResetPasswordResponse>('/auth/reset-password', validatedData);
  },

  // تغيير كلمة المرور
  async changePassword(data: { currentPassword: string; newPassword: string }, token: string) {
    const validatedData = AuthSchemas.changePassword.parse(data);
    return api.post<{ message: string }>('/auth/change-password', validatedData, { token });
  },

  // الحصول على ملف المستخدم الشخصي
  async getProfile(userId: string, token: string) {
    return api.get(`/users/${userId}`, { token });
  },

  // تحديث ملف المستخدم الشخصي
  async updateProfile(userId: string, data: any, token: string) {
    return api.put(`/users/${userId}`, data, { token });
  },

  // رفع صورة الملف الشخصي
  async uploadProfilePicture(userId: string, file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);

    return api.post<{ message: string; imageUrl: string }>(
      `/users/${userId}/upload-profile-picture`,
      formData,
      {
        token,
        headers: {
          // لا نضع Content-Type للـ FormData
        }
      }
    );
  },

  // === خدمات إضافية للمصادقة ===

  // الحصول على قائمة المديرين
  async getAdmins() {
    return api.get<UserProfile[]>('/admins');
  },

  // إرسال إعادة تعيين كلمة المرور للمستخدم
  async sendPasswordResetEmail(userId: string, token: string) {
    return api.post<{ message: string }>(`/users/${userId}/reset-password`, {}, { token });
  },

  // تسجيل الدخول مع Google (مؤقت)
  async loginWithGoogle(credentials: any) {
    return api.post<AuthResponse>('/auth/google', credentials);
  },

  // نسيان كلمة المرور (مؤقت)
  async forgotPassword(email: string) {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  },

  // شراء ائتمانات (مؤقت)
  async purchaseCredits(data: any, token: string) {
    return api.post<{ message: string }>('/payment/purchase-credits', data, { token });
  },

  // حفظ رمز الجهاز للإشعارات
  async saveDeviceToken(deviceToken: string, userId: string, token: string) {
    return api.post<{ message: string }>('/users/device-token', { deviceToken, userId }, { token });
  },

  // الاشتراك في تحديثات الملف الشخصي
  async subscribeToUserProfile(userId: string, callback: (user: any) => void) {
    // هذا مؤقت - سيتم تنفيذه لاحقاً
    console.log('Subscribe to user profile:', userId, callback);
    return Promise.resolve();
  },
};

// دوال مساعدة للمصادقة
export const authUtils = {
  // تسجيل الدخول مع معالجة الأخطاء
  async loginWithErrorHandling(credentials: LoginCredentials) {
    try {
      const result = await authService.login(credentials);

      if (result.success) {
        // حفظ التوكن في localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', result.data!.token);
          localStorage.setItem('user', JSON.stringify(result.data!.user));
        }
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  },

  // تسجيل الخروج مع تنظيف البيانات
  async logoutWithCleanup(token: string) {
    try {
      await authService.logout(token);

      // تنظيف البيانات المحفوظة
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }

      return { success: true };
    } catch (error) {
      // حتى لو فشل الطلب، ننظف البيانات المحلية
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  },

  // الحصول على التوكن المحفوظ
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },

  // الحصول على بيانات المستخدم المحفوظة
  getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // التحقق من صحة التوكن
  isTokenValid(token: string): boolean {
    if (!token) return false;

    try {
      // فحص بسيط للتأكد من أن التوكن ليس فارغاً
      return token.length > 10;
    } catch {
      return false;
    }
  },

  // التحقق من حالة المصادقة
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return token ? this.isTokenValid(token) : false;
  },

  // === دوال مساعدة إضافية ===

  // تحديث الملف الشخصي مع معالجة الأخطاء
  async updateProfileWithErrorHandling(userId: string, data: any, token: string) {
    try {
      const result = await authService.updateProfile(userId, data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  },

  // رفع صورة الملف الشخصي مع معالجة الأخطاء
  async uploadProfilePictureWithErrorHandling(userId: string, file: File, token: string) {
    try {
      const result = await authService.uploadProfilePicture(userId, file, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload profile picture'
      };
    }
  },

  // تغيير كلمة المرور مع معالجة الأخطاء
  async changePasswordWithErrorHandling(data: { currentPassword: string; newPassword: string }, token: string) {
    try {
      const result = await authService.changePassword(data, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Password changed successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password'
      };
    }
  },

  // إعادة تعيين كلمة المرور مع معالجة الأخطاء
  async resetPasswordWithErrorHandling(email: string) {
    try {
      const result = await authService.resetPassword(email);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Password reset email sent' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password'
      };
    }
  },

  // تسجيل الدخول مع Google مع معالجة الأخطاء
  async loginWithGoogleWithErrorHandling(credentials: any) {
    try {
      const result = await authService.loginWithGoogle(credentials);

      if (result.success) {
        // حفظ التوكن في localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', result.data!.token);
          localStorage.setItem('user', JSON.stringify(result.data!.user));
        }
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google login failed'
      };
    }
  },

  // شراء ائتمانات مع معالجة الأخطاء
  async purchaseCreditsWithErrorHandling(data: any, token: string) {
    try {
      const result = await authService.purchaseCredits(data, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Credits purchased successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to purchase credits'
      };
    }
  },

  // حفظ رمز الجهاز مع معالجة الأخطاء
  async saveDeviceTokenWithErrorHandling(deviceToken: string, userId: string, token: string) {
    try {
      const result = await authService.saveDeviceToken(deviceToken, userId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Device token saved successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save device token'
      };
    }
  },
};
