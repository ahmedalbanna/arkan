/**
 * خدمات الإدارة المبسطة
 *
 * نظام مبسط لخدمات الإدارة والتحكم
 */

import { UserSchemas } from '@/core/validation/api-validators';
import type { AgentCategoryDetails, AgentProperties } from '@/lib/models/agent';
import type { SectionProperties } from '@/lib/models/section';
import type { Feature } from '@/lib/types';
import { api } from './simple-service';

// أنواع البيانات
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  credits: number;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface UserListResponse {
  users: UserProfile[];
  hasNextPage: boolean;
  lastVisibleId: string | null;
}

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

export interface DashboardStats {
  totalUsers: number;
  totalGenerations: number;
  pendingPayments: number;
  agentUsageChartData: { name: string; count: number }[];
  recentActivity: {
    id: string;
    userId: string;
    userName: string;
    agentId: string;
    createdAt: string;
    input: any;
    output: any;
  }[];
}

export interface SystemSettings {
  defaultCredits: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  maintenanceMode: boolean;
  registrationEnabled: boolean;
}

export interface GenerationLog {
  id: string;
  agentId: string;
  userId: string;
  userName: string;
  input: any;
  output: any;
  createdAt: string;
}

export interface CreateAgentData {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  prompt: string;
  isActive: boolean;
}

export interface UpdateAgentData {
  name?: string;
  description?: string;
  categoryId?: string;
  prompt?: string;
  isActive?: boolean;
}

export interface CreateAgentCategoryData {
  id: string;
  name: string;
}

export interface CreateSectionData {
  id: string;
  name: string;
  description?: string;
  type: 'report' | 'presentation' | 'proposal';
  isActive: boolean;
}

