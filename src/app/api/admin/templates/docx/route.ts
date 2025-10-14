/**
 * API Route لقوالب DOCX - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
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

export const GET = createApiHandler(async (context) => {
    try {
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

        return ApiResponse.success(templates);
    } catch (error) {
        console.error('Error fetching DOCX templates:', error);
        return ApiResponse.error('Failed to fetch DOCX templates', 500);
    }
}, { requireAuth: false });

export const POST = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const { id, name, description } = await request.json();

        // إنشاء قالب جديد بناءً على القالب الافتراضي 'modern'
        const newTemplateData = {
            name,
            description,
            styles: defaultTemplates.modern.styles,
            imageUrl: 'https://placehold.co/400x565.png',
            dataAiHint: 'document modern',
        };

        const newTemplate = await createGenerativeTemplate('docx', id, newTemplateData);
        return ApiResponse.created(newTemplate);
    } catch (error) {
        console.error('Error creating DOCX template:', error);
        return ApiResponse.error('Failed to create DOCX template', 500);
    }
}, { validateBody: createDocxTemplateSchema, requireAdmin: true });
