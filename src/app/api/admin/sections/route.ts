/**
 * API Route لإدارة الأقسام - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإدارة الأقسام
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema للأقسام
const SectionSchema = z.object({
    id: z.string().min(3, 'ID must be at least 3 characters'),
    title: z.string().min(1, 'Title is required'),
    icon: z.string().min(1, 'Icon is required'),
    agentId: z.string().min(1, 'Agent is required'),
    type: z.enum(['report', 'diagram', 'presentation']),
});

/**
 * معالج جلب جميع الأقسام
 */
class GetSectionsHandler extends SimpleApiHandler<any[]> {
    protected async processRequest() {
        const snapshot = await adminDb.collection('sections').orderBy('title').get();
        const sections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return sections;
    }
}

/**
 * معالج إنشاء قسم جديد
 */
class CreateSectionHandler extends ComplexApiHandler<z.infer<typeof SectionSchema>, any> {
    protected inputSchema = SectionSchema;
    protected requiresAdmin = true;
    protected creditCost = 1;

    protected async processRequest(data: z.infer<typeof SectionSchema>) {
        const { id, ...sectionData } = data;
        const docRef = adminDb.collection('sections').doc(id);
        await docRef.set(sectionData);
        return { id, ...sectionData };
    }
}

// إنشاء المعالجات
const getSectionsHandler = new GetSectionsHandler();
const createSectionHandler = new CreateSectionHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    getSectionsHandler,
    { logging: true }
);

export const POST = withApiMiddleware(
    createSectionHandler,
    { requireAdmin: true, logging: true }
);
