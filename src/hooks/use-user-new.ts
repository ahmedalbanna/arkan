/**
 * hooks المستخدمين - النظام الجديد
 *
 * هذا الملف يستخدم النظام الجديد للخدمات مع الحفاظ على التوافق مع النظام القديم
 */

'use client';

import { useAuth } from "@/context/AuthContext";
import { getAuthenticatedToken } from "@/core/utils/authUtils";
import { handleErrorUtility } from "@/core/utils/errorUtils";
import { userKeys } from '@/core/utils/query-keys';
import { toast } from "@/hooks";
import { auth } from '@/lib/firebase/client-init';
import { User, type UserProperties } from '@/lib/models/user';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    type ConfirmationResult
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// === النظام الجديد ===
import { adminService, authService, authUtils } from '@/core/services';

// === النظام القديم (للتوافق) ===
import { legacyServices } from '@/core/services';

const USERS_PER_PAGE = 10;

/**
 * Fetches a paginated list of all users from the API.
 * Uses the NEW system with fallback to legacy system.
 * Returns instances of the User CLASS.
 */
export function useUsers() {
  const { firebaseUser } = useAuth();

  return useInfiniteQuery({
    queryKey: userKeys.lists(),
    queryFn: async ({ pageParam }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await adminService.getUsers(token, {
          limit: USERS_PER_PAGE,
          lastVisibleId: pageParam
        });

        if (result.success) {
          return {
            ...result.data,
            users: result.data.users.map(u => new User(u as UserProperties))
          };
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.user.fetchUsersApi(token, {
          limit: USERS_PER_PAGE,
          lastVisibleId: pageParam
        });

        if (legacyResult.success) {
          return {
            ...legacyResult.data,
            users: legacyResult.data.users.map(u => new User(u as UserProperties))
          };
        }

        throw new Error(legacyResult.error);
      }
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
    enabled: !!firebaseUser,
  });
}

/**
 * Fetches all admin users.
 * Uses the NEW system with fallback to legacy system.
 * Returns instances of the User CLASS.
 */
export function useAdmins() {
  const { firebaseUser } = useAuth();

  return useQuery<User[]>({
    queryKey: userKeys.admins(),
    queryFn: async () => {
      try {
        // استخدام النظام الجديد أولاً
        const result = await authService.getAdmins();

        if (result.success) {
          return result.data.map(u => new User(u as UserProperties));
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.user.fetchAdminsApi();

        if (legacyResult.success) {
          return legacyResult.data.map(u => new User(u as UserProperties));
        }

        throw new Error(legacyResult.error);
      }
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetches a single user by their ID.
 * Uses the NEW system with fallback to legacy system.
 * Returns an instance of the User CLASS.
 */
export function useUserProfile(userId: string) {
  const { firebaseUser } = useAuth();

  return useQuery<User | null>({
    queryKey: userKeys.profile(userId),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await adminService.getUser(userId, token);

        if (result.success) {
          return new User(result.data as UserProperties);
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.user.fetchUserProfileApi(userId, token);

        if (legacyResult.success) {
          return new User(legacyResult.data as UserProperties);
        }

        throw new Error(legacyResult.error);
      }
    },
    enabled: !!firebaseUser && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Custom mutation hook for user login.
 * Uses the NEW system with enhanced error handling.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authUtils.loginWithErrorHandling(credentials);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.auth.loginWithEmail(credentials);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${data.user.name}!`,
      });

      // إعادة تحميل بيانات المستخدم
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // الانتقال إلى الصفحة الرئيسية
      router.push('/');
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في تسجيل الدخول");
    }
  });
}

/**
 * Custom mutation hook for Google sign-in.
 * Uses the NEW system with enhanced error handling.
 */
export function useGoogleSignIn() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: any) => {
      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authUtils.loginWithGoogleWithErrorHandling(credentials);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.auth.loginWithGoogle(credentials);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${data.user.name}!`,
      });

      // إعادة تحميل بيانات المستخدم
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // الانتقال إلى الصفحة الرئيسية
      router.push('/');
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في تسجيل الدخول مع Google");
    }
  });
}

/**
 * Custom mutation hook for user logout.
 * Uses the NEW system with enhanced error handling.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authUtils.logoutWithCleanup(token);

        if (result.success) {
          return result;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.auth.serviceLogoutUser(token);

        if (legacyResult.success) {
          return legacyResult;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: () => {
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراكم قريباً!",
      });

      // تنظيف جميع البيانات المحفوظة
      queryClient.clear();

      // الانتقال إلى صفحة تسجيل الدخول
      router.push('/auth/login');
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في تسجيل الخروج");
    }
  });
}

/**
 * Custom mutation hook for user signup.
 * Uses the NEW system with enhanced error handling.
 */
export function useSignup(options?: { onError?: (error: any) => void }) {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: any) => {
      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authService.signup(credentials);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.auth.serviceSignupUser(credentials);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: data.message || "مرحباً بك في منصتنا!",
      });

      // إعادة تحميل بيانات المستخدم
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // الانتقال إلى صفحة تسجيل الدخول
      router.push('/auth/login');
    },
    onError: (error) => {
      if (options?.onError) {
        options.onError(error);
      } else {
        handleErrorUtility(error, "فشل في إنشاء الحساب");
      }
    }
  });
}

