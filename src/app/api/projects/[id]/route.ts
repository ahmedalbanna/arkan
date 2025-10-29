
import { ProjectStateSchema } from '@/lib/schemas/project-schema';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';


// Helper to verify user owns the project
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
export const GET = withAuth(async ({ params, user }) => {
    try {
        const projectId = await params.id;
        const project = await verifyProjectOwner(user.id, projectId);
        return createApiResponse({ id: projectId, ...project }, 200);
    } catch (error) {
        return handleApiError(error);
    }
});

// PUT (update) a project
export const PUT = withAuth(async ({ request, params, user }) => {
    try {
        const projectId = await params.id;
        await verifyProjectOwner(user.id, projectId);

        const body = await request.json();
        const validation = ProjectStateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError({ errors: validation.error.flatten().fieldErrors }, 400);
        }

        const updateData = {
            ...validation.data,
            updatedAt: new Date().toISOString()
        };

        await adminDb.collection("projects").doc(projectId).update(updateData);
        revalidatePath('/projects');

        return createApiResponse({ id: projectId, ...updateData }, 200);
    } catch (error) {
        return handleApiError(error);
    }
});

// DELETE a project
export const DELETE = withAuth(async ({ params, user }) => {
    try {
        const projectId = await params.id;
        await verifyProjectOwner(user.id, projectId);
        await adminDb.collection("projects").doc(projectId).delete();
        revalidatePath('/projects');
        return createApiResponse({ message: 'Project deleted successfully' }, 200);
    } catch (error) {
        return handleApiError(error);
    }
});


// PATCH (partially update) a project, e.g., to add context
const addContextSchema = z.object({
  fileName: z.string(),
  content: z.string(),
  type: z.enum(['context', 'example', 'question', 'textbook', 'guidelines']),
});

export const PATCH = withAuth(async ({ request, params, user }) => {
    try {
        const projectId = params.id;
        await verifyProjectOwner(user.id, projectId);

        const body = await request.json();
        const validation = addContextSchema.safeParse(body);
         if (!validation.success) {
            return handleApiError({ errors: validation.error.flatten().fieldErrors }, 400);
        }

        const projectRef = adminDb.collection("projects").doc(projectId);
        await projectRef.update({
            externalContext: FieldValue.arrayUnion(validation.data),
            updatedAt: new Date().toISOString(),
        });

        return createApiResponse({ message: 'Context added successfully' }, 200);

    } catch (error) {
        return handleApiError(error);
    }
})
