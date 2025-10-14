/**
 * API Route للميزات - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { defaultFeatures } from '@/lib/features';
import { adminDb } from '@/lib/firebase/server-init';

export const GET = createApiHandler(async (context) => {
    try {
        const featuresCollection = adminDb.collection('features');
        let snapshot = await featuresCollection.get();

        // Lazy seeding: إذا لم تكن هناك ميزات موجودة، قم بملءها من الإعداد الافتراضي
        if (snapshot.empty) {
            const batch = adminDb.batch();
            defaultFeatures.forEach(feature => {
                const docRef = featuresCollection.doc(feature.id);
                batch.set(docRef, feature);
            });
            await batch.commit();
            snapshot = await featuresCollection.get(); // إعادة جلب بعد البذر
        }

        const features = snapshot.docs.map(doc => doc.data());
        return ApiResponse.success(features);
    } catch (error) {
        console.error('Error fetching features:', error);
        return ApiResponse.error('Failed to fetch features', 500);
    }
}, { requireAuth: false });
