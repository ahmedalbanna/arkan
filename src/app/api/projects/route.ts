
// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, getAdminAuth } from '@/lib/firebase/admin';
import { ProjectStateSchema } from '@/lib/project-state-schema';
import { revalidatePath } from 'next/cache';
import { getUserProfile } from '@/lib/db/queries';

// GET /api/projects - Fetches all projects for the authenticated user and their teams
export async function GET(request: Request) {
    const adminAuth = await getAdminAuth();
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;
        const userProfile = await getUserProfile(userId);

        // Fetch personal projects
        const personalProjectsQuery = adminDb.collection('projects')
            .where('userId', '==', userId)
            .where('teamId', '==', null) // Explicitly check for personal projects
            .orderBy('updatedAt', 'desc')
            .get();

        // Fetch team projects if the user is part of any teams
        const teamProjectsQuery = userProfile?.teams && userProfile.teams.length > 0
            ? adminDb.collection('projects')
                .where('teamId', 'in', userProfile.teams)
                .orderBy('updatedAt', 'desc')
                .get()
            : Promise.resolve(null);

        const [personalProjectsSnapshot, teamProjectsSnapshot] = await Promise.all([
            personalProjectsQuery,
            teamProjectsQuery,
        ]);
        
        const projectsMap = new Map();
        
        personalProjectsSnapshot.docs.forEach((doc: any) => {
            projectsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        
        teamProjectsSnapshot?.docs.forEach((doc: any) => {
            projectsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        
        const projects = Array.from(projectsMap.values())
            // Sort combined projects by updatedAt date
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error('Error fetching projects:', error);
        if (error instanceof Error && error.message.includes('token')) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


// POST /api/projects - Creates a new project
export async function POST(request: Request) {
    const adminAuth = await getAdminAuth();
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;

        const body = await request.json();
        // We allow teamId to be optional in the request
        const validation = ProjectStateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const newProject = {
            ...validation.data,
            userId, // The user who created the project
            teamId: validation.data.teamId || null, // Ensure teamId is null if not provided
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const projectRef = await adminDb.collection('projects').add(newProject);
        revalidatePath('/projects');
        
        return NextResponse.json({ id: projectRef.id, ...newProject }, { status: 201 });

    } catch (error) {
        console.error('Error creating project:', error);
        if (error instanceof Error && error.message.includes('token')) {
            return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
        }
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
