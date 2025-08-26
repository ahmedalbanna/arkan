

// src/app/api/agents/[id]/route.ts
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/server-init';
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
import { ApiUpdateAgentSchema } from '@/ai/schemas';


// GET /api/agents/[id]
export const GET = withAuth(async ({ params }) => {
    try {
        const agentId = params.id;
        const agentDoc = await adminDb.collection("agents").doc(agentId).get();
        if (!agentDoc.exists) {
            return handleApiError({ message: 'Agent not found.' }, 404);
        }

        const data = agentDoc.data();

        return createApiResponse({ ...data, id: agentDoc.id }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });


// PUT /api/agents/[id]
export const PUT = withAuth(async ({ request, params }) => {
    try {
        const agentId = params.id;
        const agentRef = adminDb.collection('agents').doc(agentId);
        const agentDoc = await agentRef.get();
        if (!agentDoc.exists) {
            return handleApiError({ message: 'Agent not found.' }, 404);
        }

        const body = await request.json();
        const validation = ApiUpdateAgentSchema.safeParse(body);
        if (!validation.success) {
            return handleApiError(validation.error);
        }

        const updateData: any = { ...validation.data };

        await agentRef.update(updateData);
        const updatedDoc = await agentRef.get();

        return createApiResponse({ id: updatedDoc.id, ...updatedDoc.data() }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });

// DELETE /api/agents/[id]
export const DELETE = withAuth(async ({ params }) => {
    try {
        const agentId = params.id;
        const agentRef = adminDb.collection('agents').doc(agentId);
        const doc = await agentRef.get();
        if (!doc.exists) {
            return handleApiError({ message: 'Agent not found.' }, 404);
        }

        // Prevent deletion of default agents
        if (doc.data()?.isDefault) {
            return handleApiError({ message: 'Default agents cannot be deleted.' }, 403);
        }

        await agentRef.delete();
        return createApiResponse({ message: `Agent '${agentId}' deleted successfully.` }, 200);
    } catch (error) {
        return handleApiError(error);
    }
}, { requireAdmin: true });
