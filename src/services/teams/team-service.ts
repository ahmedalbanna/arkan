/**
 * خدمة الفرق
 *
 * هذا الملف يحتوي على جميع وظائف إدارة الفرق
 */

import { apiClient } from '@/core/api/client/api-client';
import { ComplexService, SimpleService } from '@/core/api/client/base-client';
import { TeamSchemas } from '@/core/validation/api-validators';
import type { TeamProperties, TeamWithMembers } from '@/lib/models/team';

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

/**
 * خدمة قائمة الفرق
 */
export class TeamListService extends SimpleService<TeamWithMembers[]> {
    protected endpoint = '/api/teams';
    protected requiresAuth = true;

    async call(token: string): Promise<TeamWithMembers[]> {
        const response = await this.client.get<TeamWithMembers[]>(this.endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * خدمة الحصول على فريق
 */
export class GetTeamService extends SimpleService<TeamWithMembers> {
    protected endpoint = '/api/teams';
    protected requiresAuth = true;

    async call(token: string, teamId: string): Promise<TeamWithMembers> {
        const endpoint = `${this.endpoint}/${teamId}`;
        const response = await this.client.get<TeamWithMembers>(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * خدمة إنشاء فريق
 */
export class CreateTeamService extends ComplexService<CreateTeamData, TeamProperties> {
    protected endpoint = '/api/teams';
    protected method: 'POST' = 'POST';
    protected inputSchema = TeamSchemas.createTeam;
    protected requiresAuth = true;
}

/**
 * خدمة تحديث الفريق
 */
export class UpdateTeamService extends ComplexService<UpdateTeamData, TeamProperties> {
    protected endpoint = '/api/teams';
    protected method: 'PUT' = 'PUT';
    protected inputSchema = TeamSchemas.updateTeam;
    protected requiresAuth = true;

    async call(data: UpdateTeamData, token: string, teamId: string): Promise<TeamProperties> {
        const endpoint = `${this.endpoint}/${teamId}`;
        const response = await this.client.put<TeamProperties>(endpoint, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * خدمة حذف الفريق
 */
export class DeleteTeamService extends ComplexService<{}, { message: string }> {
    protected endpoint = '/api/teams';
    protected method: 'DELETE' = 'DELETE';
    protected inputSchema = undefined;
    protected requiresAuth = true;

    async call(data: {}, token: string, teamId: string): Promise<{ message: string }> {
        const endpoint = `${this.endpoint}/${teamId}`;
        const response = await this.client.delete<{ message: string }>(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * خدمة دعوة عضو
 */
export class InviteMemberService extends ComplexService<InviteMemberData, { message: string }> {
    protected endpoint = '/api/teams';
    protected method: 'POST' = 'POST';
    protected inputSchema = TeamSchemas.inviteMember;
    protected requiresAuth = true;

    async call(data: InviteMemberData, token: string, teamId: string): Promise<{ message: string }> {
        const endpoint = `${this.endpoint}/${teamId}/invitations`;
        const response = await this.client.post<{ message: string }>(endpoint, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * خدمة إزالة عضو
 */
export class RemoveMemberService extends ComplexService<{}, { message: string }> {
    protected endpoint = '/api/teams';
    protected method: 'DELETE' = 'DELETE';
    protected inputSchema = undefined;
    protected requiresAuth = true;

    async call(data: {}, token: string, teamId: string, memberId: string): Promise<{ message: string }> {
        const endpoint = `${this.endpoint}/${teamId}/members/${memberId}`;
        const response = await this.client.delete<{ message: string }>(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * خدمة تحديث دور العضو
 */
export class UpdateMemberRoleService extends ComplexService<{ role: 'member' | 'admin' }, { message: string }> {
    protected endpoint = '/api/teams';
    protected method: 'PUT' = 'PUT';
    protected inputSchema = undefined;
    protected requiresAuth = true;

    async call(data: { role: 'member' | 'admin' }, token: string, teamId: string, memberId: string): Promise<{ message: string }> {
        const endpoint = `${this.endpoint}/${teamId}/members/${memberId}`;
        const response = await this.client.put<{ message: string }>(endpoint, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * دوال مساعدة للفرق
 */
export const teamService = {
    get list() { return new TeamListService(apiClient); },
    get get() { return new GetTeamService(apiClient); },
    get create() { return new CreateTeamService(apiClient); },
    get update() { return new UpdateTeamService(apiClient); },
    get delete() { return new DeleteTeamService(apiClient); },
    get inviteMember() { return new InviteMemberService(apiClient); },
    get removeMember() { return new RemoveMemberService(apiClient); },
    get updateMemberRole() { return new UpdateMemberRoleService(apiClient); },
};

/**
 * دالة الحصول على قائمة الفرق
 */
export async function fetchUserTeams(token: string): Promise<TeamWithMembers[]> {
    return teamService.list.call(token);
}

/**
 * دالة الحصول على فريق
 */
export async function fetchTeam(teamId: string, token: string): Promise<TeamWithMembers> {
    return teamService.get.call(token, teamId);
}

/**
 * دالة إنشاء فريق
 */
export async function createTeam(data: CreateTeamData, token: string): Promise<TeamProperties> {
    return teamService.create.call(data, token);
}

/**
 * دالة تحديث الفريق
 */
export async function updateTeam(
    teamId: string,
    data: UpdateTeamData,
    token: string
): Promise<TeamProperties> {
    return teamService.update.call(data, token, teamId);
}

/**
 * دالة حذف الفريق
 */
export async function deleteTeam(teamId: string, token: string): Promise<{ message: string }> {
    return teamService.delete.call({}, token, teamId);
}

/**
 * دالة دعوة عضو
 */
export async function inviteMember(
    teamId: string,
    data: InviteMemberData,
    token: string
): Promise<{ message: string }> {
    return teamService.inviteMember.call(data, token, teamId);
}

/**
 * دالة إزالة عضو
 */
export async function removeMember(
    teamId: string,
    memberId: string,
    token: string
): Promise<{ message: string }> {
    return teamService.removeMember.call({}, token, teamId, memberId);
}

/**
 * دالة تحديث دور العضو
 */
export async function updateMemberRole(
    teamId: string,
    memberId: string,
    role: 'member' | 'admin',
    token: string
): Promise<{ message: string }> {
    return teamService.updateMemberRole.call({ role }, token, teamId, memberId);
}
