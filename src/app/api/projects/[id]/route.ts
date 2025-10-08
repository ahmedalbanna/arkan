


import { ProjectStateSchema } from '@/ai/schemas';
import { createApiResponse, handleApiError, withAuth } from '@/lib/api-utils';
import { adminDb } from '@/lib/firebase/server-init';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

/**
 * Sanitizes data to be Firestore-compatible by removing or converting invalid types
 */
function sanitizeForFirestore(data: any): any {
    if (data === null || data === undefined) {
        return null;
    }

    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        return data;
    }

    if (data instanceof Date) {
        return data.toISOString();
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizeForFirestore(item));
    }

    if (typeof data === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
            // Skip functions and undefined values
            if (typeof value === 'function' || value === undefined) {
                continue;
            }
            sanitized[key] = sanitizeForFirestore(value);
        }
        return sanitized;
    }

    // For any other types (functions, symbols, etc.), convert to string
    return String(data);
}


// Helper to verify user owns the project - integrated into withAuth now
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
        const { id: projectId } = await params;
        const project = await verifyProjectOwner(user.id, projectId);
        return createApiResponse({ id: projectId, ...project }, 200);
    } catch (error) {
        return handleApiError(error);
    }
});

// PUT (update) a project
export const PUT = withAuth(async ({ request, params, user }) => {
    try {
        const { id: projectId } = await params;
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

        // Sanitize the data to ensure it's Firestore-compatible
        const sanitizedUpdateData = sanitizeForFirestore(updateData);

        await adminDb.collection("projects").doc(projectId).update(sanitizedUpdateData);
        revalidatePath('/projects');

        return createApiResponse({ id: projectId, ...updateData }, 200);
    } catch (error) {
        return handleApiError(error);
    }
});

// DELETE a project
export const DELETE = withAuth(async ({ params, user }) => {
    try {
        const { id: projectId } = await params;
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
    type: z.enum(['context', 'example']),
});

export const PATCH = withAuth(async ({ request, params, user }) => {
    try {
        const { id: projectId } = await params;
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
