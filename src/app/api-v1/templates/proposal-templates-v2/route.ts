/**
 * API Route لقوالب المقترحات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لقوالب المقترحات مع Lazy Seeding
 */

import { SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { PROPOSAL_TEMPLATES as defaultTemplates } from '@/lib/db/seed-data/proposal-templates';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج جلب قوالب المقترحات مع Lazy Seeding
 */
class GetProposalTemplatesHandler extends SimpleApiHandler<any[]> {
    protected async processRequest() {
        const collectionRef = adminDb.collection('templates').doc('proposal').collection('items');
        let snapshot = await collectionRef.get();

        if (snapshot.empty) {
            const batch = adminDb.batch();
            defaultTemplates.forEach((template) => {
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
const getProposalTemplatesHandler = new GetProposalTemplatesHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    getProposalTemplatesHandler.handle.bind(getProposalTemplatesHandler),
    { requireAuth: false, logging: true } // Public endpoint for fetching templates
);
