// src/app/api/teams/[id]/invitations/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth as adminAuth, adminDb } from '@/lib/firebase/admin';
import { getUserProfile, type Team, type TeamMember } from '@/lib/db/queries';
import { FieldValue } from 'firebase-admin/firestore';

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Helper to verify if the requester is the owner of the team
async function verifyTeamOwner(request: Request, teamId: string) {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized' };
    }
    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    const requesterId = decodedToken.uid;

    const teamDoc = await adminDb.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
        return { authorized: false, message: 'Team not found' };
    }
    const team = teamDoc.data() as Team;
    
    if (team.ownerId !== requesterId) {
        return { authorized: false, message: 'Forbidden: Only the team owner can invite members' };
    }

    return { authorized: true, requesterId };
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const teamId = params.id;
    try {
        const ownerCheck = await verifyTeamOwner(request, teamId);
        if (!ownerCheck.authorized) {
            return NextResponse.json({ message: ownerCheck.message }, { status: ownerCheck.message === 'Forbidden' ? 403 : 401 });
        }

        const body = await request.json();
        const validation = inviteMemberSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { email } = validation.data;

        // Find user by email
        const userQuery = await adminDb.collection('users').where('email', '==', email).limit(1).get();
        if (userQuery.empty) {
            return NextResponse.json({ message: 'User with this email not found.' }, { status: 404 });
        }
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        const userProfile = await getUserProfile(userId);

        if (!userProfile) {
            return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
        }


        // Check if user is already a member
        const memberDoc = await adminDb.collection('teams').doc(teamId).collection('members').doc(userId).get();
        if (memberDoc.exists) {
            return NextResponse.json({ message: 'User is already a member of this team.' }, { status: 409 });
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
        
        return NextResponse.json(newMember, { status: 201 });
        
    } catch (error) {
        console.error(`Error inviting member to team ${teamId}:`, error);
        if (error instanceof Error && error.message.includes('token')) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
