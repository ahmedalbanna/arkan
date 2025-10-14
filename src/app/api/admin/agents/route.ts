/**
 * API Route لإدارة الوكلاء - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { AgentPromptSchema } from '@/lib/template-schemas';
import { z } from 'zod';

// Schema لإنشاء وكيل جديد
const CreateAgentSchema = z.object({
    id: z.string()
        .min(3, "ID must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "ID must be lowercase and contain only letters, numbers, and hyphens."),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required."),
    pageUrl: z.string()
        .min(1, "Page URL is required")
        .startsWith('/', "URL must start with /"),
    prompt: z.union([z.string(), AgentPromptSchema]),
    icon: z.string().optional(),
});

export const POST = createApiHandler(async (context) => {
    try {
        const { request } = context;
        const data = await request.json();
        const { id, ...agentData } = data;

        const agentRef = adminDb.collection('agents').doc(id);
        const doc = await agentRef.get();

        if (doc.exists) {
            return ApiResponse.badRequest('An agent with this ID already exists.');
        }

        await agentRef.set({
            ...agentData,
            isEnabled: true,
            createdAt: new Date().toISOString()
        });

        const newAgent = await agentRef.get();
        return ApiResponse.created({
            id: newAgent.id,
            ...newAgent.data()
        });
    } catch (error) {
        console.error('Error creating agent:', error);
        return ApiResponse.error('Failed to create agent', 500);
    }
}, { validateBody: CreateAgentSchema, requireAdmin: true });