/**
 * Custom mutation hook for sending password reset email.
 * Uses the NEW system with enhanced error handling.
 */
export function useSendPasswordReset() {
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (email: string) => {
      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authUtils.resetPasswordWithErrorHandling(email);

        if (result.success) {
          return result.message;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.auth.forgotPasswordService(email);

        if (legacyResult.success) {
          return legacyResult.data.message;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (message) => {
      toast({
        title: "تم إرسال البريد الإلكتروني",
        description: message || "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور.",
      });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في إرسال بريد إعادة التعيين");
    }
  });
}

/**
 * Custom mutation hook for forgot password.
 * Uses the NEW system with enhanced error handling.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authUtils.resetPasswordWithErrorHandling(email);

        if (result.success) {
          return result.message;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.auth.forgotPasswordService(email);

        if (legacyResult.success) {
          return legacyResult.data.message;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (message) => {
      toast({
        title: "تم إرسال البريد الإلكتروني",
        description: message || "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور.",
      });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في إرسال بريد إعادة التعيين");
    }
  });
}

/**
 * Custom hook for phone number sign-in with OTP.
 * Uses Firebase Auth directly (no backend changes needed).
 */
export function usePhoneSignIn() {
  const { firebaseUser } = useAuth();
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
      setRecaptchaVerifier(verifier);
    }
  }, []);

  const sendOtp = async (phoneNumber: string) => {
    if (!recaptchaVerifier) {
      throw new Error('reCAPTCHA verifier not initialized');
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const verifyOtp = async (
    confirmationResult: ConfirmationResult,
    otp: string
  ) => {
    try {
      const result = await confirmationResult.confirm(otp);
      return result.user;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  return {
    sendOtp,
    verifyOtp,
    recaptchaVerifier
  };
}

/**
 * Custom mutation hook for purchasing credits.
 * Uses the NEW system with enhanced error handling.
 */
export function usePurchaseCredits() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authUtils.purchaseCreditsWithErrorHandling(data, token);

        if (result.success) {
          return result.message;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.auth.purchaseCreditsApi(data, token);

        if (legacyResult.success) {
          return legacyResult.data.message;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (message) => {
      toast({
        title: "تم شراء الائتمانات بنجاح",
        description: message || "تمت إضافة الائتمانات إلى حسابك.",
      });

      // إعادة تحميل بيانات المستخدم
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في شراء الائتمانات");
    }
  });
}

/**
 * Custom hook for managing user profile updates.
 * Uses the NEW system with enhanced error handling.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authUtils.updateProfileWithErrorHandling(userId, data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await authService.updateProfile(userId, data, token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم تحديث الملف الشخصي بنجاح",
        description: "تم حفظ التغييرات بنجاح.",
      });

      // إعادة تحميل بيانات المستخدم
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في تحديث الملف الشخصي");
    }
  });
}

/**
 * Custom hook for uploading profile picture.
 * Uses the NEW system with enhanced error handling.
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authUtils.uploadProfilePictureWithErrorHandling(userId, file, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await authService.uploadProfilePicture(userId, file, token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم رفع الصورة بنجاح",
        description: "تم تحديث صورة الملف الشخصي بنجاح.",
      });

      // إعادة تحميل بيانات المستخدم
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في رفع الصورة");
    }
  });
}

/**
 * Custom hook for changing password.
 * Uses the NEW system with enhanced error handling.
 */
export function useChangePassword() {
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authUtils.changePasswordWithErrorHandling(data, token);

        if (result.success) {
          return result.message;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await authService.changePassword(data, token);

        if (legacyResult.success) {
          return legacyResult.data.message;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (message) => {
      toast({
        title: "تم تغيير كلمة المرور بنجاح",
        description: message || "تم تحديث كلمة المرور بنجاح.",
      });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في تغيير كلمة المرور");
    }
  });
}

/**
 * Custom hook for saving device token for notifications.
 * Uses the NEW system with enhanced error handling.
 */
export function useSaveDeviceToken() {
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async ({ deviceToken, userId }: { deviceToken: string; userId: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await authUtils.saveDeviceTokenWithErrorHandling(deviceToken, userId, token);

        if (result.success) {
          return result.message;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await authService.saveDeviceToken(deviceToken, userId, token);

        if (legacyResult.success) {
          return legacyResult.data.message;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (message) => {
      toast({
        title: "تم حفظ رمز الجهاز بنجاح",
        description: message || "تم حفظ رمز الجهاز للإشعارات بنجاح.",
      });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في حفظ رمز الجهاز");
    }
  });
}
