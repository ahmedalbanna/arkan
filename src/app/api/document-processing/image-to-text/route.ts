
'use server';

import { imageToText } from '@/ai/flows/image-to-text';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

export const POST = withAuth(async ({ request, user }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return handleApiError({ message: 'No file uploaded.' }, 400);
        }

        if (!file.type.startsWith('image/')) {
            return handleApiError({ message: 'Invalid file type. Only images are allowed.' }, 400);
        }

        await deductCredit(user.id, 2);

        const fileArrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(fileArrayBuffer).toString('base64');
        const imageDataUri = `data:${file.type};base64,${base64}`;

        const agentInput = { imageDataUri };
        const result = await imageToText(agentInput);

        await logGeneration({
            agentId: 'image-to-text',
            userId: user.id,
            input: { fileName: file.name, fileType: file.type }, // Don't log the full data URI
            output: result,
        });

        return createApiResponse({ text: result.text }, 200);
    } catch (error) {
        return handleApiError(error);
    }
});
