
'use server';

import { imageToText } from '@/ai/flows/image-to-text';
import { rewriteDocumentToMarkdown } from '@/ai/flows/rewrite-document-to-markdown';
import { deductCredit } from '@/services/credit-service';
import { logGeneration } from '@/services/generation-service';

const SUPPORTED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/markdown',
];

export const POST = withEnhancedAuth(async ({ request, user }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return handleApiErrorEnhanced({ message: 'No file uploaded.' }, 400);
        }

        if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
            return handleApiErrorEnhanced({ message: `Invalid file type. Supported types are: ${SUPPORTED_MIME_TYPES.join(', ')}` }, 400);
        }

        // Standard credit deduction for processing
        await deductCredit(user.id, 1);

        const fileArrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(fileArrayBuffer).toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        let result: { markdown: string } | { text: string };
        let agentId: string;
        let markdownContent: string;

        if (file.type === 'application/pdf') {
            agentId = 'pdf-to-markdown';
            result = await rewriteDocumentToMarkdown({ pdfDataUri: dataUri });
            markdownContent = 'markdown' in result ? result.markdown : '';
        } else if (file.type.startsWith('image/')) {
            agentId = 'image-to-text';
            result = await imageToText({ imageDataUri: dataUri });
            markdownContent = 'text' in result ? result.text : '';
        } else {
            // For plain text or markdown, we just decode it.
            agentId = 'text-file-to-markdown';
            markdownContent = Buffer.from(await file.arrayBuffer()).toString('utf-8');
            result = { markdown: markdownContent };
        }

        await logGeneration({
            agentId,
            userId: user.id,
            input: { fileName: file.name, fileType: file.type }, // Don't log the full data URI
            output: { markdownLength: markdownContent.length },
            creditCost: 1
        });

        return createApiResponseEnhanced({ markdown: markdownContent }, 200);

    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
});
