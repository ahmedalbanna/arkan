// src/app/api/admin/templates/report/route.ts
import { listNestedDocs, batchWriteNested, getNestedDoc } from '@/lib/firebase/db-helpers';
import { CreateReportTemplateSchema, type ReportTemplateProperties } from '@/lib/models';
import { createApiResponse, handleApiError, withAuth } from '@/lib/utils/api-utils';
import { defaultReportTemplates } from '@/lib/db/seed-data/report-templates';


// This is a public endpoint that does not require authentication
// as all users need to be able to fetch the templates for building reports.
export async function GET() {
    try {
        const templatesPath = {
            parentCollection: 'templates',
            parentDocId: 'report',
            subcollection: 'items',
        };

        let templates = await listNestedDocs(templatesPath);

        // Lazy seeding
        if (templates.length === 0) {
            const operations = defaultReportTemplates.map(template => ({
                docId: template.id,
                data: template as any,
            }));
            await batchWriteNested(templatesPath, operations);
            // Re-fetch
            templates = await listNestedDocs(templatesPath);
        }

        const result = templates.map(doc => doc as ReportTemplateProperties);
        return createApiResponse(result, 200);
    } catch (error) {
        return handleApiError(error);
    }
}


export const POST = withAuth(async ({ request }) => {
    try {
        const body = await request.json();
        const validation = CreateReportTemplateSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, ...data } = validation.data;
        const templatesPath = {
            parentCollection: 'templates',
            parentDocId: 'report',
            subcollection: 'items',
        };

        const existing = await getNestedDoc(templatesPath, id);
        if (existing) {
            return handleApiError({ message: 'A report template with this ID already exists.' }, 409);
        }

        // Ensure content is at least an empty array
        const templateData = { ...data, content: data.content || [] } as any;
        
        // Manual creation since we need to set specific ID
        const { createNestedDoc } = await import('@/lib/firebase/db-helpers');
        const created = await createNestedDoc(templatesPath, templateData);
        
        return createApiResponse({ id, ...data }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
