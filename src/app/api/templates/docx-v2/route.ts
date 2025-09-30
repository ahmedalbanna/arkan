/**
 * API Route لقوالب DOCX - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لقوالب DOCX مع Lazy Seeding
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { templates as defaultTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج جلب قوالب DOCX مع Lazy Seeding
 */
class GetDocxTemplatesHandler extends SimpleApiHandler<{ [key: string]: any }> {
    protected async processRequest() {
        const stylesCollection = adminDb.collection('templates').doc('docx').collection('styles');
        let snapshot = await stylesCollection.get();

        // Lazy seeding: If no templates exist, populate them from the default config.
        if (snapshot.empty) {
            const batch = adminDb.batch();
            (Object.keys(defaultTemplates) as DocxTemplateKey[]).forEach(key => {
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
const getDocxTemplatesHandler = new GetDocxTemplatesHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    getDocxTemplatesHandler.handle.bind(getDocxTemplatesHandler),
    { requireAuth: false, logging: true } // Public endpoint for fetching templates
);
