/**
 * API Route لتحديث الميزات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لتحديث الميزات
 */

import { ComplexApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لتحديث الميزة
const updateFeatureSchema = z.object({
    isEnabled: z.boolean(),
});

/**
 * معالج تحديث الميزة
 */
class UpdateFeatureHandler extends ComplexApiHandler<z.infer<typeof updateFeatureSchema>, any> {
    protected inputSchema = updateFeatureSchema;
    protected requiresAdmin = true;
    protected creditCost = 1;

    protected async processRequest(data: z.infer<typeof updateFeatureSchema>, context: any) {
        const { params } = context;
        const id = params.id;

        if (!id) {
            throw new Error('Feature ID is required.');
        }

        const featureRef = adminDb.collection('features').doc(id);
        const featureDoc = await featureRef.get();

        if (!featureDoc.exists) {
            throw new Error('Feature not found.');
        }

        await featureRef.update({ isEnabled: data.isEnabled });
        const updatedDoc = await featureRef.get();

        return { id: updatedDoc.id, ...updatedDoc.data() };
    }
}

// إنشاء المعالج
const updateFeatureHandler = new UpdateFeatureHandler();

// تصدير الـ handler مع middleware
export const PUT = withApiMiddleware(
    updateFeatureHandler,
    { requireAdmin: true, logging: true }
);
