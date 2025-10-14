/**
 * مثال على استخدام النظام الجديد في hooks
 *
 * هذا الملف يوضح كيفية الانتقال التدريجي من النظام القديم إلى الجديد
 */

'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/core/utils/authUtils';
import { handleErrorUtility } from '@/core/utils/errorUtils';
import { userKeys } from '@/core/utils/query-keys';
import { toast } from "@/hooks";
import { User, type UserProperties } from '@/lib/models/user';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// === النظام الجديد ===
import { adminService, authService } from '@/core/services';

// === النظام القديم (للتوافق) ===
import { legacyServices } from '@/core/services';

const USERS_PER_PAGE = 10;

/**
 * مثال على hook يستخدم النظام الجديد مباشرة
 * هذا هو الاتجاه المطلوب للهجرة
 */
export function useUsersNew() {
  const { firebaseUser } = useAuth();

  return useInfiniteQuery({
    queryKey: userKeys.lists(),
    queryFn: async ({ pageParam }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      // استخدام النظام الجديد مباشرة
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
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
    enabled: !!firebaseUser,
  });
}

/**
 * مثال على hook يستخدم طبقة التوافق
 * هذا للانتقال التدريجي من النظام القديم
 */
export function useUsersCompatibility() {
  const { firebaseUser } = useAuth();

  return useInfiniteQuery({
    queryKey: userKeys.lists(),
    queryFn: async ({ pageParam }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      // استخدام طبقة التوافق التي تستدعي النظام الجديد داخلياً
      const result = await legacyServices.user.fetchUsersApi(token, {
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
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.lastVisibleId : undefined,
    enabled: !!firebaseUser,
  });
}

/**
 * مثال على hook للمصادقة باستخدام النظام الجديد
 */
export function useLoginNew() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      // استخدام النظام الجديد مباشرة
      const result = await authService.login(credentials);

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error);
    },
    onSuccess: (data) => {
      // حفظ التوكن في localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${data.user.name}!`,
      });

      // إعادة تحميل بيانات المستخدم
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في تسجيل الدخول");
    }
  });
}

/**
 * مثال على hook للذكاء الاصطناعي باستخدام النظام الجديد
 */
export function useWritingToolNew(tool: string) {
  const { firebaseUser, refetchUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: { text: string; options?: Record<string, any> }) => {
      const token = await getAuthenticatedToken(firebaseUser);

      // استخدام النظام الجديد مباشرة
      let result;

      switch (tool) {
        case 'improve':
          result = await aiService.improveText(variables, token);
          break;
        case 'summarize':
          result = await aiService.summarizeText(variables, token);
          break;
        case 'paraphrase':
          result = await aiService.paraphraseText(variables, token);
          break;
        case 'ai-detector':
          result = await aiService.detectAIContent({ text: variables.text }, token);
          break;
        case 'fact-check':
          result = await aiService.factCheck({ text: variables.text }, token);
          break;
        case 'plagiarism-check':
          result = await aiService.plagiarismCheck({ text: variables.text }, token);
          break;
        case 'ai-researcher':
          result = await aiService.aiResearcher({ topic: variables.text }, token);
          break;
        case 'topic-explainer':
          result = await aiService.topicExplainer({ topic: variables.text }, token);
          break;
        default:
          throw new Error(`Unknown tool: ${tool}`);
      }

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error);
    },
    onSuccess: () => {
      refetchUser(); // تحديث ائتمانات المستخدم
    },
    onError: (error) => {
      handleErrorUtility(error, `فشل في استخدام أداة ${tool}`);
    }
  });
}

/**
 * مثال على hook للتحليلات باستخدام النظام الجديد
 */
export function useUserStatsNew() {
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid;

  return useQuery({
    queryKey: userKeys.userStats(userId!),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      // استخدام النظام الجديد مباشرة
      const result = await analyticsService.getUserStats(token);

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) =>
        handleErrorUtility(error, "فشل في تحميل بيانات التحليلات"),
    },
  });
}

