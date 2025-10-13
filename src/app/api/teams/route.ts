/**
 * API Route للفرق - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للفرق
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { TeamSchemas } from '@/core/validation/api-validators';
import { adminDb } from '@/lib/firebase/server-init';
import type { TeamProperties, TeamWithMembers } from '@/lib/models/team';

/**
 * معالج قائمة الفرق (GET)
 */
class TeamListHandler extends SimpleApiHandler<TeamWithMembers[]> {
    protected async processRequest(context: any): Promise<TeamWithMembers[]> {
        const { user } = context;

        if (!user.teams || user.teams.length === 0) {
            return [];
        }

        const teamsQuery = adminDb.collection('teams')
            .where('__name__', 'in', user.teams)
            .get();

        const teamsSnapshot = await teamsQuery;
        const teams: TeamWithMembers[] = [];

        for (const teamDoc of teamsSnapshot.docs) {
            const teamData = teamDoc.data();

            // جلب أعضاء الفريق
            const membersQuery = adminDb.collection('users')
                .where('teams', 'array-contains', teamDoc.id)
                .get();

            const membersSnapshot = await membersQuery;
            const members = membersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            teams.push({
                id: teamDoc.id,
                ...teamData,
                members,
            });
        }

        return teams as TeamWithMembers[];
    }
}

/**
 * معالج إنشاء الفريق (POST)
 */
class CreateTeamHandler extends ComplexApiHandler<{
    name: string;
    description?: string;
}, TeamProperties> {
    protected inputSchema = TeamSchemas.createTeam;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const teamData = {
            ...data,
            ownerId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            memberCount: 1,
        };

        const docRef = await adminDb.collection('teams').add(teamData);

        // إضافة المستخدم كعضو في الفريق
        await adminDb.collection('users').doc(user.id).update({
            teams: adminDb.FieldValue.arrayUnion(docRef.id),
        });

        return {
            id: docRef.id,
            ...teamData,
        } as TeamWithMembers;
    }
}

/**
 * معالج تحديث الفريق (PUT)
 */
class UpdateTeamHandler extends ComplexApiHandler<{
    name?: string;
    description?: string;
}, TeamProperties> {
    protected inputSchema = TeamSchemas.updateTeam;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any) {
        const { params, user } = context;
        const teamId = params?.id;

        if (!teamId) {
            throw new Error('Team ID is required');
        }

        // التحقق من أن المستخدم يملك الفريق
        const teamDoc = await adminDb.collection('teams').doc(teamId).get();

        if (!teamDoc.exists) {
            throw new Error('Team not found');
        }

        const teamData = teamDoc.data();

        if (teamData?.ownerId !== user.id) {
            throw new Error('Access denied - only team owner can update team');
        }

        const updateData = {
            ...data,
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection('teams').doc(teamId).update(updateData);

        return {
            id: teamId,
            ...teamData,
            ...updateData,
        } as TeamWithMembers;
    }
}

/**
 * معالج حذف الفريق (DELETE)
 */
class DeleteTeamHandler extends ComplexApiHandler<{}, { message: string }> {
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any) {
        const { params, user } = context;
        const teamId = params?.id;

        if (!teamId) {
            throw new Error('Team ID is required');
        }

        // التحقق من أن المستخدم يملك الفريق
        const teamDoc = await adminDb.collection('teams').doc(teamId).get();

        if (!teamDoc.exists) {
            throw new Error('Team not found');
        }

        const teamData = teamDoc.data();

        if (teamData?.ownerId !== user.id) {
            throw new Error('Access denied - only team owner can delete team');
        }

        // حذف الفريق
        await adminDb.collection('teams').doc(teamId).delete();

        // إزالة الفريق من جميع الأعضاء
        const membersQuery = adminDb.collection('users')
            .where('teams', 'array-contains', teamId)
            .get();

        const membersSnapshot = await membersQuery;
        const batch = adminDb.batch();

        membersSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                teams: adminDb.FieldValue.arrayRemove(teamId),
            });
        });

        await batch.commit();

        return { message: 'Team deleted successfully' };
    }
}

/**
 * معالج دعوة عضو (POST)
 */
class InviteMemberHandler extends ComplexApiHandler<{
    email: string;
    role: 'member' | 'admin';
}, { message: string }> {
    protected inputSchema = TeamSchemas.inviteMember;

    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any) {
        const { params, user } = context;
        const teamId = params?.id;

        if (!teamId) {
            throw new Error('Team ID is required');
        }

        // التحقق من أن المستخدم عضو في الفريق
        const teamDoc = await adminDb.collection('teams').doc(teamId).get();

        if (!teamDoc.exists) {
            throw new Error('Team not found');
        }

        const teamData = teamDoc.data();

        if (teamData?.ownerId !== user.id &&
            !user.teams?.includes(teamId)) {
            throw new Error('Access denied - only team members can invite others');
        }

        // البحث عن المستخدم بالبريد الإلكتروني
        const userQuery = adminDb.collection('users')
            .where('email', '==', data.email)
            .limit(1)
            .get();

        const userSnapshot = await userQuery;

        if (userSnapshot.empty) {
            throw new Error('User not found with this email');
        }

        const targetUserDoc = userSnapshot.docs[0];
        const targetUserData = targetUserDoc.data();

        // التحقق من أن المستخدم ليس عضو بالفعل في الفريق
        if (targetUserData.teams?.includes(teamId)) {
            throw new Error('User is already a member of this team');
        }

        // إضافة المستخدم للفريق
        await adminDb.collection('users').doc(targetUserDoc.id).update({
            teams: adminDb.FieldValue.arrayUnion(teamId),
        });

        // تحديث عدد الأعضاء
        await adminDb.collection('teams').doc(teamId).update({
            memberCount: adminDb.FieldValue.increment(1),
            updatedAt: new Date().toISOString(),
        });

        return { message: 'Member invited successfully' };
    }
}

// إنشاء المعالجات وتصديرها
const teamListHandler = new TeamListHandler();
const createTeamHandler = new CreateTeamHandler();
const updateTeamHandler = new UpdateTeamHandler();
const deleteTeamHandler = new DeleteTeamHandler();
const inviteMemberHandler = new InviteMemberHandler();

// تصدير الـ handlers مع middleware للاستخدام في الطلبات
export const GET = withApiMiddleware(
    teamListHandler,
    { logging: true }
);

export const POST = withApiMiddleware(
    createTeamHandler,
    { logging: true }
);

export const PUT = withApiMiddleware(
    updateTeamHandler,
    { logging: true }
);

export const DELETE = withApiMiddleware(
    deleteTeamHandler,
    { logging: true }
);
