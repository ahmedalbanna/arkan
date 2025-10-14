/**
 * hooks إدارة المستخدمين - النظام الجديد
 *
 * هذا الملف يستخدم النظام الجديد للخدمات مع الحفاظ على التوافق مع النظام القديم
 */

'use client';

import { useAuth } from "@/context/AuthContext";
import { getAuthenticatedToken } from "@/core/utils/authUtils";
import { userKeys } from "@/core/utils/query-keys";
import { useToast } from "@/hooks";
import type { UserProperties } from '@/lib/models/user';
import { User } from '@/lib/models/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from 'zod';

// === النظام الجديد ===
import { adminService, adminUtils } from '@/core/services';

// === النظام القديم (للتوافق) ===
import { legacyServices } from '@/core/services/compatibility-layer';

// === أنواع البيانات ===
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  credits: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
  credits?: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// === Schema للتحقق من البيانات ===
const createUserSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  email: z.string().email("عنوان البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.enum(['user', 'admin']).default('user'),
  credits: z.coerce.number().int().min(0).default(10),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").optional(),
  email: z.string().email("عنوان البريد الإلكتروني غير صحيح").optional(),
  role: z.enum(['user', 'admin']).optional(),
  credits: z.coerce.number().int().min(0).optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// === Hooks إدارة المستخدمين ===

/**
 * Hook للحصول على قائمة المستخدمين مع التصفح اللانهائي
 */
export function useUsersNew() {
  const { firebaseUser } = useAuth();

  return useInfiniteQuery({
    queryKey: userKeys.lists(),
    queryFn: async ({ pageParam }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await adminService.getUsers(token, {
          limit: 20,
          lastVisibleId: pageParam,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });

        if (result.success) {
          return {
            users: result.data.users.map(u => new User(u as UserProperties)),
            hasNextPage: result.data.hasNextPage,
            lastVisibleId: result.data.lastVisibleId
          };
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.user.fetchUsersApi(token, {
          limit: 20,
          lastVisibleId: pageParam
        });

        if (legacyResult.success) {
          return {
            users: legacyResult.data.users.map(u => new User(u as UserProperties)),
            hasNextPage: legacyResult.data.hasNextPage,
            lastVisibleId: legacyResult.data.lastVisibleId
          };
        }

        throw new Error(legacyResult.error);
      }
    },
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
    enabled: !!firebaseUser,
  });
}

/**
 * Hook لإنشاء مستخدم جديد
 */
export function useCreateUserNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await adminUtils.createUserWithErrorHandling(data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.user.createUserApi(data, token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم إنشاء المستخدم",
        description: `تم إنشاء المستخدم ${data.name} بنجاح.`,
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إنشاء المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لتحديث مستخدم
 */
export function useUpdateUserNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserData }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await adminUtils.updateUserWithErrorHandling(userId, data, token);

        if (result.success) {
          return result.data;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.user.updateUserApi(userId, data, token);

        if (legacyResult.success) {
          return legacyResult.data;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "تم تحديث المستخدم",
        description: `تم تحديث المستخدم ${data.name} بنجاح.`,
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile(data.id) });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في تحديث المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لحذف مستخدم
 */
export function useDeleteUserNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد مع معالجة الأخطاء المحسنة
        const result = await adminUtils.deleteUserWithConfirmation(userId, token);

        if (result.success) {
          return result.message;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.user.deleteUserApi(userId, token);

        if (legacyResult.success) {
          return legacyResult.data.message;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (message) => {
      toast({
        title: "تم حذف المستخدم",
        description: message || "تم حذف المستخدم بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في حذف المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لإعادة تعيين كلمة مرور المستخدم
 */
export function useResetUserPasswordNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await adminService.resetUserPassword(userId, token);

        if (result.success) {
          return result.data.message;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.user.sendPasswordResetEmailApi(userId, token);

        if (legacyResult.success) {
          return legacyResult.data.message;
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (message) => {
      toast({
        title: "تم إرسال إعادة تعيين كلمة المرور",
        description: message || "تم إرسال رابط إعادة تعيين كلمة المرور بنجاح.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إرسال إعادة تعيين كلمة المرور",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لتحديث ائتمانات المستخدم
 */
export function useUpdateUserCreditsNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, credits }: { userId: string; credits: number }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await adminService.updateUserCredits(userId, credits, token);

        if (result.success) {
          return result.data.message;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.user.updateUserApi(userId, { credits }, token);

        if (legacyResult.success) {
          return "تم تحديث الائتمانات بنجاح";
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (message) => {
      toast({
        title: "تم تحديث الائتمانات",
        description: message || "تم تحديث ائتمانات المستخدم بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في تحديث الائتمانات",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook لتفعيل/إلغاء تفعيل مستخدم
 */
export function useToggleUserStatusNew() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      try {
        // استخدام النظام الجديد أولاً
        const result = await adminService.toggleUserStatus(userId, isActive, token);

        if (result.success) {
          return result.data.message;
        }

        throw new Error(result.error);
      } catch (error) {
        // في حالة فشل النظام الجديد، استخدام النظام القديم
        console.warn('Falling back to legacy system:', error);
        const legacyResult = await legacyServices.user.updateUserApi(userId, { isActive }, token);

        if (legacyResult.success) {
          return isActive ? "تم تفعيل المستخدم" : "تم إلغاء تفعيل المستخدم";
        }

        throw new Error(legacyResult.error);
      }
    },
    onSuccess: (message) => {
      toast({
        title: "تم تحديث حالة المستخدم",
        description: message || "تم تحديث حالة المستخدم بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في تحديث حالة المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// === Hooks للواجهات ===

/**
 * Hook لحوار إنشاء مستخدم
 */
export function useCreateUserDialogNew() {
  const [isOpen, setIsOpen] = useState(false);
  const createUserMutation = useCreateUserNew();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user',
      credits: 10,
    },
  });

  const onSubmit = (data: CreateUserFormValues) => {
    createUserMutation.mutate(data, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      }
    });
  };

  return {
    isOpen,
    setIsOpen,
    form,
    mutation: createUserMutation,
    onSubmit,
  };
}

/**
 * Hook لحوار تحديث مستخدم
 */
export function useUpdateUserDialogNew() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const updateUserMutation = useUpdateUserNew();

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
      credits: 0,
    },
  });

  const openDialog = (user: User) => {
    setSelectedUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
    });
    setIsOpen(true);
  };

  const onSubmit = (data: UpdateUserFormValues) => {
    if (!selectedUser) return;

    updateUserMutation.mutate({
      userId: selectedUser.id,
      data
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setSelectedUser(null);
        form.reset();
      }
    });
  };

  return {
    isOpen,
    setIsOpen,
    selectedUser,
    setSelectedUser,
    form,
    mutation: updateUserMutation,
    onSubmit,
    openDialog,
  };
}

/**
 * Hook لإدارة المستخدمين المتقدمة
 */
export function useAdvancedUserManagementNew() {
  const usersQuery = useUsersNew();
  const deleteUserMutation = useDeleteUserNew();
  const resetPasswordMutation = useResetUserPasswordNew();
  const updateCreditsMutation = useUpdateUserCreditsNew();
  const toggleStatusMutation = useToggleUserStatusNew();

  const allUsers: User[] = usersQuery.data?.pages.flatMap(page => page.users) ?? [];

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleResetPassword = (userId: string) => {
    resetPasswordMutation.mutate(userId);
  };

  const handleUpdateCredits = (userId: string, credits: number) => {
    updateCreditsMutation.mutate({ userId, credits });
  };

  const handleToggleStatus = (userId: string, isActive: boolean) => {
    toggleStatusMutation.mutate({ userId, isActive });
  };

  return {
    // البيانات
    allUsers,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,

    // العمليات
    fetchNextPage: usersQuery.fetchNextPage,
    hasNextPage: usersQuery.hasNextPage,
    isFetchingNextPage: usersQuery.isFetchingNextPage,

    // الطرق
    handleDeleteUser,
    handleResetPassword,
    handleUpdateCredits,
    handleToggleStatus,

    // حالة الطفرات
    isDeleting: deleteUserMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingCredits: updateCreditsMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,
  };
}
