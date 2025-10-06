/**
 * API Route لإدارة المشاريع الفردية - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد لإدارة المشاريع الفردية
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { adminDb } from '@/lib/firebase/server-init';
import { ProjectStateSchema } from '@/lib/project-state-schema';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Helper to verify user owns the project
const verifyProjectOwner = async (requesterId: string, projectId: string) => {
    // رفض المشاريع المؤقتة - يجب أن تكون محفوظة في الخادم
    if (projectId.startsWith('temp-')) {
        const notFoundError = new Error('Temporary projects are now managed in browser cache');
        notFoundError.name = 'ProjectNotFoundError';
        throw notFoundError;
    }

    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
        // إنشاء خطأ مخصص للمشروع غير الموجود
        const notFoundError = new Error('Project not found');
        notFoundError.name = 'ProjectNotFoundError';
        throw notFoundError;
    }
    const project = projectDoc.data();
    if (project?.userId !== requesterId) {
        // إنشاء خطأ مخصص للصلاحيات
        const forbiddenError = new Error('Forbidden: You do not own this project');
        forbiddenError.name = 'ProjectAccessDeniedError';
        throw forbiddenError;
    }
    return project;
};

// Schema لإضافة السياق
const addContextSchema = z.object({
    fileName: z.string(),
    content: z.string(),
    type: z.enum(['context', 'example']),
});

/**
 * معالج جلب مشروع واحد
 */
class GetProjectHandler extends SimpleApiHandler<any> {
    protected async processRequest(context: any): Promise<any> {
        const { params, user } = context;
        const { id: projectId } = await params;
        const project = await verifyProjectOwner(user.id, projectId);
        return { id: projectId, ...project } as any;
    }
}

/**
 * معالج تحديث مشروع
 */
class UpdateProjectHandler extends ComplexApiHandler<any, any> {
    protected inputSchema = ProjectStateSchema;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any): Promise<any> {
        const { params, user } = context;
        const { id: projectId } = await params;
        await verifyProjectOwner(user.id, projectId);

        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        await adminDb.collection("projects").doc(projectId).update(updateData);
        revalidatePath('/projects');

        return { id: projectId, ...updateData } as any;
    }
}

/**
 * معالج حذف مشروع
 */
class DeleteProjectHandler extends SimpleApiHandler<{ message: string }> {
    protected async processRequest(context: any): Promise<{ message: string }> {
        const { params, user } = context;
        const { id: projectId } = await params;
        await verifyProjectOwner(user.id, projectId);
        await adminDb.collection("projects").doc(projectId).delete();
        revalidatePath('/projects');
        return { message: 'Project deleted successfully' } as { message: string };
    }
}

/**
 * معالج إضافة السياق للمشروع
 */
class AddContextHandler extends ComplexApiHandler<z.infer<typeof addContextSchema>, { message: string }> {
    protected inputSchema = addContextSchema;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: z.infer<typeof addContextSchema>, context: any) {
        const { params, user } = context;
        const { id: projectId } = await params;
        await verifyProjectOwner(user.id, projectId);

        const projectRef = adminDb.collection("projects").doc(projectId);
        await projectRef.update({
            externalContext: FieldValue.arrayUnion(data),
            updatedAt: new Date().toISOString(),
        });

        return { message: 'Context added successfully' } as { message: string };
    }
}

// إنشاء المعالجات
const getProjectHandler = new GetProjectHandler();
const updateProjectHandler = new UpdateProjectHandler();
const deleteProjectHandler = new DeleteProjectHandler();
const addContextHandler = new AddContextHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    getProjectHandler.handle.bind(getProjectHandler),
    { logging: true }
);

export const PUT = withApiMiddleware(
    updateProjectHandler.handle.bind(updateProjectHandler),
    { logging: true }
);

export const DELETE = withApiMiddleware(
    deleteProjectHandler.handle.bind(deleteProjectHandler),
    { logging: true }
);

export const PATCH = withApiMiddleware(
    addContextHandler.handle.bind(addContextHandler),
    { logging: true }
);
