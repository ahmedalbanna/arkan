
'use server';

import { imageToText } from '@/ai/flows/image-to-text';
import { rewriteDocumentToMarkdown } from '@/ai/flows/rewrite-document-to-markdown';
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
        
        const result = await controller.runTool({
            userId: user.id,
            toolName: file.type === 'application/pdf' ? 'pdf-to-markdown' : (file.type.startsWith('image/') ? 'image-to-text' : 'text-file-to-markdown'),
            input: { fileName: file.name, fileType: file.type },
            flow: async () => {
                if (file.type === 'application/pdf') {
                    const res = await rewriteDocumentToMarkdown({ flow: 'rewrite-document-to-markdown', pdfDataUri: dataUri });
                    return { markdown: 'markdown' in res ? res.markdown : '' };
                } else if (file.type.startsWith('image/')) {
                    const res = await imageToText({ flow: 'image-to-text', imageDataUri: dataUri });
                    return { markdown: 'text' in res ? res.text : '' };
                } else {
                    const content = Buffer.from(fileArrayBuffer).toString('utf-8');
                    return { markdown: content };
                }
            },
            creditCost: 1
        });

        return createApiResponse(result, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
