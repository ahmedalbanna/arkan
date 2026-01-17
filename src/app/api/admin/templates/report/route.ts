// src/app/api/admin/templates/report/route.ts
import { adminDb } from '@/lib/firebase/server-init';
import { CreateReportTemplateSchema, type ReportTemplateProperties } from '@/lib/models';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { defaultReportTemplates } from '@/lib/db/seed-data/report-templates';


// This is a public endpoint that does not require authentication
// as all users need to be able to fetch the templates for building reports.
export async function GET() {
    try {
        let collectionRef = adminDb.collection('templates').doc('report').collection('items');
        let snapshot = await collectionRef.get();

        // Lazy seeding
        if (snapshot.empty) {
            let batch = adminDb.batch();
            defaultReportTemplates.forEach(template => {
                const docRef = collectionRef.doc(template.id);
                batch.set(docRef, template);
            });
            await batch.commit();
            snapshot = await collectionRef.get(); // Re-fetch
        }

        let templates = snapshot.docs.map(doc => doc.data() as ReportTemplateProperties);
        return createApiResponse(templates, 200);
    } catch (error) {
        return handleApiError(error);
    }
}


export const POST = withAuth(async ({ request }) => {
    try {
        let body = await request.json();
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
