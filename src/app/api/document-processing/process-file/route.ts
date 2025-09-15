
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
        
        let result: { markdown: string } | { text: string };
        let agentId: string;
        let markdownContent: string;
        let creditCost = 0;

        if (file.type === 'application/pdf') {
            creditCost = 2; // AI processing required
            await deductCredit(user.id, creditCost);
            const fileArrayBuffer = await file.arrayBuffer();
            const base64 = Buffer.from(fileArrayBuffer).toString('base64');
            const dataUri = `data:${file.type};base64,${base64}`;
            agentId = 'pdf-to-markdown';
            result = await rewriteDocumentToMarkdown({ pdfDataUri: dataUri });
            markdownContent = 'markdown' in result ? result.markdown : '';
        } else if (file.type.startsWith('image/')) {
            creditCost = 1; // AI processing required
            await deductCredit(user.id, creditCost);
            const fileArrayBuffer = await file.arrayBuffer();
            const base64 = Buffer.from(fileArrayBuffer).toString('base64');
            const dataUri = `data:${file.type};base64,${base64}`;
            agentId = 'image-to-text';
            result = await imageToText({ imageDataUri: dataUri });
            markdownContent = 'text' in result ? result.text : '';
        } else {
            // For plain text or markdown, we just decode it.
            // No AI call needed, so no credit deduction for this path.
            agentId = 'text-file-to-markdown';
            markdownContent = Buffer.from(await file.arrayBuffer()).toString('utf-8');
            result = { markdown: markdownContent };
        }

        await logGeneration({
            agentId,
            userId: user.id,
            input: { fileName: file.name, fileType: file.type }, // Don't log the full data URI
            output: { markdownLength: markdownContent.length },
            creditCost: creditCost,
        });

        return createApiResponse({ markdown: markdownContent }, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
