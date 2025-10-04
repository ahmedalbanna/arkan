/**
 * API Route لتحويل مشروع مؤقت إلى دائم
 *
 * هذا الملف يحتوي على endpoint لتحويل مشروع مؤقت إلى دائم
 */

import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { tempProjectManager } from '@/lib/services/temp-project-manager';
import { z } from 'zod';

// Schema لتحويل مشروع مؤقت إلى دائم
const convertToPermanentSchema = z.object({
    permanentProjectId: z.string().optional(),
});

/**
 * معالج تحويل مشروع مؤقت إلى دائم
 */
class ConvertToPermanentHandler extends ComplexApiHandler<z.infer<typeof convertToPermanentSchema>, { projectId: string }> {
    protected inputSchema = convertToPermanentSchema;
    protected requiresAdmin = false;
    protected creditCost = 1; // يتطلب ائتمان واحد

    protected async processRequest(data: z.infer<typeof convertToPermanentSchema>, context: any): Promise<{ projectId: string }> {
        const { user, params } = context;
        const { id: tempProjectId } = await params;

        if (!tempProjectId.startsWith('temp-')) {
            throw new Error('Invalid temporary project ID');
        }

        // التحقق من أن المستخدم يملك المشروع المؤقت
        const isValidTemp = await tempProjectManager.validateTempProject(tempProjectId);
        if (!isValidTemp) {
            throw new Error('Temporary project not found or expired');
        }

        const permanentProjectId = await tempProjectManager.convertToPermanent(
            tempProjectId,
            data.permanentProjectId
        );

        return { projectId: permanentProjectId };
    }
}

// إنشاء المعالج
const convertToPermanentHandler = new ConvertToPermanentHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    convertToPermanentHandler.handle.bind(convertToPermanentHandler),
    { logging: true }
);
