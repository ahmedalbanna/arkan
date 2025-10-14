/**
 * API Route لإدارة الوكلاء الفردية - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { AgentPromptSchema } from '@/lib/template-schemas';
import { z } from 'zod';

// Schema لتحديث الوكيل
const updateAgentSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    prompt: z.union([z.string().min(10), AgentPromptSchema]).optional(),
    isEnabled: z.boolean().optional(),
    category: z.string().optional(),
});

export const GET = createApiHandler(async (context) => {
    try {
        const { params } = context;
        const { id: agentId } = params;

        const agentDoc = await adminDb.collection("agents").doc(agentId).get();
        if (!agentDoc.exists) {
            return ApiResponse.notFound('Agent not found.');
        }

        const data = agentDoc.data();
        return ApiResponse.success({ ...data, id: agentDoc.id });
    } catch (error) {
        console.error('Error fetching agent:', error);
        return ApiResponse.error('Failed to fetch agent', 500);
    }
}, { requireAdmin: true });

export const PUT = createApiHandler(async (context) => {
    try {
        const { params, request } = context;
        const agentId = params.id;
        const data = await request.json();

        const agentRef = adminDb.collection('agents').doc(agentId);
        const agentDoc = await agentRef.get();
        if (!agentDoc.exists) {
            return ApiResponse.notFound('Agent not found.');
        }

        const updateData: any = { ...data };
        await agentRef.update(updateData);
        const updatedDoc = await agentRef.get();

        return ApiResponse.success({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        console.error('Error updating agent:', error);
        return ApiResponse.error('Failed to update agent', 500);
    }
}, { validateBody: updateAgentSchema, requireAdmin: true });

export const DELETE = createApiHandler(async (context) => {
    try {
        const { params } = context;
        const agentId = params.id;

        const agentRef = adminDb.collection('agents').doc(agentId);
        const doc = await agentRef.get();
        if (!doc.exists) {
            return ApiResponse.notFound('Agent not found.');
        }

        // Prevent deletion of default agents
        if (doc.data()?.isDefault) {
            return ApiResponse.forbidden('Default agents cannot be deleted.');
        }

        await agentRef.delete();
        return ApiResponse.success({ message: `Agent '${agentId}' deleted successfully.` });
    } catch (error) {
        console.error('Error deleting agent:', error);
        return ApiResponse.error('Failed to delete agent', 500);
    }
}, { requireAdmin: true });
