/**
 * API Route لقوالب التقارير - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لقوالب التقارير مع Lazy Seeding
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { REPORT_GENERATION_TEMPLATES as defaultTemplates } from '@/lib/db/seed-data/report-templates';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج جلب قوالب التقارير مع Lazy Seeding
 */
class GetReportTemplatesHandler extends SimpleApiHandler<any[]> {
    protected async processRequest() {
        const collectionRef = adminDb.collection('templates').doc('report').collection('items');
        let snapshot = await collectionRef.get();

        if (snapshot.empty) {
            const batch = adminDb.batch();
            defaultTemplates.forEach(template => {
                const docRef = collectionRef.doc(template.id);
                batch.set(docRef, template);
            });
            await batch.commit();
            snapshot = await collectionRef.get();
        }

        const templates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return templates;
    }
}

// إنشاء المعالج
const getReportTemplatesHandler = new GetReportTemplatesHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    getReportTemplatesHandler,
    { requireAuth: false, logging: true } // Public endpoint for fetching templates
);