// خدمات الإدارة المبسطة
export const adminService = {
  // إحصائيات لوحة التحكم
  async getDashboardStats(token: string) {
    return api.get<DashboardStats>('/admin/dashboard', { token });
  },

  // قائمة المستخدمين مع فلترة
  async getUsers(token: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const path = queryString ? `/admin/users?${queryString}` : '/admin/users';

    return api.get<UserListResponse>(path, { token });
  },

  // إنشاء مستخدم جديد
  async createUser(data: CreateUserData, token: string) {
    const validatedData = UserSchemas.createUser.parse(data);
    return api.post<UserProfile>('/admin/users', validatedData, { token });
  },

  // تحديث مستخدم
  async updateUser(userId: string, data: UpdateUserData, token: string) {
    const validatedData = UserSchemas.updateUser.parse(data);
    return api.put<UserProfile>(`/admin/users/${userId}`, validatedData, { token });
  },

  // حذف مستخدم
  async deleteUser(userId: string, token: string) {
    return api.delete<{ message: string }>(`/admin/users/${userId}`, { token });
  },

  // الحصول على مستخدم محدد
  async getUser(userId: string, token: string) {
    return api.get<UserProfile>(`/admin/users/${userId}`, { token });
  },

  // إعادة تعيين كلمة مرور المستخدم
  async resetUserPassword(userId: string, token: string) {
    return api.post<{ message: string }>(`/admin/users/${userId}/reset-password`, {}, { token });
  },

  // تفعيل/إلغاء تفعيل مستخدم
  async toggleUserStatus(userId: string, isActive: boolean, token: string) {
    return api.patch<{ message: string }>(
      `/admin/users/${userId}/status`,
      { isActive },
      { token }
    );
  },

  // إضافة/خصم ائتمانات من مستخدم
  async updateUserCredits(userId: string, credits: number, token: string) {
    return api.patch<{ message: string }>(
      `/admin/users/${userId}/credits`,
      { credits },
      { token }
    );
  },

  // الحصول على إعدادات النظام
  async getSystemSettings(token: string) {
    return api.get<SystemSettings>('/admin/settings', { token });
  },

  // تحديث إعدادات النظام
  async updateSystemSettings(data: Partial<SystemSettings>, token: string) {
    return api.put<SystemSettings>('/admin/settings', data, { token });
  },

  // الحصول على سجل العمليات
  async getActivityLog(token: string, params?: {
    limit?: number;
    userId?: string;
    agentId?: string;
    lastVisibleId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.agentId) queryParams.append('agentId', params.agentId);
    if (params?.lastVisibleId) queryParams.append('lastVisibleId', params.lastVisibleId);

    const queryString = queryParams.toString();
    const path = queryString ? `/admin/activity-log?${queryString}` : '/admin/activity-log';

    return api.get(path, { token });
  },

  // تصدير بيانات المستخدمين
  async exportUsers(format: 'csv' | 'xlsx', token: string) {
    return api.get(`/admin/users/export?format=${format}`, { token });
  },

  // إرسال إشعار لجميع المستخدمين
  async broadcastNotification(data: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
  }, token: string) {
    return api.post<{ message: string }>('/admin/broadcast', data, { token });
  },

  // الحصول على إحصائيات الاستخدام
  async getUsageStats(token: string, params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

    const queryString = queryParams.toString();
    const path = queryString ? `/admin/usage-stats?${queryString}` : '/admin/usage-stats';

    return api.get(path, { token });
  },

  // === خدمات إدارة الوكلاء ===

  // الحصول على قائمة فئات الوكلاء
  async getAgentCategories(token: string) {
    return api.get<AgentCategoryDetails[]>('/admin/agent-categories', { token });
  },

  // إنشاء فئة وكيل جديدة
  async createAgentCategory(data: CreateAgentCategoryData, token: string) {
    return api.post<AgentCategoryDetails>('/admin/agent-categories', data, { token });
  },

  // الحصول على وكيل محدد
  async getAgent(agentId: string, token: string) {
    return api.get<AgentProperties>(`/admin/agents/${agentId}`, { token });
  },

  // إنشاء وكيل جديد
  async createAgent(data: CreateAgentData, token: string) {
    return api.post<AgentProperties>('/admin/agents', data, { token });
  },

  // تحديث وكيل
  async updateAgent(agentId: string, data: UpdateAgentData, token: string) {
    return api.put<AgentProperties>(`/admin/agents/${agentId}`, data, { token });
  },

  // حذف وكيل
  async deleteAgent(agentId: string, token: string) {
    return api.delete<{ message: string }>(`/admin/agents/${agentId}`, { token });
  },

  // توليد تكوين وكيل
  async generateAgentConfig(data: {
    prompt: string;
    includeJsonOutput: boolean;
    contextFiles: any[];
  }, token: string) {
    return api.post('/admin/agents/generate', data, { token });
  },

  // === خدمات إدارة الميزات ===

  // الحصول على قائمة الميزات
  async getFeatures() {
    return api.get<Feature[]>('/features');
  },

  // تحديث ميزة
  async updateFeature(featureId: string, data: Partial<Feature>, token: string) {
    return api.put<Feature>(`/admin/features/${featureId}`, data, { token });
  },

  // === خدمات إدارة الأقسام ===

  // الحصول على قائمة الأقسام
  async getSections(token: string) {
    return api.get<SectionProperties[]>('/admin/sections', { token });
  },

  // إنشاء قسم جديد
  async createSection(data: CreateSectionData, token: string) {
    return api.post<SectionProperties>('/admin/sections', data, { token });
  },

  // تحديث قسم
  async updateSection(sectionId: string, data: Partial<SectionProperties>, token: string) {
    return api.put<SectionProperties>(`/admin/sections/${sectionId}`, data, { token });
  },

  // حذف قسم
  async deleteSection(sectionId: string, token: string) {
    return api.delete<{ message: string }>(`/admin/sections/${sectionId}`, { token });
  },

  // === خدمات السجلات والمراقبة ===

  // الحصول على سجلات التوليد
  async getGenerationLogs(token: string, params?: {
    limit?: number;
    agentId?: string;
    userId?: string;
    lastVisibleId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.agentId) queryParams.append('agentId', params.agentId);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.lastVisibleId) queryParams.append('lastVisibleId', params.lastVisibleId);

    const queryString = queryParams.toString();
    const path = queryString ? `/admin/generations?${queryString}` : '/admin/generations';

    return api.get<{ logs: GenerationLog[]; hasNextPage: boolean; lastVisibleId: string | null }>(path, { token });
  },

  // الحصول على الإعدادات العامة
  async getPublicSettings() {
    return api.get('/admin/settings');
  },
};

