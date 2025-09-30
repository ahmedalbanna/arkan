/**
 * API Route لتحديث وحذف الأقسام - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتحديث وحذف الأقسام
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لتحديث الأقسام
const SectionUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    agentId: z.string().min(1).optional(),
    type: z.enum(['report', 'diagram', 'presentation']).optional(),
});

/**
 * معالج تحديث قسم
 */
class UpdateSectionHandler extends ComplexApiHandler<z.infer<typeof SectionUpdateSchema>, any> {
    protected inputSchema = SectionUpdateSchema;
    protected requiresAdmin = true;
    protected creditCost = 1;

    protected async processRequest(data: z.infer<typeof SectionUpdateSchema>, context: any) {
        const { params } = context;
        const sectionId = params.id;

        if (!sectionId) {
            throw new Error('Section ID is required');
        }

        const docRef = adminDb.collection('sections').doc(sectionId);
        await docRef.update(data);
        const updatedDoc = await docRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }
}

/**
 * معالج حذف قسم
 */
class DeleteSectionHandler extends SimpleApiHandler<{ message: string }> {
    protected requiresAdmin = true;

    protected async processRequest(context: any) {
        const { params } = context;
        const sectionId = params.id;

        if (!sectionId) {
            throw new Error('Section ID is required');
        }

        await adminDb.collection('sections').doc(sectionId).delete();
        return { message: 'Section deleted successfully' };
    }
}

// إنشاء المعالجات
const updateSectionHandler = new UpdateSectionHandler();
const deleteSectionHandler = new DeleteSectionHandler();

// تصدير الـ handlers مع middleware
export const PUT = withApiMiddleware(
    updateSectionHandler.handle.bind(updateSectionHandler),
    { requireAdmin: true, logging: true }
);

export const DELETE = withApiMiddleware(
    deleteSectionHandler.handle.bind(deleteSectionHandler),
    { requireAdmin: true, logging: true }
);
