/**
 * خدمات الفرق المبسطة
 *
 * نظام مبسط لإدارة الفرق والأعضاء
 */

import { TeamSchemas } from '@/core/validation/api-validators';
import type { TeamProperties, TeamWithMembers } from '@/lib/models/team';
import { api } from './simple-service';

// أنواع البيانات
export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface InviteMemberData {
  email: string;
  role: 'member' | 'admin';
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'member' | 'admin';
  joinedAt: string;
  isActive: boolean;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  totalProjects: number;
  lastActivity: string;
}

// خدمات الفرق المبسطة
export const teamService = {
  // الحصول على قائمة الفرق
  async getTeams(token: string) {
    return api.get<TeamWithMembers[]>('/teams', { token });
  },

  // الحصول على فريق محدد
  async getTeam(teamId: string, token: string) {
    return api.get<TeamWithMembers>(`/teams/${teamId}`, { token });
  },

  // إنشاء فريق جديد
  async createTeam(data: CreateTeamData, token: string) {
    const validatedData = TeamSchemas.createTeam.parse(data);
    return api.post<TeamProperties>('/teams', validatedData, { token });
  },

  // تحديث فريق
  async updateTeam(teamId: string, data: UpdateTeamData, token: string) {
    const validatedData = TeamSchemas.updateTeam.parse(data);
    return api.put<TeamProperties>(`/teams/${teamId}`, validatedData, { token });
  },

  // حذف فريق
  async deleteTeam(teamId: string, token: string) {
    return api.delete<{ message: string }>(`/teams/${teamId}`, { token });
  },

  // دعوة عضو جديد
  async inviteMember(teamId: string, data: InviteMemberData, token: string) {
    const validatedData = TeamSchemas.inviteMember.parse(data);
    return api.post<{ message: string }>(`/teams/${teamId}/invite`, validatedData, { token });
  },

  // إزالة عضو من الفريق
  async removeMember(teamId: string, memberId: string, token: string) {
    return api.delete<{ message: string }>(`/teams/${teamId}/members/${memberId}`, { token });
  },

  // تحديث دور العضو
  async updateMemberRole(teamId: string, memberId: string, role: 'member' | 'admin', token: string) {
    return api.put<{ message: string }>(`/teams/${teamId}/members/${memberId}`, { role }, { token });
  },

  // الحصول على إحصائيات الفريق
  async getTeamStats(teamId: string, token: string) {
    return api.get<TeamStats>(`/teams/${teamId}/stats`, { token });
  },

  // البحث في الفرق
  async searchTeams(query: string, token: string) {
    return api.get<TeamWithMembers[]>(`/teams/search?q=${encodeURIComponent(query)}`, { token });
  },

  // الحصول على مشاريع الفريق
  async getTeamProjects(teamId: string, token: string) {
    return api.get<any[]>(`/teams/${teamId}/projects`, { token });
  },

  // إضافة مشروع للفريق
  async addProjectToTeam(teamId: string, projectId: string, token: string) {
    return api.post<{ message: string }>(`/teams/${teamId}/projects`, { projectId }, { token });
  },

  // إزالة مشروع من الفريق
  async removeProjectFromTeam(teamId: string, projectId: string, token: string) {
    return api.delete<{ message: string }>(`/teams/${teamId}/projects/${projectId}`, { token });
  },

  // الحصول على نشاط الفريق
  async getTeamActivity(teamId: string, token: string, params?: {
    limit?: number;
    lastVisibleId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.lastVisibleId) queryParams.append('lastVisibleId', params.lastVisibleId);

    const queryString = queryParams.toString();
    const path = queryString ? `/teams/${teamId}/activity?${queryString}` : `/teams/${teamId}/activity`;

    return api.get(path, { token });
  },

  // تحديث إعدادات الفريق
  async updateTeamSettings(teamId: string, settings: {
    allowMemberInvites?: boolean;
    requireApprovalForProjects?: boolean;
    defaultProjectPermissions?: 'view' | 'edit' | 'admin';
  }, token: string) {
    return api.put<{ message: string }>(`/teams/${teamId}/settings`, settings, { token });
  },

  // الحصول على إعدادات الفريق
  async getTeamSettings(teamId: string, token: string) {
    return api.get<any>(`/teams/${teamId}/settings`, { token });
  },
};

// دوال مساعدة للفرق
export const teamUtils = {
  // إنشاء فريق مع معالجة الأخطاء
  async createTeamWithErrorHandling(data: CreateTeamData, token: string) {
    try {
      const result = await teamService.createTeam(data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create team'
      };
    }
  },

  // تحديث فريق مع معالجة الأخطاء
  async updateTeamWithErrorHandling(teamId: string, data: UpdateTeamData, token: string) {
    try {
      const result = await teamService.updateTeam(teamId, data, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update team'
      };
    }
  },

  // حذف فريق مع تأكيد
  async deleteTeamWithConfirmation(teamId: string, token: string) {
    try {
      const result = await teamService.deleteTeam(teamId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Team deleted successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete team'
      };
    }
  },

  // دعوة عضو مع معالجة الأخطاء
  async inviteMemberWithErrorHandling(teamId: string, data: InviteMemberData, token: string) {
    try {
      const result = await teamService.inviteMember(teamId, data, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Member invited successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to invite member'
      };
    }
  },

  // إزالة عضو مع معالجة الأخطاء
  async removeMemberWithErrorHandling(teamId: string, memberId: string, token: string) {
    try {
      const result = await teamService.removeMember(teamId, memberId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Member removed successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove member'
      };
    }
  },

  // تحديث دور العضو مع معالجة الأخطاء
  async updateMemberRoleWithErrorHandling(teamId: string, memberId: string, role: 'member' | 'admin', token: string) {
    try {
      const result = await teamService.updateMemberRole(teamId, memberId, role, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Member role updated successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update member role'
      };
    }
  },

  // الحصول على إحصائيات الفريق مع معالجة الأخطاء
  async getTeamStatsWithErrorHandling(teamId: string, token: string) {
    try {
      const result = await teamService.getTeamStats(teamId, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get team stats'
      };
    }
  },

  // البحث في الفرق مع معالجة الأخطاء
  async searchTeamsWithErrorHandling(query: string, token: string) {
    try {
      const result = await teamService.searchTeams(query, token);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search teams'
      };
    }
  },

  // إضافة مشروع للفريق مع معالجة الأخطاء
  async addProjectToTeamWithErrorHandling(teamId: string, projectId: string, token: string) {
    try {
      const result = await teamService.addProjectToTeam(teamId, projectId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Project added to team successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add project to team'
      };
    }
  },

  // إزالة مشروع من الفريق مع معالجة الأخطاء
  async removeProjectFromTeamWithErrorHandling(teamId: string, projectId: string, token: string) {
    try {
      const result = await teamService.removeProjectFromTeam(teamId, projectId, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Project removed from team successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove project from team'
      };
    }
  },

  // تحديث إعدادات الفريق مع معالجة الأخطاء
  async updateTeamSettingsWithErrorHandling(teamId: string, settings: {
    allowMemberInvites?: boolean;
    requireApprovalForProjects?: boolean;
    defaultProjectPermissions?: 'view' | 'edit' | 'admin';
  }, token: string) {
    try {
      const result = await teamService.updateTeamSettings(teamId, settings, token);

      if (result.success) {
        return { success: true, message: result.data?.message || 'Team settings updated successfully' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update team settings'
      };
    }
  },
};
