


import { ProjectStateSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';


// Helper to verify user owns the project - integrated into withEnhancedAuth now
const verifyProjectOwner = async (requesterId: string, projectId: string) => {
    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
        throw { status: 404, message: 'Project not found' };
    }
    const project = projectDoc.data();
    if (project?.userId !== requesterId) {
        throw { status: 403, message: 'Forbidden: You do not own this project' };
    }
    return project;
};

// GET a single project
export const GET = withEnhancedAuth(async ({ params, user }) => {
    try {
        const { id: projectId } = await params;
        const project = await verifyProjectOwner(user.id, projectId);
        return createApiResponseEnhanced({ id: projectId, ...project }, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
});

// PUT (update) a project
export const PUT = withEnhancedAuth(async ({ request, params, user }) => {
    try {
        const { id: projectId } = await params;
        await verifyProjectOwner(user.id, projectId);

        const body = await request.json();
        const validation = ProjectStateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiErrorEnhanced({ errors: validation.error.flatten().fieldErrors }, 400);
        }

        const updateData = {
            ...validation.data,
            updatedAt: new Date().toISOString()
        };

        await adminDb.collection("projects").doc(projectId).update(updateData);
        revalidatePath('/projects');

        return createApiResponseEnhanced({ id: projectId, ...updateData }, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
});

// DELETE a project
export const DELETE = withEnhancedAuth(async ({ params, user }) => {
    try {
        const { id: projectId } = await params;
        await verifyProjectOwner(user.id, projectId);
        await adminDb.collection("projects").doc(projectId).delete();
        revalidatePath('/projects');
        return createApiResponseEnhanced({ message: 'Project deleted successfully' }, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
});


// PATCH (partially update) a project, e.g., to add context
const addContextSchema = z.object({
    fileName: z.string(),
    content: z.string(),
    type: z.enum(['context', 'example']),
});

export const PATCH = withEnhancedAuth(async ({ request, params, user }) => {
    try {
        const { id: projectId } = await params;
        await verifyProjectOwner(user.id, projectId);

        const body = await request.json();
        const validation = addContextSchema.safeParse(body);
        if (!validation.success) {
            return handleApiErrorEnhanced({ errors: validation.error.flatten().fieldErrors }, 400);
        }

        const projectRef = adminDb.collection("projects").doc(projectId);
        await projectRef.update({
            externalContext: FieldValue.arrayUnion(validation.data),
            updatedAt: new Date().toISOString(),
        });

        return createApiResponseEnhanced({ message: 'Context added successfully' }, 200);

    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
})
