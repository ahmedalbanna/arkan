
'use server';

import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { container } from '@/infrastructure/di/container';
import { AiController } from '@/modules/ai/adapters/controllers/AiController';

const SUPPORTED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/markdown',
];

export const POST = withAuth(async ({ request, user }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return handleApiError({ message: 'No file uploaded.' }, 400);
        }

        if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
            return handleApiError({ message: `Invalid file type. Supported types are: ${SUPPORTED_MIME_TYPES.join(', ')}` }, 400);
        }

        const fileArrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(fileArrayBuffer).toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        const controller = container.resolve(AiController);
        
        const toolName = file.type === 'application/pdf' ? 'pdf-to-markdown' : (file.type.startsWith('image/') ? 'image-to-text' : 'text-file-to-markdown');
        let input: any;

        if (file.type === 'application/pdf') {
            input = { flow: 'rewrite-document-to-markdown', pdfDataUri: dataUri };
        } else if (file.type.startsWith('image/')) {
            input = { flow: 'image-to-text', imageDataUri: dataUri };
        } else {
            const content = Buffer.from(fileArrayBuffer).toString('utf-8');
            input = { content };
        }

        const result = await controller.runTool({
            userId: user.id,
            toolName,
            input,
        });

        return createApiResponse(result, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
