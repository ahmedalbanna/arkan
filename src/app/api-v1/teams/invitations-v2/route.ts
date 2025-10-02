/**
 * API Route لدعوات الفرق العامة - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لدعوات الفرق العامة
 */

import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { getUserProfile } from '@/lib/db/queries';
import { adminAuth, adminDb } from '@/lib/firebase/server-init';
import { TeamProperties } from '@/lib/models/team';
import { TeamMember } from '@/lib/models/user';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

// Schema لدعوة عضو
const inviteMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
});

// Helper to verify if the requester is the owner of the team
async function verifyTeamOwner(request: Request, teamId: string) {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
    }
    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    const requesterId = decodedToken.uid;

    const teamDoc = await adminDb.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
        throw new Error('Team not found');
    }
    const team = teamDoc.data() as TeamProperties;

    if (team.ownerId !== requesterId) {
        throw new Error('Forbidden: Only the team owner can invite members');
    }

    return { authorized: true, requesterId };
}

/**
 * معالج دعوة عضو للفريق العام
 */
class InviteTeamMemberGeneralHandler extends ComplexApiHandler<z.infer<typeof inviteMemberSchema>, TeamMember> {
    protected inputSchema = inviteMemberSchema;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: z.infer<typeof inviteMemberSchema>, context: any) {
        const { request, params } = context;
        const teamId = params.id;
        const { email } = data;

        const ownerCheck = await verifyTeamOwner(request, teamId);
        if (!ownerCheck.authorized) {
            throw new Error('Unauthorized');
        }

        // Find user by email
        const userQuery = await adminDb.collection('users').where('email', '==', email).limit(1).get();
        if (userQuery.empty) {
            throw new Error('User with this email not found.');
        }
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        const userProfile = await getUserProfile(userId);

        if (!userProfile) {
            throw new Error('User profile not found.');
        }

        // Check if user is already a member
        const memberDoc = await adminDb.collection('teams').doc(teamId).collection('members').doc(userId).get();
        if (memberDoc.exists) {
            throw new Error('User is already a member of this team.');
        }

        // Add user to the team with denormalized data
        const newMember: TeamMember = {
            userId: userId,
            teamId: teamId,
            role: 'member',
            joinedAt: new Date().toISOString(),
            name: userProfile.name || 'Unknown User', // Denormalized field
            email: userProfile.email || 'N/A', // Denormalized field
            profilePictureUrl: userProfile.profilePictureUrl || '', // Denormalized field
        };
        await adminDb.collection('teams').doc(teamId).collection('members').doc(userId).set(newMember);

        // Add team to user's profile
        await adminDb.collection('users').doc(userId).update({
            teams: FieldValue.arrayUnion(teamId)
        });

        return newMember;
    }
}

// إنشاء المعالج وتصديره
const inviteTeamMemberGeneralHandler = new InviteTeamMemberGeneralHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    inviteTeamMemberGeneralHandler.handle.bind(inviteTeamMemberGeneralHandler),
    { logging: true }
);
