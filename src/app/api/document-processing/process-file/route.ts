
'use server';

import { rewriteDocumentToMarkdown } from '@/ai/flows/rewrite-document-to-markdown';
import { imageToText } from '@/ai/flows/image-to-text';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

const SUPPORTED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
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

        // Standard credit deduction for processing
        await deductCredit(user.id, 2);

        const fileArrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(fileArrayBuffer).toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        let result: { markdown: string } | { text: string };
        let agentId: string;

        // Route to the correct AI flow based on file type
        if (file.type === 'application/pdf') {
            agentId = 'pdf-to-markdown';
            result = await rewriteDocumentToMarkdown({ pdfDataUri: dataUri });
        } else {
            agentId = 'image-to-text';
            result = await imageToText({ imageDataUri: dataUri });
        }
        
        const markdownContent = 'markdown' in result ? result.markdown : result.text;

        await logGeneration({
            agentId,
            userId: user.id,
            input: { fileName: file.name, fileType: file.type }, // Don't log the full data URI
            output: { markdownLength: markdownContent.length },
        });

        return createApiResponse({ markdown: markdownContent }, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
