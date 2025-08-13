// src/app/api/templates/report/route.ts
import { adminDb } from '@/lib/firebase/server-init';
import { REPORT_GENERATION_TEMPLATES as defaultTemplates } from '@/lib/report-generation-templates';
import { createApiResponse, handleApiError, withAuth } from '@/lib/api-utils';
import { z } from 'zod';
import { CreateReportTemplateSchema } from '@/ai/schemas/template-schemas';

// This is a public endpoint
export async function GET() {
    try {
        const collectionRef = adminDb.collection('templates').doc('report').collection('items');
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
        return createApiResponse(templates, 200);
    } catch (error) {
        return handleApiError(error);
    }
}


export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = CreateReportTemplateSchema.safeParse(body);
        if(!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, ...templateData } = validation.data;
        const docRef = adminDb.collection('templates').doc('report').collection('items').doc(id);

        const doc = await docRef.get();
        if(doc.exists) {
            return handleApiError({ message: 'A template with this ID already exists.'}, 409);
        }

        await docRef.set({ ...templateData, createdAt: new Date().toISOString() });

        return createApiResponse({ id, ...templateData }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
