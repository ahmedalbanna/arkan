
import { adminDb } from '@/lib/firebase/server-init';
import { revalidatePath } from 'next/cache';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

import { z } from 'zod';
import { ProjectProperties } from '@/lib/models';

const SectionDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['report', 'diagram', 'presentation']),
  content: z.string().optional(),
  prompt: z.string().optional(),
  guidelines: z.array(z.string()).optional(),
}).passthrough();

const ChapterSchema = z.object({
    id: z.string(),
    title: z.string(),
    sections: z.array(SectionDataSchema),
});


export const ProjectStateSchema = z.object({
    id: z.string().optional(),
    userId: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    name: z.string().optional(),
    projectDescription: z.string().optional(),
    chapters: z.array(ChapterSchema).optional(),
    externalContext: z.array(z.any()).nullable().optional(),
});
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
        // Use the zod schema for validation
        const validation = ProjectStateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError({ errors: validation.error.flatten().fieldErrors }, 400);
        }

        const newProject: Partial<ProjectProperties> = {
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
