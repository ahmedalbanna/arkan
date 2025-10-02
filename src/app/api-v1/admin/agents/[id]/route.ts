

// src/app/api/agents/[id]/route.ts
import { ApiUpdateAgentSchema } from '@/ai/schemas';
import { createApiResponseEnhanced, handleApiErrorEnhanced, withEnhancedAuth } from '@/lib/core/api';
import { adminDb } from '@/lib/firebase/server-init';

// GET /api/agents/[id]
export const GET = withEnhancedAuth(async ({ params }) => {
    try {
        const { id: agentId } = params;
        const agentDoc = await adminDb.collection("agents").doc(agentId).get();
        if (!agentDoc.exists) {
            return handleApiErrorEnhanced({ message: 'Agent not found.' }, '404');
        }

        const data = agentDoc.data();

        return createApiResponseEnhanced({ ...data, id: agentDoc.id }, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });


// PUT /api/agents/[id]
export const PUT = withEnhancedAuth(async ({ request, params }) => {
    try {
        const agentId = params.id;
        const agentRef = adminDb.collection('agents').doc(agentId);
        const agentDoc = await agentRef.get();
        if (!agentDoc.exists) {
            return handleApiErrorEnhanced({ message: 'Agent not found.' }, '404');
        }

        const body = await request.json();
        const validation = ApiUpdateAgentSchema.safeParse(body);
        if (!validation.success) {
            return handleApiErrorEnhanced(validation.error);
        }

        const updateData: any = { ...validation.data };

        await agentRef.update(updateData);
        const updatedDoc = await agentRef.get();

        return createApiResponseEnhanced({ id: updatedDoc.id, ...updatedDoc.data() }, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });

// DELETE /api/agents/[id]
export const DELETE = withEnhancedAuth(async ({ params }) => {
    try {
        const agentId = params.id;
        const agentRef = adminDb.collection('agents').doc(agentId);
        const doc = await agentRef.get();
        if (!doc.exists) {
            return handleApiErrorEnhanced({ message: 'Agent not found.' }, '404');
        }

        // Prevent deletion of default agents
        if (doc.data()?.isDefault) {
            return handleApiErrorEnhanced({ message: 'Default agents cannot be deleted.' }, '403');
        }

        await agentRef.delete();
        return createApiResponseEnhanced({ message: `Agent '${agentId}' deleted successfully.` }, 200);
    } catch (error) {
        return handleApiErrorEnhanced(error);
    }
}, { requireAdmin: true });
