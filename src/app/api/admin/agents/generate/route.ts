'use server';

import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { generateAgentConfig } from '@/ai/flows/generate-agent-config';
import { z } from 'zod';
import { deductCredit } from '@/services/credit-service';

const generateSchema = z.object({
    prompt: z.string().min(10, "Prompt must be at least 10 characters long."),
    includeJsonOutput: z.boolean().optional(),
});

export const POST = withAuth(async ({ request, user }) => {
    try {
        const body = await request.json();
        const validation = generateSchema.safeParse(body);
        if(!validation.success) {
            return handleApiError(validation.error);
        }

        // Agent generation is a more complex task
        await deductCredit(user.id, 2);

        const result = await generateAgentConfig({ 
            prompt: validation.data.prompt,
            includeJsonOutput: validation.data.includeJsonOutput 
        });

        return createApiResponse(result, 200);

    } catch (error) {
        return handleApiError(error);
    }

}, { requireAdmin: true });
