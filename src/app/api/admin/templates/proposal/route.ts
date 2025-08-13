// src/app/api/templates/proposal/route.ts
import { adminDb } from '@/lib/firebase/server-init';
import { PROPOSAL_TEMPLATES as defaultTemplates } from '@/lib/proposal-templates';
import { createApiResponse, handleApiError, withAuth } from '@/lib/api-utils';
import { CreateProposalTemplateSchema } from '@/ai/schemas/template-schemas';

// This endpoint is public for now, but could be restricted
export async function GET() {
    try {
        const collectionRef = adminDb.collection('templates').doc('proposal').collection('items');
        let snapshot = await collectionRef.get();

        if (snapshot.empty) {
            const batch = adminDb.batch();
            defaultTemplates.forEach((template) => {
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
        const validation = CreateProposalTemplateSchema.safeParse(body);
        if(!validation.success) {
            return handleApiError(validation.error);
        }

        const { id, ...agentData } = validation.data;
        const docRef = adminDb.collection('templates').doc('proposal').collection('items').doc(id);

        const doc = await docRef.get();
        if(doc.exists) {
            return handleApiError({ message: 'A template with this ID already exists.'}, 409);
        }

        const newTemplate = {
            ...agentData,
            createdAt: new Date().toISOString()
        };

        await docRef.set(newTemplate);

        return createApiResponse({ id, ...newTemplate }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
