/**
 * API Route لقوالب العروض التقديمية - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لقوالب العروض التقديمية مع Lazy Seeding
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { PRESENTATION_GENERATION_TEMPLATES as defaultTemplates } from '@/lib/db/seed-data/presentation-templates';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج جلب قوالب العروض التقديمية مع Lazy Seeding
 */
class GetPresentationTemplatesHandler extends SimpleApiHandler<any[]> {
    protected async processRequest() {
        const collectionRef = adminDb.collection('templates').doc('presentation').collection('items');
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
const getPresentationTemplatesHandler = new GetPresentationTemplatesHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    getPresentationTemplatesHandler,
    { requireAuth: false, logging: true } // Public endpoint for fetching templates
);
