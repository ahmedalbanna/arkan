/**
 * API Route لقوالب PPTX - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لقوالب PPTX
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { createGenerativeTemplate } from '@/lib/db/queries';
import { adminDb } from '@/lib/firebase/server-init';
import { templates as defaultTemplates, type PptxTemplateKey } from '@/lib/pptx-styles';
import { z } from 'zod';

// Schema لإنشاء قالب PPTX جديد
const createPptxTemplateSchema = z.object({
    id: z.string()
        .min(3, "ID must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
});

/**
 * معالج قائمة قوالب PPTX (GET)
 */
class PptxTemplatesListHandler extends SimpleApiHandler<{ [key: string]: any }> {
    protected async processRequest(context: any) {
        const stylesCollection = adminDb.collection('templates').doc('pptx').collection('styles');
        let snapshot = await stylesCollection.get();

        // Lazy seeding: إذا لم تكن هناك قوالب موجودة، قم بملءها من الإعداد الافتراضي
        if (snapshot.empty) {
            const batch = adminDb.batch();
            (Object.keys(defaultTemplates) as PptxTemplateKey[]).forEach(key => {
                const template = defaultTemplates[key];
                const docRef = stylesCollection.doc(key);
                batch.set(docRef, {
                    ...template,
                    id: key,
                    createdAt: new Date().toISOString()
                });
            });
            await batch.commit();
            snapshot = await stylesCollection.get(); // إعادة جلب بعد البذر
        }

        const templates: { [key: string]: any } = {};
        snapshot.docs.forEach((doc) => {
            templates[doc.id] = doc.data();
        });

        return templates;
    }
}

/**
 * معالج إنشاء قالب PPTX جديد (POST)
 */
class CreatePptxTemplateHandler extends ComplexApiHandler<{
    id: string;
    name: string;
    description: string;
}, any> {
    protected inputSchema = createPptxTemplateSchema;
    protected requiresAdmin = true;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any) {
        const { id, name, description } = data;

        // إنشاء قالب جديد بناءً على القالب الافتراضي 'modern'
        const newTemplateData = {
            name,
            description,
            styles: defaultTemplates.modern.styles,
            imageUrl: 'https://placehold.co/400x225.png',
            dataAiHint: 'presentation modern',
        };

        const newTemplate = await createGenerativeTemplate('pptx', id, newTemplateData);
        return newTemplate;
    }
}

// إنشاء المعالجات
const pptxTemplatesListHandler = new PptxTemplatesListHandler();
const createPptxTemplateHandler = new CreatePptxTemplateHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    pptxTemplatesListHandler.handle.bind(pptxTemplatesListHandler),
    {
        requireAuth: false, // هذا الـ endpoint عام ولا يتطلب مصادقة
        logging: true
    }
);

export const POST = withApiMiddleware(
    createPptxTemplateHandler.handle.bind(createPptxTemplateHandler),
    {
        requireAdmin: true,
        logging: true
    }
);
