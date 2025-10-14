/**
 * API Route لقوالب PPTX - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { templates as defaultTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';

export const GET = createApiHandler(async (context) => {
    try {
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

        return ApiResponse.success(templates);
    } catch (error) {
        console.error('Error fetching PPTX templates:', error);
        return ApiResponse.error('Failed to fetch PPTX templates', 500);
    }
}, { requireAuth: false });
