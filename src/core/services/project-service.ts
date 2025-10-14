/**
 * خدمات المشاريع المبسطة
 *
 * نظام مبسط لإدارة المشاريع
 */

import type { ProjectPlan } from '@/ai/schemas';
import { ProjectSchemas } from '@/core/validation/api-validators';
import type { ProjectState, SavedProject } from '@/lib/models/project';
import { api } from './simple-service';

// أنواع البيانات
export interface CreateProjectData {
  title: string;
  description?: string;
  type: 'proposal' | 'report' | 'presentation' | 'academic';
  language: 'ar' | 'en';
  teamId?: string;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface AddContextData {
  type: 'file' | 'text' | 'url';
  content: string;
  fileName?: string;
  fileType?: 'pdf' | 'docx' | 'txt' | 'md';
  fileSize?: number;
}

export interface GenerateProjectPlanData {
  title: string;
  description: string;
  requirements: string[];
  timeline?: string;
}

export interface ProjectPlanRequest {
  title: string;
  description: string;
  requirements: string[];
  timeline?: string;
}

export interface ProjectStats {
  totalGenerations: number;
  creditsUsed: number;
  lastActivity: string;
  completionRate: number;
}

// خدمات المشاريع المبسطة
export const projectService = {
  // الحصول على قائمة المشاريع
  async getProjects(token: string) {
    return api.get<SavedProject[]>('/projects', { token });
  },

  // الحصول على مشروع محدد
  async getProject(projectId: string, token: string) {
    return api.get<SavedProject>(`/projects/${projectId}`, { token });
  },

  // إنشاء مشروع جديد
  async createProject(data: CreateProjectData, token: string) {
    const validatedData = ProjectSchemas.createProject.parse(data);
    return api.post<SavedProject>('/projects', validatedData, { token });
  },

  // تحديث مشروع
  async updateProject(projectId: string, data: ProjectState, token: string) {
    return api.put<SavedProject>(`/projects/${projectId}`, data, { token });
  },

  // حذف مشروع
  async deleteProject(projectId: string, token: string) {
    return api.delete<{ message: string }>(`/projects/${projectId}`, { token });
  },

  // إضافة سياق للمشروع
  async addContext(projectId: string, data: AddContextData, token: string) {
    const validatedData = ProjectSchemas.addContext.parse(data);
    return api.patch<{ message: string }>(`/projects/${projectId}`, validatedData, { token });
  },

  // الحصول على مشاريع المستخدم مع فلترة
  async getUserProjects(token: string, filters?: {
    type?: string;
    status?: string;
    language?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.language) params.append('language', filters.language);

    const queryString = params.toString();
    const path = queryString ? `/projects?${queryString}` : '/projects';

    return api.get<SavedProject[]>(path, { token });
  },

  // البحث في المشاريع
  async searchProjects(query: string, token: string) {
    return api.get<SavedProject[]>(`/projects/search?q=${encodeURIComponent(query)}`, { token });
  },

  // تصدير مشروع
  async exportProject(projectId: string, format: 'pdf' | 'docx' | 'pptx', token: string) {
    return api.get(`/projects/${projectId}/export?format=${format}`, { token });
  },

  // مشاركة مشروع
  async shareProject(projectId: string, data: {
    email: string;
    permission: 'view' | 'edit'
  }, token: string) {
    return api.post<{ message: string }>(`/projects/${projectId}/share`, data, { token });
  },

  // إلغاء مشاركة مشروع
  async unshareProject(projectId: string, email: string, token: string) {
    return api.delete<{ message: string }>(`/projects/${projectId}/share`, {
      token,
      headers: { 'X-User-Email': email }
    });
  },

  // === خدمات إضافية للمشاريع ===

  // توليد خطة المشروع
  async generateProjectPlan(data: ProjectPlanRequest, token: string) {
    return api.post<ProjectPlan>('/generate/project-plan', data, { token });
  },

  // تلخيص المقترح لخطة المشروع
  async summarizeProposalForPlan(proposal: any, token: string) {
    return api.post<any>('/generate/project-plan/summarize', { proposal }, { token });
  },

  // الحصول على إحصائيات المشروع
  async getProjectStats(projectId: string, token: string) {
    return api.get<ProjectStats>(`/projects/${projectId}/stats`, { token });
  },

  // نسخ مشروع
  async duplicateProject(projectId: string, newTitle: string, token: string) {
    return api.post<SavedProject>(`/projects/${projectId}/duplicate`, { title: newTitle }, { token });
  },

  // أرشفة مشروع
  async archiveProject(projectId: string, token: string) {
    return api.patch<{ message: string }>(`/projects/${projectId}/archive`, {}, { token });
  },

  // استعادة مشروع من الأرشيف
  async restoreProject(projectId: string, token: string) {
    return api.patch<{ message: string }>(`/projects/${projectId}/restore`, {}, { token });
  },

  // الحصول على المشاريع المؤرشفة
  async getArchivedProjects(token: string) {
    return api.get<SavedProject[]>('/projects/archived', { token });
  },

  // البحث المتقدم في المشاريع
  async advancedSearch(query: {
    text?: string;
    type?: string;
    status?: string;
    language?: string;
    dateFrom?: string;
    dateTo?: string;
  }, token: string) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const queryString = params.toString();
    const path = queryString ? `/projects/search/advanced?${queryString}` : '/projects/search/advanced';

    return api.get<SavedProject[]>(path, { token });
  },

