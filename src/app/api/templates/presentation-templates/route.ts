/**
 * API Route لقوالب العروض التقديمية - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API مع Lazy Seeding
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { PRESENTATION_GENERATION_TEMPLATES as defaultTemplates } from '@/lib/db/seed-data/presentation-templates';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = createApiHandler(async () => {
    try {
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
        return ApiResponse.success(templates);
    } catch (error) {
        console.error('Error fetching presentation templates:', error);
        return ApiResponse.error('Failed to fetch presentation templates', 500);
    }
}, { requireAuth: false });
