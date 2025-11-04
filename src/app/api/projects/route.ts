
import { adminDb } from '@/lib/firebase/server-init';
import { revalidatePath } from 'next/cache';
import { withAuth, handleApiError, createApiResponse } from '@/lib/utils/api-utils';

import { z } from 'zod';
import { AgentPromptSchema } from '@/ai/schemas';

const SectionDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  agentId: z.string().optional(),
  type: z.enum(['report', 'diagram', 'presentation']),
  content: z.string().optional(),
   // Agent is now nested, so we make it optional and passthrough
  agent: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      category: z.string(),
      pageUrl: z.string(),
      isEnabled: z.boolean(),
      prompt: z.union([z.string(), AgentPromptSchema]),
      guidelines: z.array(z.string()).optional(),
  }).passthrough().optional(),
});

export const ProjectStateSchema = z.object({
    id: z.string().optional(),
    userId: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    name: z.string().optional(),
    projectIdea: z.string().optional(),
    sections: z.array(SectionDataSchema).optional(),
    sectionsOrder: z.array(z.string()).optional(),
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