  // تصدير مشروع بصيغ متعددة
  async exportProjectMultiple(projectId: string, formats: ('pdf' | 'docx' | 'pptx')[], token: string) {
    return api.post<{ [key: string]: string }>(`/projects/${projectId}/export/multiple`, { formats }, { token });
  },

  // مشاركة مشروع مع صلاحيات متعددة
  async shareProjectWithPermissions(projectId: string, data: {
    email: string;
    permission: 'view' | 'edit' | 'admin';
    expiresAt?: string;
  }, token: string) {
    return api.post<{ message: string }>(`/projects/${projectId}/share`, data, { token });
  },

  // الحصول على قائمة المشاركين في المشروع
  async getProjectCollaborators(projectId: string, token: string) {
    return api.get<{ email: string; permission: string; joinedAt: string }[]>(`/projects/${projectId}/collaborators`, { token });
  },

  // تحديث صلاحيات مشارك
  async updateCollaboratorPermission(projectId: string, email: string, permission: 'view' | 'edit' | 'admin', token: string) {
    return api.put<{ message: string }>(`/projects/${projectId}/collaborators/${email}`, { permission }, { token });
  },

  // إزالة مشارك من المشروع
  async removeCollaborator(projectId: string, email: string, token: string) {
    return api.delete<{ message: string }>(`/projects/${projectId}/collaborators/${email}`, { token });
  },
};