// دوال مساعدة للإدارة
export const adminUtils = {
  // إنشاء مستخدم مع معالجة الأخطاء
  async createUserWithErrorHandling(data: CreateUserData, token: string) {
    try {
      const result = await adminService.createUser(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      };
    }
  },

  // تحديث مستخدم مع معالجة الأخطاء
  async updateUserWithErrorHandling(
    userId: string,
    data: UpdateUserData,
    token: string
  ) {
    try {
      const result = await adminService.updateUser(userId, data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      };
    }
  },

  // حذف مستخدم مع تأكيد
  async deleteUserWithConfirmation(userId: string, token: string) {
    try {
      const result = await adminService.deleteUser(userId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'User deleted successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  },

  // الحصول على إحصائيات مفصلة
  async getDetailedStats(token: string) {
    try {
      const [dashboardStats, usageStats] = await Promise.all([
        adminService.getDashboardStats(token),
        adminService.getUsageStats(token)
      ]);

      return {
        success: true,
        data: {
          dashboard: dashboardStats.success ? dashboardStats.data : null,
          usage: usageStats.success ? usageStats.data : null,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get detailed stats'
      };
    }
  },

  // تصدير تقرير شامل
  async exportComprehensiveReport(token: string, format: 'pdf' | 'xlsx') {
    try {
      const result = await api.get(`/admin/reports/comprehensive?format=${format}`, { token });

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export report'
      };
    }
  },

  // تنظيف البيانات القديمة
  async cleanupOldData(token: string, data: {
    olderThanDays: number;
    dataTypes: ('logs' | 'files' | 'temp')[];
  }) {
    try {
      const result = await api.post<{ message: string }>('/admin/cleanup', data, { token });

      if (result.success) {
        return { success: true, message: result.data?.message || 'Cleanup completed successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup old data'
      };
    }
  },

  // === دوال مساعدة للوكلاء ===

  // إنشاء وكيل مع معالجة الأخطاء
  async createAgentWithErrorHandling(data: CreateAgentData, token: string) {
    try {
      const result = await adminService.createAgent(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create agent'
      };
    }
  },

  // تحديث وكيل مع معالجة الأخطاء
  async updateAgentWithErrorHandling(agentId: string, data: UpdateAgentData, token: string) {
    try {
      const result = await adminService.updateAgent(agentId, data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update agent'
      };
    }
  },

  // حذف وكيل مع تأكيد
  async deleteAgentWithConfirmation(agentId: string, token: string) {
    try {
      const result = await adminService.deleteAgent(agentId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Agent deleted successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete agent'
      };
    }
  },

  // === دوال مساعدة للأقسام ===

  // إنشاء قسم مع معالجة الأخطاء
  async createSectionWithErrorHandling(data: CreateSectionData, token: string) {
    try {
      const result = await adminService.createSection(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create section'
      };
    }
  },

  // تحديث قسم مع معالجة الأخطاء
  async updateSectionWithErrorHandling(sectionId: string, data: Partial<SectionProperties>, token: string) {
    try {
      const result = await adminService.updateSection(sectionId, data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update section'
      };
    }
  },

  // حذف قسم مع تأكيد
  async deleteSectionWithConfirmation(sectionId: string, token: string) {
    try {
      const result = await adminService.deleteSection(sectionId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Section deleted successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete section'
      };
    }
  },

  // === دوال مساعدة للميزات ===

  // تحديث ميزة مع معالجة الأخطاء
  async updateFeatureWithErrorHandling(featureId: string, data: Partial<Feature>, token: string) {
    try {
      const result = await adminService.updateFeature(featureId, data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update feature'
      };
    }
  },

  // === دوال مساعدة للسجلات ===

  // الحصول على سجلات التوليد مع معالجة الأخطاء
  async getGenerationLogsWithErrorHandling(token: string, params?: {
    limit?: number;
    agentId?: string;
    userId?: string;
    lastVisibleId?: string;
  }) {
    try {
      const result = await adminService.getGenerationLogs(token, params);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get generation logs'
      };
    }
  },
};
