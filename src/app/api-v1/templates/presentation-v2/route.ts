/**
 * API Route لقوالب PPTX - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لقوالب PPTX مع Lazy Seeding
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
import { templates as defaultTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';

/**
 * معالج جلب قوالب PPTX مع Lazy Seeding
 */
class GetPptxTemplatesHandler extends SimpleApiHandler<{ [key: string]: any }> {
    protected async processRequest() {
        const stylesCollection = adminDb.collection('templates').doc('pptx').collection('styles');
        let snapshot = await stylesCollection.get();

        // Lazy seeding: If no templates exist, populate them from the default config.
        if (snapshot.empty) {
            const batch = adminDb.batch();
            (Object.keys(defaultTemplates) as PptxTemplateKey[]).forEach(key => {
                const template = defaultTemplates[key];
                const docRef = stylesCollection.doc(key);
                batch.set(docRef, { ...template, id: key, createdAt: new Date().toISOString() });
            });
            await batch.commit();
            snapshot = await stylesCollection.get(); // Re-fetch after seeding
        }

        const templates: { [key: string]: any } = {};
        snapshot.docs.forEach((doc) => {
            templates[doc.id] = doc.data();
        });

        return templates;
    }
}

// إنشاء المعالج
const getPptxTemplatesHandler = new GetPptxTemplatesHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    getPptxTemplatesHandler.handle.bind(getPptxTemplatesHandler),
    { requireAuth: false, logging: true } // Public endpoint for fetching templates
);
