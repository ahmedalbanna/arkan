/**
 * خدمة الفرق - Services v2.0
 *
 * خدمة محسنة لإدارة الفرق مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

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

export interface TeamProperties {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
    projectCount: number;
}

export interface TeamWithMembers extends TeamProperties {
    members: Array<{
        id: string;
        userId: string;
        userName: string;
        userEmail: string;
        role: 'owner' | 'admin' | 'member';
        joinedAt: string;
    }>;
    projects: Array<{
        id: string;
        name: string;
        status: string;
        memberCount: number;
    }>;
}

export class TeamServiceV2 extends BaseService {
    constructor() {
        super('TeamServiceV2');
    }

    /**
     * إنشاء فريق جديد مع مراقبة الأداء
     */
    async createTeam(data: CreateTeamData, token: string): Promise<TeamProperties> {
        const operationId = this.startOperation('createTeam');

        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create team');
            }

            const team = await response.json();
            this.endOperation(operationId, { success: true });
            return team;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.createTeam');
            throw error;
        }
    }

    /**
     * جلب قائمة الفرق مع مراقبة شاملة
     */
    async fetchUserTeams(token: string): Promise<TeamWithMembers[]> {
        const operationId = this.startOperation('fetchUserTeams');

        try {
            const response = await fetch('/api/teams', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user teams');
            }

            const teams = await response.json();
            this.endOperation(operationId, { success: true, teamCount: teams.length });
            return teams;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.fetchUserTeams');
            throw error;
        }
    }

    /**
     * جلب فريق محدد مع مراقبة الأداء
     */
    async fetchTeam(teamId: string, token: string): Promise<TeamWithMembers | null> {
        const operationId = this.startOperation('fetchTeam');

        try {
            const response = await fetch(`/api/teams/${teamId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    this.endOperation(operationId, { success: true, result: 'not-found' });
                    return null;
                }
                throw new Error('Failed to fetch team');
            }

            const team = await response.json();
            this.endOperation(operationId, { success: true });
            return team;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.fetchTeam');
            throw error;
        }
    }

    /**
     * تحديث فريق مع مراقبة شاملة
     */
    async updateTeam(teamId: string, data: UpdateTeamData, token: string): Promise<TeamProperties> {
        const operationId = this.startOperation('updateTeam');

        try {
            const response = await fetch(`/api/teams/${teamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update team');
            }

            const team = await response.json();
            this.endOperation(operationId, { success: true });
            return team;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.updateTeam');
            throw error;
        }
    }

    /**
     * حذف فريق مع مراقبة الأداء
     */
    async deleteTeam(teamId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteTeam');

        try {
            const response = await fetch(`/api/teams/${teamId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete team');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.deleteTeam');
            throw error;
        }
    }

    /**
     * دعوة عضو للفريق مع مراقبة شاملة
     */
    async inviteMember(teamId: string, data: InviteMemberData, token: string): Promise<{
        inviteId: string;
        email: string;
        role: string;
        expiresAt: string;
        inviteUrl: string;
    }> {
        const operationId = this.startOperation('inviteMember');

        try {
            const response = await fetch(`/api/teams/${teamId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to invite member');
            }

            const invite = await response.json();
            this.endOperation(operationId, { success: true });
            return invite;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.inviteMember');
            throw error;
        }
    }

    /**
     * إزالة عضو من الفريق مع مراقبة الأداء
     */
    async removeMember(teamId: string, memberId: string, token: string): Promise<void> {
        const operationId = this.startOperation('removeMember');

        try {
            const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to remove member');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.removeMember');
            throw error;
        }
    }

    /**
     * تحديث دور عضو في الفريق مع مراقبة شاملة
     */
    async updateMemberRole(
        teamId: string,
        memberId: string,
        role: 'member' | 'admin',
        token: string
    ): Promise<{
        memberId: string;
        role: string;
        updatedAt: string;
    }> {
        const operationId = this.startOperation('updateMemberRole');

        try {
            const response = await fetch(`/api/teams/${teamId}/members/${memberId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update member role');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.updateMemberRole');
            throw error;
        }
    }

    /**
     * جلب أعضاء الفريق مع مراقبة الأداء
     */
    async getTeamMembers(teamId: string, token: string): Promise<Array<{
        id: string;
        userId: string;
        userName: string;
        userEmail: string;
        role: 'owner' | 'admin' | 'member';
        joinedAt: string;
        lastActive?: string;
    }>> {
        const operationId = this.startOperation('getTeamMembers');

        try {
            const response = await fetch(`/api/teams/${teamId}/members`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch team members');
            }

            const members = await response.json();
            this.endOperation(operationId, { success: true, memberCount: members.length });
            return members;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.getTeamMembers');
            throw error;
        }
    }

    /**
     * جلب مشاريع الفريق مع مراقبة شاملة
     */
    async getTeamProjects(teamId: string, token: string): Promise<Array<{
        id: string;
        name: string;
        description?: string;
        status: 'active' | 'completed' | 'archived';
        createdAt: string;
        memberCount: number;
    }>> {
        const operationId = this.startOperation('getTeamProjects');

        try {
            const response = await fetch(`/api/teams/${teamId}/projects`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch team projects');
            }

            const projects = await response.json();
            this.endOperation(operationId, { success: true, projectCount: projects.length });
            return projects;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.getTeamProjects');
            throw error;
        }
    }

    /**
     * إضافة مشروع للفريق مع مراقبة الأداء
     */
    async addProjectToTeam(
        teamId: string,
        projectId: string,
        token: string
    ): Promise<{
        teamId: string;
        projectId: string;
        addedAt: string;
    }> {
        const operationId = this.startOperation('addProjectToTeam');

        try {
            const response = await fetch(`/api/teams/${teamId}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ projectId })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add project to team');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.addProjectToTeam');
            throw error;
        }
    }

    /**
     * إزالة مشروع من الفريق مع مراقبة شاملة
     */
    async removeProjectFromTeam(teamId: string, projectId: string, token: string): Promise<void> {
        const operationId = this.startOperation('removeProjectFromTeam');

        try {
            const response = await fetch(`/api/teams/${teamId}/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to remove project from team');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.removeProjectFromTeam');
            throw error;
        }
    }

    /**
     * جلب إحصائيات الفريق مع مراقبة الأداء
     */
    async getTeamStats(teamId: string, token: string): Promise<{
        totalMembers: number;
        activeMembers: number;
        totalProjects: number;
        completedProjects: number;
        recentActivity: Array<{
            userName: string;
            action: string;
            timestamp: string;
        }>;
        memberGrowth: Array<{
            date: string;
            count: number;
        }>;
    }> {
        const operationId = this.startOperation('getTeamStats');

        try {
            const response = await fetch(`/api/teams/${teamId}/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch team stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.getTeamStats');
            throw error;
        }
    }

    /**
     * جلب دعوات الفريق المعلقة مع مراقبة شاملة
     */
    async getPendingInvites(teamId: string, token: string): Promise<Array<{
        id: string;
        email: string;
        role: string;
        invitedAt: string;
        expiresAt: string;
        status: 'pending' | 'accepted' | 'expired';
    }>> {
        const operationId = this.startOperation('getPendingInvites');

        try {
            const response = await fetch(`/api/teams/${teamId}/invites`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pending invites');
            }

            const invites = await response.json();
            this.endOperation(operationId, { success: true, inviteCount: invites.length });
            return invites;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.getPendingInvites');
            throw error;
        }
    }

    /**
     * إلغاء دعوة عضو مع مراقبة الأداء
     */
    async cancelInvite(teamId: string, inviteId: string, token: string): Promise<void> {
        const operationId = this.startOperation('cancelInvite');

        try {
            const response = await fetch(`/api/teams/${teamId}/invites/${inviteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to cancel invite');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.cancelInvite');
            throw error;
        }
    }

    /**
     * مغادرة الفريق مع مراقبة شاملة
     */
    async leaveTeam(teamId: string, token: string): Promise<void> {
        const operationId = this.startOperation('leaveTeam');

        try {
            const response = await fetch(`/api/teams/${teamId}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to leave team');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.leaveTeam');
            throw error;
        }
    }

    /**
     * نقل ملكية الفريق مع مراقبة الأداء
     */
    async transferOwnership(
        teamId: string,
        newOwnerId: string,
        token: string
    ): Promise<{
        previousOwner: string;
        newOwner: string;
        transferredAt: string;
    }> {
        const operationId = this.startOperation('transferOwnership');

        try {
            const response = await fetch(`/api/teams/${teamId}/transfer-ownership`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newOwnerId })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to transfer ownership');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.transferOwnership');
            throw error;
        }
    }

    /**
     * جلب إحصائيات عامة للفرق مع مراقبة شاملة
     */
    async getTeamsStats(token: string): Promise<{
        totalTeams: number;
        totalMembers: number;
        averageTeamSize: number;
        teamsBySize: Record<string, number>;
        recentActivity: Array<{
            teamName: string;
            action: string;
            timestamp: string;
        }>;
    }> {
        const operationId = this.startOperation('getTeamsStats');

        try {
            const response = await fetch('/api/teams/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch teams stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.getTeamsStats');
            throw error;
        }
    }

    /**
     * البحث في الفرق مع مراقبة الأداء
     */
    async searchTeams(query: string, filters: {
        memberCount?: { min?: number; max?: number };
        createdAfter?: string;
        hasProjects?: boolean;
        limit?: number;
        offset?: number;
    } = {}, token: string): Promise<{
        teams: TeamProperties[];
        totalCount: number;
        hasMore: boolean;
    }> {
        const operationId = this.startOperation('searchTeams');

        try {
            const queryParams = new URLSearchParams({ q: query });

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    if (typeof value === 'object') {
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            if (subValue !== undefined) {
                                queryParams.append(`${key}[${subKey}]`, subValue.toString());
                            }
                        });
                    } else {
                        queryParams.append(key, value.toString());
                    }
                }
            });

            const response = await fetch(`/api/teams/search?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to search teams');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, resultCount: result.teams?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.searchTeams');
            throw error;
        }
    }

    /**
     * فحص صحة الفريق مع مراقبة شاملة
     */
    async checkTeamHealth(teamId: string, token: string): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        metrics: {
            memberActivity: number;
            projectProgress: number;
            collaborationScore: number;
        };
        issues: string[];
        recommendations: string[];
    }> {
        const operationId = this.startOperation('checkTeamHealth');

        try {
            const response = await fetch(`/api/teams/${teamId}/health`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to check team health');
            }

            const health = await response.json();
            this.endOperation(operationId, { success: true, status: health.status });
            return health;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TeamServiceV2.checkTeamHealth');
            throw error;
        }
    }
}