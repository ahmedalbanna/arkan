

import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { ProjectStateSchema } from '@/ai/schemas';
import { revalidatePath } from 'next/cache';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

// GET /api/projects - Fetches all projects for the authenticated user and their teams
export const GET = withAuth(async ({ user }) => {
    try {
        // Fetch personal projects
        const personalProjectsQuery = adminDb.collection('projects')
            .where('userId', '==', user.id)
            .where('teamId', '==', null)
            .orderBy('updatedAt', 'desc')
            .get();

        // Fetch team projects if the user is part of any teams
        const teamProjectsQuery = user.teams && user.teams.length > 0
            ? adminDb.collection('projects')
                .where('teamId', 'in', user.teams)
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
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

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
            teamId: validation.data.teamId || null,
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
