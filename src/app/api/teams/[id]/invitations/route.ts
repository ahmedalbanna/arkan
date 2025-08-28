

// src/app/api/teams/[id]/invitations/route.ts
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { type Team, type TeamMember } from '@/lib/types';
import { getUserProfile } from '@/lib/db/queries';
import { FieldValue } from 'firebase-admin/firestore';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Helper to verify if the requester is the owner of the team
async function verifyTeamOwner(requesterId: string, teamId: string) {
    const teamDoc = await adminDb.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
        throw { status: 404, message: 'Team not found' };
    }
    const team = teamDoc.data() as Team;

    if (team.ownerId !== requesterId) {
        throw { status: 403, message: 'Forbidden: Only the team owner can invite members' };
    }
    return team;
}

export const POST = withAuth(async ({ request, params, user }) => {
    const teamId = params.id;
    try {
        await verifyTeamOwner(user.id, teamId);

        const body = await request.json();
        const validation = inviteMemberSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { email } = validation.data;

        // Find user by email
        const userQuery = await adminDb.collection('users').where('email', '==', email).limit(1).get();
        if (userQuery.empty) {
            return handleApiError({ message: 'User with this email not found.' }, 404);
        }
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        const userProfile = await getUserProfile(userId);

        if (!userProfile) {
            return handleApiError({ message: 'User profile not found.' }, 404);
        }

        // Check if user is already a member
        const memberDoc = await adminDb.collection('teams').doc(teamId).collection('members').doc(userId).get();
        if (memberDoc.exists) {
            return handleApiError({ message: 'User is already a member of this team.' }, 409);
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

        return createApiResponse(newMember, 201);

    } catch (error) {
        return handleApiError(error);
    }
});
