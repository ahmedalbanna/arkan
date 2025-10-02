/**
 * API Route لقوالب DOCX - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لقوالب DOCX
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { createGenerativeTemplate } from '@/lib/db/queries';
import { templates as defaultTemplates, type DocxTemplateKey } from '@/lib/docx-styles';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

// Schema لإنشاء قالب DOCX جديد
const createDocxTemplateSchema = z.object({
    id: z.string()
        .min(3, "ID must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
});

/**
 * معالج قائمة قوالب DOCX (GET)
 */
class DocxTemplatesListHandler extends SimpleApiHandler<{ [key: string]: any }> {
    protected async processRequest(context: any) {
        const stylesCollection = adminDb.collection('templates').doc('docx').collection('styles');
        let snapshot = await stylesCollection.get();

        // Lazy seeding: إذا لم تكن هناك قوالب موجودة، قم بملءها من الإعداد الافتراضي
        if (snapshot.empty) {
            const batch = adminDb.batch();
            (Object.keys(defaultTemplates) as DocxTemplateKey[]).forEach(key => {
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
 * معالج إنشاء قالب DOCX جديد (POST)
 */
class CreateDocxTemplateHandler extends ComplexApiHandler<{
    id: string;
    name: string;
    description: string;
}, any> {
    protected inputSchema = createDocxTemplateSchema;
    protected requiresAdmin = true;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any) {
        const { id, name, description } = data;

        // إنشاء قالب جديد بناءً على القالب الافتراضي 'modern'
        const newTemplateData = {
            name,
            description,
            styles: defaultTemplates.modern.styles,
            imageUrl: 'https://placehold.co/400x565.png',
            dataAiHint: 'document modern',
        };

        const newTemplate = await createGenerativeTemplate('docx', id, newTemplateData);
        return newTemplate;
    }
}

// إنشاء المعالجات
const docxTemplatesListHandler = new DocxTemplatesListHandler();
const createDocxTemplateHandler = new CreateDocxTemplateHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    docxTemplatesListHandler.handle.bind(docxTemplatesListHandler),
    {
        requireAuth: false, // هذا الـ endpoint عام ولا يتطلب مصادقة
        logging: true
    }
);

export const POST = withApiMiddleware(
    createDocxTemplateHandler.handle.bind(createDocxTemplateHandler),
    {
        requireAdmin: true,
        logging: true
    }
);
