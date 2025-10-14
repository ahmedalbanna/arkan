/**
 * مثال عملي لاستخدام النظام الجديد المبسط
 *
 * هذا الملف يوضح كيفية استخدام الخدمات المبسطة في التطبيق
 */

import {
    adminUtils,
    aiService,
    aiUtils,
    analyticsUtils,
    api,
    authUtils,
    chatUtils,
    paymentUtils,
    projectService,
    projectUtils,
    teamUtils
} from '@/core/services';
import { useState } from 'react';

// مثال 1: تسجيل الدخول مع معالجة الأخطاء
export async function loginUser(credentials: { email: string; password: string }) {
  try {
    const result = await authUtils.loginWithErrorHandling(credentials);

    if (result.success) {
      // تسجيل الدخول ناجح
      console.log('تم تسجيل الدخول بنجاح:', result.data);
      return { success: true, user: result.data };
    } else {
      // فشل تسجيل الدخول
      console.error('فشل تسجيل الدخول:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 2: إنشاء مشروع جديد
export async function createNewProject(projectData: {
  title: string;
  description: string;
  type: 'proposal' | 'report' | 'presentation' | 'academic';
  language: 'ar' | 'en';
}) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const result = await projectUtils.createProjectWithErrorHandling(projectData, token);

    if (result.success) {
      console.log('تم إنشاء المشروع بنجاح:', result.data);
      return { success: true, project: result.data };
    } else {
      console.error('فشل إنشاء المشروع:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 3: توليد نص باستخدام الذكاء الاصطناعي
export async function generateTextWithAI(prompt: string, context?: string) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const result = await aiService.generateText({
      prompt,
      context
    }, token);

    if (result.success) {
      console.log('تم توليد النص بنجاح:', result.data);
      return { success: true, content: result.data?.content };
    } else {
      console.error('فشل توليد النص:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 4: توليد متعدد الخطوات
export async function generateCompleteProject(projectData: {
  title: string;
  description: string;
  requirements: string[];
}) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const steps = [
      {
        endpoint: '/generate/proposal',
        data: {
          title: projectData.title,
          description: projectData.description,
          client: 'عميل عام'
        },
        description: 'توليد المقترح الأساسي'
      },
      {
        endpoint: '/generate/project-plan',
        data: {
          title: projectData.title,
          description: projectData.description,
          requirements: projectData.requirements
        },
        description: 'توليد خطة المشروع'
      },
      {
        endpoint: '/generate/presentation',
        data: {
          topic: projectData.title,
          audience: 'فريق العمل',
          duration: 30,
          slides: 10
        },
        description: 'توليد العرض التقديمي'
      }
    ];

    const results = await aiUtils.generateMultiStep(steps, token, (step, total, description) => {
      console.log(`الخطوة ${step}/${total}: ${description}`);
    });

    // فحص النتائج
    const failedSteps = results.filter(r => !r.success);
    if (failedSteps.length > 0) {
      console.error('فشلت بعض الخطوات:', failedSteps);
      return { success: false, error: 'فشلت بعض خطوات التوليد' };
    }

    console.log('تم توليد المشروع بالكامل بنجاح');
    return {
      success: true,
      data: {
        proposal: results[0].data,
        plan: results[1].data,
        presentation: results[2].data
      }
    };
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 5: إدارة المستخدمين (للمديرين)
export async function manageUsers(action: 'create' | 'update' | 'delete', userData?: any) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    let result;

    switch (action) {
      case 'create':
        result = await adminUtils.createUserWithErrorHandling(userData, token);
        break;
      case 'update':
        result = await adminUtils.updateUserWithErrorHandling(userData.id, userData, token);
        break;
      case 'delete':
        result = await adminUtils.deleteUserWithConfirmation(userData.id, token);
        break;
      default:
        return { success: false, error: 'عملية غير صحيحة' };
    }

    if (result.success) {
      console.log(`تم ${action} المستخدم بنجاح:`, 'data' in result ? result.data : ('message' in result ? result.message : 'تمت العملية بنجاح'));
      return { success: true, data: 'data' in result ? result.data : undefined };
    } else {
      console.error(`فشل ${action} المستخدم:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 6: معالجة الملفات
export async function processUploadedFile(file: File) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  // التحقق من صحة الملف
  const validation = aiUtils.validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const result = await aiUtils.processFileWithErrorHandling(file, token);

    if (result.success) {
      console.log('تم معالجة الملف بنجاح:', result.data);
      return { success: true, data: result.data };
    } else {
      console.error('فشل معالجة الملف:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 7: استخدام API مباشر
export async function customApiCall(endpoint: string, data?: any) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const result = await api.post(endpoint, data, { token });

    if (result.success) {
      console.log('تم استدعاء API بنجاح:', result.data);
      return { success: true, data: result.data };
    } else {
      console.error('فشل استدعاء API:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 8: Hook للاستخدام في React
export function useProjectManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = async (projectData: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createNewProject(projectData);

      if (result.success) {
        return result.project;
      } else {
        setError(result.error || 'فشل إنشاء المشروع');
        return null;
      }
    } finally {
      setLoading(false);
    }
  };

  const generateProject = async (projectData: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateCompleteProject(projectData);

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'فشل توليد المشروع');
        return null;
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    generateProject,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// مثال 9: إدارة الحالة العامة
export class AppStateManager {
  private static instance: AppStateManager;
  private user: any = null;
  private projects: any[] = [];
  private loading = false;

  static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }
    return AppStateManager.instance;
  }

  async initialize() {
    this.loading = true;

    try {
      // تحميل بيانات المستخدم
      const user = authUtils.getStoredUser();
      if (user) {
        this.user = user;

        // تحميل المشاريع
        const token = authUtils.getStoredToken();
        if (token) {
          const projectsResult = await projectService.getProjects(token);
          if (projectsResult.success) {
            this.projects = projectsResult.data || [];
          }
        }
      }
    } catch (error) {
      console.error('خطأ في تهيئة التطبيق:', error);
    } finally {
      this.loading = false;
    }
  }

  getUser() {
    return this.user;
  }

  getProjects() {
    return this.projects;
  }

  isLoading() {
    return this.loading;
  }

  async refreshProjects() {
    const token = authUtils.getStoredToken();
    if (!token) return;

    try {
      const result = await projectService.getProjects(token);
      if (result.success) {
        this.projects = result.data || [];
      }
    } catch (error) {
      console.error('خطأ في تحديث المشاريع:', error);
    }
  }
}

// تصدير المدير العام
export const appState = AppStateManager.getInstance();

// === أمثلة الخدمات الجديدة ===

// مثال 10: إدارة الفرق
export async function manageTeam(action: 'create' | 'invite' | 'update', teamData?: any) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    let result;

    switch (action) {
      case 'create':
        result = await teamUtils.createTeamWithErrorHandling({
          name: teamData.name,
          description: teamData.description
        }, token);
        break;
      case 'invite':
        result = await teamUtils.inviteMemberWithErrorHandling(teamData.teamId, {
          email: teamData.email,
          role: teamData.role
        }, token);
        break;
      case 'update':
        result = await teamUtils.updateTeamWithErrorHandling(teamData.teamId, {
          name: teamData.name,
          description: teamData.description
        }, token);
        break;
      default:
        return { success: false, error: 'عملية غير صحيحة' };
    }

    if (result.success) {
      console.log(`تم ${action} بنجاح:`, 'data' in result ? result.data : ('message' in result ? result.message : 'تمت العملية بنجاح'));
      return { success: true, data: 'data' in result ? result.data : undefined };
    } else {
      console.error(`فشل ${action}:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 11: إدارة المدفوعات
export async function handlePayment(action: 'purchase' | 'verify' | 'report', paymentData?: any) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    let result;

    switch (action) {
      case 'purchase':
        result = await paymentUtils.purchaseCreditsWithErrorHandling({
          credits: paymentData.credits,
          amount: paymentData.amount,
          currency: 'USD',
          paymentMethod: 'credit_card'
        }, token);
        break;
      case 'verify':
        result = await paymentUtils.verifyPaymentWithErrorHandling({
          transactionId: paymentData.transactionId,
          status: paymentData.status,
          notes: paymentData.notes
        }, token);
        break;
      case 'report':
        result = await paymentUtils.exportPaymentReportWithErrorHandling({
          startDate: paymentData.startDate,
          endDate: paymentData.endDate,
          format: 'pdf'
        }, token);
        break;
      default:
        return { success: false, error: 'عملية غير صحيحة' };
    }

    if (result.success) {
      console.log(`تم ${action} بنجاح:`, 'data' in result ? result.data : ('message' in result ? result.message : 'تمت العملية بنجاح'));
      return { success: true, data: 'data' in result ? result.data : undefined };
    } else {
      console.error(`فشل ${action}:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 12: إدارة المحادثات
export async function handleChat(action: 'create' | 'send' | 'search', chatData?: any) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    let result;

    switch (action) {
      case 'create':
        result = await chatUtils.createConversationWithErrorHandling({
          participantIds: chatData.participantIds,
          participantNames: chatData.participantNames,
          title: chatData.title
        }, token);
        break;
      case 'send':
        result = await chatUtils.sendMessageWithErrorHandling(chatData.chatId, {
          content: chatData.content,
          type: 'text'
        }, token);
        break;
      case 'search':
        result = await chatUtils.searchConversationsWithErrorHandling(chatData.query, token);
        break;
      default:
        return { success: false, error: 'عملية غير صحيحة' };
    }

    if (result.success) {
      console.log(`تم ${action} بنجاح:`, 'data' in result ? result.data : ('message' in result ? result.message : 'تمت العملية بنجاح'));
      return { success: true, data: 'data' in result ? result.data : undefined };
    } else {
      console.error(`فشل ${action}:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 13: التحليلات والإحصائيات
export async function getAnalytics(type: 'user' | 'system' | 'agent' | 'export', params?: any) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    let result;

    switch (type) {
      case 'user':
        result = await analyticsUtils.getUserStatsWithErrorHandling(token);
        break;
      case 'system':
        result = await analyticsUtils.getSystemStatsWithErrorHandling(token);
        break;
      case 'agent':
        result = await analyticsUtils.getAgentAnalyticsWithErrorHandling(token, {
          agentId: params?.agentId,
          startDate: params?.startDate,
          endDate: params?.endDate
        });
        break;
      case 'export':
        result = await analyticsUtils.exportUsageReportWithErrorHandling({
          startDate: params.startDate,
          endDate: params.endDate,
          format: 'pdf',
          includeUsers: true,
          includeAgents: true
        }, token);
        break;
      default:
        return { success: false, error: 'نوع التحليلات غير صحيح' };
    }

    if (result.success) {
      console.log(`تم الحصول على ${type} بنجاح:`, result.data);
      return { success: true, data: result.data };
    } else {
      console.error(`فشل الحصول على ${type}:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 14: استخدام متقدم للذكاء الاصطناعي
export async function advancedAIWorkflow(workflowData: {
  text: string;
  operations: ('improve' | 'summarize' | 'translate' | 'detect')[];
  targetLanguage?: string;
}) {
  const token = authUtils.getStoredToken();
  if (!token) {
    return { success: false, error: 'غير مصرح بالوصول' };
  }

  try {
    const results = [];
    let currentText = workflowData.text;

    for (const operation of workflowData.operations) {
      let result;

      switch (operation) {
        case 'improve':
          result = await aiUtils.improveTextWithErrorHandling({ text: currentText }, token);
          break;
        case 'summarize':
          result = await aiUtils.summarizeTextWithErrorHandling({ text: currentText }, token);
          break;
        case 'translate':
          result = await aiUtils.translateTextWithErrorHandling({
            text: currentText,
            targetLanguage: workflowData.targetLanguage || 'en'
          }, token);
          break;
        case 'detect':
          result = await aiUtils.detectAIContentWithErrorHandling({ text: currentText }, token);
          break;
        default:
          continue;
      }

      if (result.success) {
        results.push({ operation, success: true, data: result.data });
        if (operation !== 'detect' && result.data) {
          currentText = (result.data as any)?.result || (result.data as any)?.content || currentText;
        }
      } else {
        results.push({ operation, success: false, error: result.error });
        break; // توقف عند أول خطأ
      }
    }

    return { success: true, data: results };
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
    return { success: false, error: 'حدث خطأ غير متوقع' };
  }
}

// مثال 15: Hook شامل لإدارة التطبيق
export function useAppManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeOperation = async (operation: () => Promise<any>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: any) => {
    return executeOperation(() => createNewProject(projectData));
  };

  const generateProject = async (projectData: any): Promise<any> => {
    return executeOperation(() => generateCompleteProject(projectData));
  };

  const manageTeamOperation = async (action: 'create' | 'update' | 'invite', teamData: any): Promise<any> => {
    return executeOperation(() => manageTeam(action, teamData));
  };

  const handlePaymentOperation = async (action: 'report' | 'purchase' | 'verify', paymentData: any): Promise<any> => {
    return executeOperation(() => handlePayment(action, paymentData));
  };

  const handleChatOperation = async (action: 'create' | 'search' | 'send', chatData: any): Promise<any> => {
    return executeOperation(() => handleChat(action, chatData));
  };

  const getAnalyticsOperation = async (type: 'user' | 'system' | 'agent' | 'export', params?: any): Promise<any> => {
    return executeOperation(() => getAnalytics(type, params));
  };

  const advancedAIWorkflowOperation = async (workflowData: any): Promise<any> => {
    return executeOperation(() => advancedAIWorkflow(workflowData));
  };

  return {
    createProject,
    generateProject,
    manageTeam: manageTeamOperation,
    handlePayment: handlePaymentOperation,
    handleChat: handleChatOperation,
    getAnalytics: getAnalyticsOperation,
    advancedAIWorkflow: advancedAIWorkflowOperation,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// مثال 16: استخدام الدوال المساعدة
export function demonstrateUtilityFunctions() {
  // دوال التحقق والتحسين
  const paymentValidation = paymentUtils.validatePaymentData({
    amount: 100,
    currency: 'USD',
    paymentMethod: 'credit_card'
  });

  const formattedAmount = paymentUtils.formatAmount(1500, 'USD'); // "$1,500.00"
  const tax = paymentUtils.calculateTax(100, 0.15); // 15
  const total = paymentUtils.calculateTotal(100, 0.15); // 115

  // دوال المحادثة
  const messageValidation = chatUtils.validateMessage('مرحباً بك');
  const truncatedText = chatUtils.truncateText('نص طويل جداً...', 10); // "نص طويل جداً..."
  const formattedTime = chatUtils.formatTimestamp(new Date().toISOString()); // "الآن"
  const title = chatUtils.generateConversationTitle(['أحمد', 'محمد']); // "محادثة بين أحمد و محمد"

  // دوال التحليلات
  const formattedNumber = analyticsUtils.formatNumber(1500000); // "1.5M"
  const percentage = analyticsUtils.formatPercentage(75, 100); // "75.0%"
  const duration = analyticsUtils.formatDuration(125000); // "2د 5ث"
  const growthRate = analyticsUtils.calculateGrowthRate(120, 100); // 20
  const formattedGrowth = analyticsUtils.formatGrowthRate(20); // "+20.0%"

  return {
    paymentValidation,
    formattedAmount,
    tax,
    total,
    messageValidation,
    truncatedText,
    formattedTime,
    title,
    formattedNumber,
    percentage,
    duration,
    growthRate,
    formattedGrowth
  };
}
