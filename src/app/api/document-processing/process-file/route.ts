/**
 * API Route لمعالجة الملفات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { imageToText, rewriteDocumentToMarkdown } from '@/ai/flows/unified';
import { ApiResponse, createApiHandler } from '@/core/api';
import { logGeneration } from '@/services';
import { z } from 'zod';

// Schema لمعالجة الملفات
const processFileSchema = z.object({
    file: z.instanceof(File),
});

const SUPPORTED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/markdown',
];

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return ApiResponse.badRequest('No file uploaded');
        }

        if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
            return ApiResponse.badRequest(`Invalid file type. Supported types are: ${SUPPORTED_MIME_TYPES.join(', ')}`);
        }

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
            // للملفات النصية أو Markdown، نقوم بفك تشفيرها فقط
            agentId = 'text-file-to-markdown';
            markdownContent = Buffer.from(await file.arrayBuffer()).toString('utf-8');
            result = { markdown: markdownContent };
        }

        // تسجيل العملية
        await logGeneration({
            agentId,
            userId: user.id,
            input: { fileName: file.name, fileType: file.type }, // لا نسجل الـ data URI كاملاً
            output: { markdownLength: markdownContent.length },
            creditCost: 1
        });

        return ApiResponse.success({ markdown: markdownContent });
    } catch (error) {
        console.error('Process file error:', error);
        return ApiResponse.error('Failed to process file', 500);
    }
}, { requireAuth: true });
