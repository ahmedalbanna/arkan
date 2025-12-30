
'use server';

import { writingToolApi } from '@/services/api/writingToolsService';
import { PromptBuilder } from '@/lib/prompt-builder';
import { Project, ProjectProperties } from '@/lib/models';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

// We need to use `any()` for the content array because it can contain different object shapes
// before being instantiated into Project/Chapter/Section classes.
const ProjectBuildRequestSchema = z.object({
  project: z.object({}).passthrough(), // Pass through the raw project object
  selectedSections: z.array(z.string()),
});

export const POST = withAuth(async ({ request, user }) => {
    try {
        const body = await request.json();
        const validation = ProjectBuildRequestSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { project: projectData, selectedSections: selectedSectionsArray } = validation.data;
        
        // Re-construct the project instance from the plain object
        const project = new Project(projectData as ProjectProperties);
        const selectedSections = new Set(selectedSectionsArray);

        if (selectedSections.size === 0) {
            return handleApiError({ message: 'No sections were selected for generation.' }, 400);
        }
        
        const finalPrompt = PromptBuilder.buildProjectPrompt(project, selectedSections);

        const token = await request.headers.get('Authorization')?.split(' ')[1];
        if (!token) throw new Error('Authentication token missing');

        const aiPayload = { flow: 'generate-project-from-full-prompt', fullPrompt: finalPrompt };

        const result = await writingToolApi<any, { text: string }>(
            `/api/writing-tools/generate-project-from-full-prompt`,
            { data: aiPayload, token }
        );
        
        // Here, you would parse the `result.text` (which is a full markdown string)
        // back into the project structure. For simplicity, we'll return the raw text.
        // A more advanced implementation would parse this markdown into chapters/sections.
        
        const creditCost = selectedSections.size; // e.g., 1 credit per section
        await deductCredit(user.id, creditCost);

        await logGeneration({
            agentId: 'build-full-project',
            userId: user.id,
            input: {
                projectName: project.name,
                selectedSectionCount: selectedSections.size,
            },
            output: { characterCount: result.text.length },
            creditCost: creditCost,
        });

        return createApiResponse({ generatedContent: result.text }, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
