/**
 * API Route لإدارة فئات الوكلاء - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإدارة فئات الوكلاء
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لإنشاء فئة جديدة
const createCategorySchema = z.object({
    id: z.string().min(3, "ID must be at least 3 characters").regex(/^[a-z0-9-]+$/, "ID must be lowercase, and can only contain letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
});

/**
 * معالج جلب فئات الوكلاء
 */
class GetAgentCategoriesHandler extends SimpleApiHandler<any[]> {
    protected requiresAdmin = true;

    protected async processRequest() {
        const snapshot = await adminDb.collection('agent_categories').orderBy('name').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return categories;
    }
}

/**
 * معالج إنشاء فئة وكيل جديدة
 */
class CreateAgentCategoryHandler extends ComplexApiHandler<z.infer<typeof createCategorySchema>, any> {
    protected inputSchema = createCategorySchema;
    protected requiresAdmin = true;
    protected creditCost = 1;

    protected async processRequest(data: z.infer<typeof createCategorySchema>) {
        const { id, name } = data;
        const categoryRef = adminDb.collection('agent_categories').doc(id);
        const doc = await categoryRef.get();

        if (doc.exists) {
            throw new Error('A category with this ID already exists.');
        }

        const newCategory = { name };
        await categoryRef.set(newCategory);

        return { id, ...newCategory };
    }
}

// إنشاء المعالجات
const getAgentCategoriesHandler = new GetAgentCategoriesHandler();
const createAgentCategoryHandler = new CreateAgentCategoryHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    getAgentCategoriesHandler,
    { requireAdmin: true, logging: true }
);

export const POST = withApiMiddleware(
    createAgentCategoryHandler,
    { requireAdmin: true, logging: true }
);
