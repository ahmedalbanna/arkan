
'use server';

import { constructProjectFromTemplate } from '@/lib/db/queries';
import { Project } from '@/lib/models';
import type { ReportTemplateProperties } from '@/lib/types';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';


const applyTemplateSchema = z.object({
  project: z.any(), // The current project state
  template: z.any(), // The template to apply
});

/**
 * API route to apply a report template to a project.
 * This is a server-side operation to avoid exposing the Firebase Admin SDK to the client.
 */
export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = applyTemplateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }
        
        const { project: projectData, template: templateData } = validation.data;
        
        // Re-hydrate the Project model instance on the server
        const existingProject = new Project(projectData as ProjectProperties);
        
        // The core logic is now on the server
        const newProject = await constructProjectFromTemplate(templateData as ReportTemplateProperties);

        // Merge existing project metadata with new content
        const finalProject = existingProject.with({ content: newProject.content });
        
        return createApiResponse(finalProject.toStateObject(), 200);

    } catch (error) {
        return handleApiError(error);
    }
});
