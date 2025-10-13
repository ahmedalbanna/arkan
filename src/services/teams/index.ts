/**
 * خدمات الفرق
 *
 * هذا الملف يحتوي على جميع الصادرات لخدمات الفرق
 */

export type { TeamWithMembers } from '@/lib/models/team';
export {
    createTeam, deleteTeam, fetchTeam, fetchUserTeams, inviteMember, removeMember, updateMemberRole, updateTeam, type CreateTeamData, type UpdateTeamData
} from '@/services/teams/team-service';

