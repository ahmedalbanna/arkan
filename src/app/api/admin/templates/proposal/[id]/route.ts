

// src/app/api/templates/proposal/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { PROPOSAL_TEMPLATES } from '@/lib/proposal-templates';
import { UpdateProposalTemplateSchema } from '@/ai/schemas/template-schemas';

export const PUT = withAuth(async ({ request, params }) => {
    try {
        const id = params.id;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        const templateRef = adminDb.collection('templates').doc('proposal').collection('items').doc(id);
        const templateDoc = await templateRef.get();

        if (!templateDoc.exists) {
            return handleApiError({ message: 'Template not found.' }, 404);
        }
        
        const body = await request.json();
        const validation = UpdateProposalTemplateSchema.safeParse(body);

        if (!validation.success) {
            return handleApiError(validation.error);
        }
        
        await templateRef.update({ ...validation.data, updatedAt: new Date().toISOString() });
        const updatedDoc = await templateRef.get();
        
        return createApiResponse({ id: updatedDoc.id, ...updatedDoc.data() }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


export const DELETE = withAuth(async ({ params }) => {
    try {
        const id = params.id;
        if (!id) {
            return handleApiError({ message: 'Template ID is required.' }, 400);
        }

        // Protect default templates
        if (PROPOSAL_TEMPLATES.some(t => t.id === id)) {
            return handleApiError({ message: 'Default templates cannot be deleted.' }, 403);
        }

        const templateRef = adminDb.collection('templates').doc('proposal').collection('items').doc(id);
        const doc = await templateRef.get();
        if (!doc.exists) {
            return handleApiError({ message: 'Template not found.' }, 404);
        }
        
        await templateRef.delete();
        
        return createApiResponse({ message: `Template "${id}" deleted successfully.` }, 200);

    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
