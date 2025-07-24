// src/app/api/teams/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getUserTeams, createTeamForUser } from '@/lib/db/queries';

// GET /api/teams
export async function GET(request: Request) {
    const adminAuth = getAdminAuth();
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;

        const teams = await getUserTeams(userId);
        return NextResponse.json(teams, { status: 200 });
    } catch (error) {
        console.error('Error fetching user teams:', error);
        if (error instanceof Error && error.message.includes('token')) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


// POST /api/teams
const createTeamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters").max(50, "Team name cannot exceed 50 characters"),
});

export async function POST(request: Request) {
  const adminAuth = getAdminAuth();
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    const userId = decodedToken.uid;

    const body = await request.json();
    const validation = createTeamSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name } = validation.data;
    const newTeam = await createTeamForUser(userId, name);
    
    return NextResponse.json(newTeam, { status: 201 });

  } catch (error) {
    console.error('Error creating team:', error);
    if (error instanceof Error && error.message.includes('token')) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