/**
 * مثال على hook للمدفوعات باستخدام النظام الجديد
 */
export function useVerifyPaymentNew() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: {
      transactionId: string;
      userId: string;
      creditsToGrant: number;
      status: 'verified' | 'rejected';
      adminNotes?: string;
    }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      // استخدام النظام الجديد مباشرة
      const result = await paymentService.verifyPayment(variables, token);

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error);
    },
    onSuccess: (data, variables) => {
      toast({
        title: "تم تحديث المعاملة",
        description: `تم تحديد المعاملة كـ ${variables.status}.`,
      });

      // إعادة تحميل البيانات
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في التحقق من الدفع");
    }
  });
}

/**
 * مثال على hook للفرق باستخدام النظام الجديد
 */
export function useCreateTeamNew() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (variables: { name: string; description?: string }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      // استخدام النظام الجديد مباشرة
      const result = await teamService.createTeam(variables, token);

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error);
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الفريق بنجاح",
        description: "تم إنشاء الفريق الجديد بنجاح.",
      });

      // إعادة تحميل قائمة الفرق
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في إنشاء الفريق");
    }
  });
}

/**
 * مثال على hook للمشاريع باستخدام النظام الجديد
 */
export function useProjectsNew() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      // استخدام النظام الجديد مباشرة
      const result = await projectService.getProjects(token);

      if (result.success) {
        return result.data.map(p => new User(p as UserProperties));
      }

      throw new Error(result.error);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) => {
        handleErrorUtility(error, "فشل في تحميل المشاريع");
      },
    },
  });
}

/**
 * مثال على hook للأقسام باستخدام النظام الجديد
 */
export function useSectionsNew() {
  const { firebaseUser } = useAuth();

  return useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      // استخدام النظام الجديد مباشرة
      const result = await adminService.getSections(token);

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error);
    },
    enabled: !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * مثال على hook للدردشة باستخدام النظام الجديد
 */
export function useCreateConversationNew() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      participantIds: string[];
      participantNames: Record<string, string>;
      title?: string;
      isSupportChat?: boolean;
    }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      // استخدام النظام الجديد مباشرة
      const result = await chatService.createConversation(data, token);

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error);
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء المحادثة بنجاح",
        description: "تم إنشاء المحادثة الجديدة بنجاح.",
      });

      // إعادة تحميل قائمة المحادثات
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في إنشاء المحادثة");
    }
  });
}

// === أمثلة على الاستخدام المختلط ===

/**
 * مثال على hook يستخدم النظام الجديد والقديم معاً
 * هذا مفيد أثناء فترة الانتقال
 */
export function useMixedApproach() {
  const { firebaseUser } = useAuth();

  // استخدام النظام الجديد للمصادقة
  const loginMutation = useLoginNew();

  // استخدام النظام القديم للتحليلات (حتى يتم هجرتها)
  const userStatsQuery = useQuery({
    queryKey: userKeys.userStats(firebaseUser?.uid!),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      // استخدام النظام القديم مؤقتاً
      const result = await legacyServices.analytics.fetchUserStats(token);

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error);
    },
    enabled: !!firebaseUser,
  });

  return {
    login: loginMutation,
    userStats: userStatsQuery,
  };
}

/**
 * مثال على hook يستخدم النظام الجديد مع معالجة الأخطاء المحسنة
 */
export function useEnhancedUserManagement() {
  const { firebaseUser } = useAuth();

  // استخدام النظام الجديد مع دوال المساعدة
  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      password: string;
      role: 'user' | 'admin';
      credits: number;
    }) => {
      const token = await getAuthenticatedToken(firebaseUser);
      // استخدام دالة المساعدة مع معالجة الأخطاء
      const result = await adminUtils.createUserWithErrorHandling(userData, token);

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error);
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: "تم إنشاء المستخدم الجديد بنجاح.",
      });
    },
    onError: (error) => {
      handleErrorUtility(error, "فشل في إنشاء المستخدم");
    }
  });

  return {
    createUser: createUserMutation,
  };
}
