/**
 * API Route للميزات - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للميزات
 */

import { SimpleApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { defaultFeatures } from '@/lib/features';
import { adminDb } from '@/lib/firebase/server-init';

/**
 * معالج قائمة الميزات
 */
class FeaturesListHandler extends SimpleApiHandler<any[]> {
    protected async processRequest(context: any) {
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
        return features;
    }
}

// إنشاء المعالج
const featuresListHandler = new FeaturesListHandler();

// تصدير الـ handler مع middleware
export const GET = withApiMiddleware(
    featuresListHandler,
    {
        requireAuth: false, // هذا الـ endpoint عام ولا يتطلب مصادقة
        logging: true
    }
);
