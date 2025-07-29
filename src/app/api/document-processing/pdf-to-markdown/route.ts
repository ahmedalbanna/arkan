
'use server';

import { rewriteDocumentToMarkdown } from '@/ai/flows/rewrite-document-to-markdown';
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

        if (file.type !== 'application/pdf') {
            return handleApiError({ message: 'Invalid file type. Only PDF is allowed.' }, 400);
        }

        await deductCredit(user.id, 2);

        const fileArrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(fileArrayBuffer).toString('base64');
        const pdfDataUri = `data:application/pdf;base64,${base64}`;

        const agentInput = { pdfDataUri };
        const result = await rewriteDocumentToMarkdown(agentInput);

        await logGeneration({
            agentId: 'pdf-to-markdown',
            userId: user.id,
            input: { fileName: file.name, fileType: file.type }, // Don't log the full data URI
            output: result,
        });

        return createApiResponse({ markdown: result.markdown }, 200);

    } catch (error) {
        return handleApiError(error);
    }
});
