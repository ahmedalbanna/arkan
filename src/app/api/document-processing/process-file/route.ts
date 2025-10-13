/**
 * API Route لمعالجة الملفات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لمعالجة الملفات
 */

import { imageToText, rewriteDocumentToMarkdown } from '@/ai/flows/unified';
import { CreditBasedApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
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

/**
 * معالج معالجة الملفات
 */
class ProcessFileHandler extends CreditBasedApiHandler<{
    file: File;
}, {
    markdown: string;
}> {
    protected creditCost = 1;
    protected requiresAdmin = false;
    protected inputSchema = processFileSchema;
    protected async processRequest(data: {
        file: File;
    }, context: any) {
        const { user } = context;
        const file = data.file;

        if (!file) {
            throw new Error('No file uploaded.');
        }

        if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
            throw new Error(`Invalid file type. Supported types are: ${SUPPORTED_MIME_TYPES.join(', ')}`);
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
            creditCost: this.creditCost
        });

        return { markdown: markdownContent };
    }
}

// إنشاء المعالج
const processFileHandler = new ProcessFileHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    processFileHandler,
    {
        logging: true
    }
);
