
// src/app/api/templates/report/route.ts
import { listNestedDocs, createNestedDocWithId, getNestedDoc, batchWriteNested } from '@/lib/firebase/db-helpers';
import { CreateReportTemplateSchema, type ReportTemplateProperties } from '@/lib/models';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { defaultReportTemplates } from '@/lib/db/seed-data/report-templates';


// This is a public endpoint that does not require authentication
// as all users need to be able to fetch the templates for building reports.
export async function GET() {
    try {
        const path = {
            parentCollection: 'templates',
            parentDocId: 'report',
            subcollection: 'items',
        };

        let templates = await listNestedDocs(path);

        // Lazy seeding
        if (templates.length === 0) {
            const operations = defaultReportTemplates.map((template: ReportTemplateProperties) => ({
                docId: template.id,
                data: template,
            }));
            await batchWriteNested(path, operations);
            templates = await listNestedDocs(path);
        }

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
        const path = {
            parentCollection: 'templates',
            parentDocId: 'report',
            subcollection: 'items',
        };

        const existing = await getNestedDoc(path, id);
        if (existing) {
            return handleApiError({ message: 'A report template with this ID already exists.' }, 409);
        }

        const created = await createNestedDocWithId(path, id, data);
        return createApiResponse(created, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