// دوال مساعدة للمشاريع
export const projectUtils = {
  // إنشاء مشروع مع معالجة الأخطاء
  async createProjectWithErrorHandling(data: CreateProjectData, token: string) {
    try {
      const result = await projectService.createProject(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project'
      };
    }
  },

  // تحديث مشروع مع معالجة الأخطاء
  async updateProjectWithErrorHandling(
    projectId: string,
    data: ProjectState,
    token: string
  ) {
    try {
      const result = await projectService.updateProject(projectId, data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update project'
      };
    }
  },

  // حذف مشروع مع تأكيد
  async deleteProjectWithConfirmation(projectId: string, token: string) {
    try {
      const result = await projectService.deleteProject(projectId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Project deleted successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete project'
      };
    }
  },

  // الحصول على إحصائيات المشروع
  async getProjectStats(projectId: string, token: string) {
    try {
      const result = await api.get(`/projects/${projectId}/stats`, { token });

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get project stats'
      };
    }
  },

  // نسخ مشروع
  async duplicateProject(projectId: string, newTitle: string, token: string) {
    try {
      const result = await api.post<SavedProject>(
        `/projects/${projectId}/duplicate`,
        { title: newTitle },
        { token }
      );

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to duplicate project'
      };
    }
  },

  // أرشفة مشروع
  async archiveProject(projectId: string, token: string) {
    try {
      const result = await api.patch<{ message: string }>(
        `/projects/${projectId}/archive`,
        {},
        { token }
      );

      if (result.success) {
        return { success: true, message: result.data?.message || 'Project archived successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to archive project'
      };
    }
  },

  // استعادة مشروع من الأرشيف
  async restoreProject(projectId: string, token: string) {
    try {
      const result = await api.patch<{ message: string }>(
        `/projects/${projectId}/restore`,
        {},
        { token }
      );

      if (result.success) {
        return { success: true, message: result.data?.message || 'Project restored successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to restore project'
      };
    }
  },

  // === دوال مساعدة إضافية ===

  // توليد خطة المشروع مع معالجة الأخطاء
  async generateProjectPlanWithErrorHandling(data: ProjectPlanRequest, token: string) {
    try {
      const result = await projectService.generateProjectPlan(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate project plan'
      };
    }
  },

  // الحصول على إحصائيات المشروع مع معالجة الأخطاء
  async getProjectStatsWithErrorHandling(projectId: string, token: string) {
    try {
      const result = await projectService.getProjectStats(projectId, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get project stats'
      };
    }
  },

  // نسخ مشروع مع معالجة الأخطاء
  async duplicateProjectWithErrorHandling(projectId: string, newTitle: string, token: string) {
    try {
      const result = await projectService.duplicateProject(projectId, newTitle, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to duplicate project'
      };
    }
  },

  // أرشفة مشروع مع معالجة الأخطاء
  async archiveProjectWithErrorHandling(projectId: string, token: string) {
    try {
      const result = await projectService.archiveProject(projectId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Project archived successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to archive project'
      };
    }
  },

  // استعادة مشروع من الأرشيف مع معالجة الأخطاء
  async restoreProjectWithErrorHandling(projectId: string, token: string) {
    try {
      const result = await projectService.restoreProject(projectId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Project restored successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to restore project'
      };
    }
  },

  // البحث المتقدم مع معالجة الأخطاء
  async advancedSearchWithErrorHandling(query: {
    text?: string;
    type?: string;
    status?: string;
    language?: string;
    dateFrom?: string;
    dateTo?: string;
  }, token: string) {
    try {
      const result = await projectService.advancedSearch(query, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform advanced search'
      };
    }
  },

  // تصدير مشروع بصيغ متعددة مع معالجة الأخطاء
  async exportProjectMultipleWithErrorHandling(projectId: string, formats: ('pdf' | 'docx' | 'pptx')[], token: string) {
    try {
      const result = await projectService.exportProjectMultiple(projectId, formats, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export project in multiple formats'
      };
    }
  },

  // مشاركة مشروع مع معالجة الأخطاء
  async shareProjectWithErrorHandling(projectId: string, data: {
    email: string;
    permission: 'view' | 'edit' | 'admin';
    expiresAt?: string;
  }, token: string) {
    try {
      const result = await projectService.shareProjectWithPermissions(projectId, data, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Project shared successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share project'
      };
    }
  },

  // الحصول على المشاركين مع معالجة الأخطاء
  async getProjectCollaboratorsWithErrorHandling(projectId: string, token: string) {
    try {
      const result = await projectService.getProjectCollaborators(projectId, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get project collaborators'
      };
    }
  },

  // تحديث صلاحيات مشارك مع معالجة الأخطاء
  async updateCollaboratorPermissionWithErrorHandling(projectId: string, email: string, permission: 'view' | 'edit' | 'admin', token: string) {
    try {
      const result = await projectService.updateCollaboratorPermission(projectId, email, permission, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Collaborator permission updated successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update collaborator permission'
      };
    }
  },

  // إزالة مشارك مع معالجة الأخطاء
  async removeCollaboratorWithErrorHandling(projectId: string, email: string, token: string) {
    try {
      const result = await projectService.removeCollaborator(projectId, email, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Collaborator removed successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove collaborator'
      };
    }
  },
};
