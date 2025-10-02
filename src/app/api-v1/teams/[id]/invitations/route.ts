

// src/app/api/teams/[id]/invitations/route.ts
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { getUserProfile } from '@/lib/db/queries';
import { adminDb } from '@/lib/firebase/server-init';
import { TeamProperties } from '@/lib/models/team';
import { TeamMember } from '@/lib/models/user';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

// Schema لدعوة عضو للفريق
const inviteMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
});

// Helper to verify if the requester is the owner of the team
async function verifyTeamOwner(requesterId: string, teamId: string) {
    const teamDoc = await adminDb.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
        throw { status: 404, message: 'Team not found' };
    }
    const team = teamDoc.data() as TeamProperties;

    if (team.ownerId !== requesterId) {
        throw { status: 403, message: 'Forbidden: Only the team owner can invite members' };
    }
    return team;
}

/**
 * معالج دعوة عضو للفريق
 */
export const POST = withEnhancedAuth(async ({ request, params, user }) => {
    const teamId = params.id;
    try {
        await verifyTeamOwner(user.id, teamId);

        const body = await request.json();
        const validation = inviteMemberSchema.safeParse(body);
        if (!validation.success) {
            return handleApiErrorEnhanced(validation.error, '400');
        }

        const { email } = validation.data;

        // Find user by email
        const userQuery = await adminDb.collection('users').where('email', '==', email).limit(1).get();
        if (userQuery.empty) {
            return handleApiErrorEnhanced({ message: 'User with this email not found.' }, '404');
        }
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        const userProfile = await getUserProfile(userId);

        if (!userProfile) {
            return handleApiErrorEnhanced({ message: 'User profile not found.' }, '404');
        }

        // Check if user is already a member
        const memberDoc = await adminDb.collection('teams').doc(teamId).collection('members').doc(userId).get();
        if (memberDoc.exists) {
            return handleApiErrorEnhanced({ message: 'User is already a member of this team.' }, '409');
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

        return createApiResponseEnhanced(newMember, 201);

    } catch (error) {
        return handleApiErrorEnhanced(error, '500');
    }
});
