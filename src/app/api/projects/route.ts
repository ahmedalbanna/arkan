// src/app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, auth as adminAuth } from '@/lib/firebase/admin';
import { ProjectStateSchema } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// GET /api/projects - Fetches all projects for the authenticated user
export async function GET(request: Request) {
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;

        const projectsSnapshot = await adminDb.collection('projects')
            .where('userId', '==', userId)
            .orderBy('updatedAt', 'desc')
            .get();
        
        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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
    try {
        const authorization = request.headers.get('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authorization.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token, true);
        const userId = decodedToken.uid;

        const body = await request.json();
        const validation = ProjectStateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const newProject = {
            ...validation.data,
            userId,
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