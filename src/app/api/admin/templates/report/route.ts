// src/app/api/admin/templates/report/route.ts
import { adminDb } from '@/lib/firebase/server-init';
import { CreateReportTemplateSchema } from '@/ai/schemas';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';

export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = CreateReportTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, ...data } = validation.data;
        const collectionRef = adminDb.collection('templates').doc('report').collection('items');

        const docRef = collectionRef.doc(id);
        const doc = await docRef.get();
        if (doc.exists) {
            return handleApiError({ message: 'A report template with this ID already exists.' }, 409);
        }

        await docRef.set(data);
        return createApiResponse({ id, ...data }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
