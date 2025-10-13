/**
 * API Route لإدارة الوكلاء - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإدارة الوكلاء
 */

import { AgentPromptSchema } from '@/ai/schemas';
import { ComplexApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
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

/**
 * معالج إنشاء وكيل جديد
 */
class CreateAgentHandler extends ComplexApiHandler<{
    id: string;
    name: string;
    description: string;
    category: string;
    pageUrl: string;
    prompt: string | any;
    icon?: string;
}, {
    id: string;
    [key: string]: any;
}> {
    protected inputSchema = CreateAgentSchema;
    protected requiresAdmin = true;
    protected creditCost = 1;

    protected async processRequest(data: any, context: any) {
        const { id, ...agentData } = data;

        const agentRef = adminDb.collection('agents').doc(id);
        const doc = await agentRef.get();

        if (doc.exists) {
            throw new Error('An agent with this ID already exists.');
        }

        await agentRef.set({
            ...agentData,
            isEnabled: true,
            createdAt: new Date().toISOString()
        });

        const newAgent = await agentRef.get();
        return {
            id: newAgent.id,
            ...newAgent.data()
        };
    }
}

// إنشاء المعالج
const createAgentHandler = new CreateAgentHandler();

// تصدير الـ handler مع middleware
export const POST = withApiMiddleware(
    createAgentHandler,
    {
        requireAdmin: true,
        logging: true
    }
);
