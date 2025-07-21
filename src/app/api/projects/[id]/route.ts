// src/app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb, auth as adminAuth } from '@/lib/firebase/admin';
import { ProjectStateSchema } from '@/lib/project-state-schema';
import { revalidatePath } from 'next/cache';

// Helper to verify user owns the project
async function verifyProjectOwner(request: Request, projectId: string) {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return { authorized: false, message: 'Unauthorized' };
    }
    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    const requesterId = decodedToken.uid;

    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
        return { authorized: false, message: 'Project not found' };
    }
    const project = projectDoc.data();

    if (project?.userId !== requesterId) {
        return { authorized: false, message: 'Forbidden: You do not own this project' };
    }

    return { authorized: true, userId: requesterId };
}


// GET a single project
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const accessCheck = await verifyProjectOwner(request, params.id);
        if (!accessCheck.authorized) {
            return NextResponse.json({ message: accessCheck.message }, { status: accessCheck.message === 'Forbidden' ? 403 : 401 });
        }

        const projectDoc = await adminDb.collection('projects').doc(params.id).get();
        // We already checked for existence in verifyProjectOwner
        return NextResponse.json({ id: projectDoc.id, ...projectDoc.data() }, { status: 200 });
    } catch (error) {
        console.error(`Error fetching project ${params.id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


// PUT (update) a project
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const accessCheck = await verifyProjectOwner(request, params.id);
        if (!accessCheck.authorized) {
            return NextResponse.json({ message: accessCheck.message }, { status: accessCheck.message === 'Forbidden' ? 403 : 401 });
        }

        const body = await request.json();
        const validation = ProjectStateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const updateData = {
            ...validation.data,
            updatedAt: new Date().toISOString()
        };

        await adminDb.collection('projects').doc(params.id).update(updateData);

        revalidatePath('/projects');

        return NextResponse.json({ id: params.id, ...updateData }, { status: 200 });
    } catch (error) {
        console.error(`Error updating project ${params.id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


// DELETE a project
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const accessCheck = await verifyProjectOwner(request, params.id);
        if (!accessCheck.authorized) {
            return NextResponse.json({ message: accessCheck.message }, { status: accessCheck.message === 'Forbidden' ? 403 : 401 });
        }

        await adminDb.collection('projects').doc(params.id).delete();
        revalidatePath('/projects');

        return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error(`Error deleting project ${params.id}:`, error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
