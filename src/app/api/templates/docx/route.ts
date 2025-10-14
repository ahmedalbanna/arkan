/**
 * API Route لقوالب DOCX - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { templates as defaultTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = createApiHandler(async (context) => {
    try {
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

        return ApiResponse.success(templates);
    } catch (error) {
        console.error('Error fetching DOCX templates:', error);
        return ApiResponse.error('Failed to fetch DOCX templates', 500);
    }
}, { requireAuth: false });
