/**
 * API Route لدعوات الفرق العامة - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
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

export const POST = createApiHandler(async (context) => {
    try {
        const { request, params } = context;
        const teamId = params.id;
        const { email } = await request.json();

        const ownerCheck = await verifyTeamOwner(request, teamId);
        if (!ownerCheck.authorized) {
            return ApiResponse.unauthorized('Access denied');
        }

        // Find user by email
        const userQuery = await adminDb.collection('users').where('email', '==', email).limit(1).get();
        if (userQuery.empty) {
            return ApiResponse.notFound('User with this email not found');
        }
        
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        const userProfile = await getUserProfile(userId);

        if (!userProfile) {
            return ApiResponse.notFound('User profile not found');
        }

        // Check if user is already a member
        const memberDoc = await adminDb.collection('teams').doc(teamId).collection('members').doc(userId).get();
        if (memberDoc.exists) {
            return ApiResponse.badRequest('User is already a member of this team');
        }

        // Add user to the team with denormalized data
        const newMember: TeamMember = {
            userId: userId,
            teamId: teamId,
            role: 'member',
            joinedAt: new Date().toISOString(),
            name: userProfile.name || 'Unknown User',
            email: userProfile.email || 'N/A',
            profilePictureUrl: userProfile.profilePictureUrl || '',
        };
        await adminDb.collection('teams').doc(teamId).collection('members').doc(userId).set(newMember);

        // Add team to user's profile
        await adminDb.collection('users').doc(userId).update({
            teams: FieldValue.arrayUnion(teamId)
        });

        return ApiResponse.success(newMember);
    } catch (error) {
        console.error('Error inviting team member:', error);
        return ApiResponse.error('Failed to invite team member', 500);
    }
}, { validateBody: inviteMemberSchema, requireAuth: true });
