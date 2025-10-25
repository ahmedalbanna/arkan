
import { adminDb } from '@/lib/firebase/server-init';
import { ProjectStateSchema } from '@/ai/schemas';
import { revalidatePath } from 'next/cache';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

// GET /api/projects - Fetches all projects for the authenticated user
export const GET = withAuth(async ({ user }) => {
    try {
        const personalProjectsQuery = adminDb.collection('projects')
            .where('userId', '==', user.id)
            .orderBy('updatedAt', 'desc');

        const snapshot = await personalProjectsQuery.get();

        const projects = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

        return createApiResponse(projects, 200);
    } catch (error) {
        return handleApiError(error);
    }
});


// POST /api/projects - Creates a new project
export const POST = withAuth(async ({ request, user }) => {
    try {
        const body = await request.json();
        const validation = ProjectStateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError({ errors: validation.error.flatten().fieldErrors }, 400);
        }

        const newProject = {
            ...validation.data,
            userId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const projectRef = await adminDb.collection('projects').add(newProject);
        revalidatePath('/projects');

        return createApiResponse({ id: projectRef.id, ...newProject }, 201);
    } catch (error) {
        return handleApiError(error);
    }
});
