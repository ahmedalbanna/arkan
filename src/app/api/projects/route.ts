/**
 * API Route للمشاريع - النسخة الجديدة الموحدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد الموحد للمشاريع
 */

import { ComplexApiHandler, SimpleApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { ProjectSchemas } from '@/app/api/shared/validators/api-validators';
import { handleApiErrorEnhanced } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import type { SavedProject } from '@/lib/models/project';

/**
 * معالج قائمة المشاريع (GET)
 */
class ProjectListHandler extends SimpleApiHandler<SavedProject[]> {
    protected async processRequest(context: any): Promise<SavedProject[]> {
        const { user } = context;

        // جلب المشاريع الشخصية
        const personalProjectsQuery = adminDb.collection('projects')
            .where('userId', '==', user.id)
            .where('teamId', '==', null)
            .orderBy('updatedAt', 'desc')
            .get();

        // جلب مشاريع الفرق إذا كان المستخدم عضو في فرق
        const teamProjectsQuery = user.teams && user.teams.length > 0
            ? adminDb.collection('projects')
                .where('teamId', 'in', user.teams)
                .orderBy('updatedAt', 'desc')
                .get()
            : Promise.resolve(null);

        const [personalProjectsSnapshot, teamProjectsSnapshot] = await Promise.all([
            personalProjectsQuery,
            teamProjectsQuery,
        ]);

        const projectsMap = new Map();

        personalProjectsSnapshot.docs.forEach((doc: any) => {
            projectsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });

        teamProjectsSnapshot?.docs.forEach((doc: any) => {
            projectsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });

        const projects = Array.from(projectsMap.values())
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return projects as SavedProject[];
    }
}

/**
 * معالج إنشاء المشروع (POST)
 */
class CreateProjectHandler extends ComplexApiHandler<{
    title: string;
    description?: string;
    type: 'proposal' | 'report' | 'presentation' | 'academic';
    language: 'ar' | 'en';
    teamId?: string;
}, SavedProject> {
    protected inputSchema = ProjectSchemas.createProject;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any) {
        const { user } = context;

        const projectData = {
            ...data,
            userId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            sections: [],
            externalContext: [],
        };

        const docRef = await adminDb.collection('projects').add(projectData);

        const result = {
            id: docRef.id,
            ...projectData,
        } as SavedProject;
        return result;
    }
}

/**
 * معالج تحديث المشروع (PUT)
 */
class UpdateProjectHandler extends ComplexApiHandler<{
    title?: string;
    description?: string;
    status?: 'active' | 'inactive' | 'pending';
}, SavedProject> {
    protected inputSchema = ProjectSchemas.updateProject;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any): Promise<SavedProject> {
        const { params, user } = context;
        const projectId = params?.id;

        if (!projectId) {
            return handleApiErrorEnhanced({ message: 'Project ID is required' }, '400');
        }

        // التحقق من أن المستخدم يملك المشروع أو عضو في الفريق
        const projectDoc = await adminDb.collection('projects').doc(projectId).get();

        if (!projectDoc.exists) {
            return handleApiErrorEnhanced({ message: 'Project not found' }, '404');
        }

        const projectData = projectDoc.data();

        if (projectData?.userId !== user.id &&
            (!projectData?.teamId || !user.teams?.includes(projectData.teamId))) {
            return handleApiErrorEnhanced({ message: 'Access denied' }, '403');
        }

        const updateData = {
            ...data,
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection('projects').doc(projectId).update(updateData);

        return {
            id: projectId,
            ...projectData,
            ...updateData,
        } as SavedProject;
    }
}

/**
 * معالج حذف المشروع (DELETE)
 */
class DeleteProjectHandler extends ComplexApiHandler<{}, { message: string }> {
    protected inputSchema = ProjectSchemas.deleteProject;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any): Promise<{ message: string }> {
        const { params, user } = context;
        const projectId = params?.id;

        if (!projectId) {
            return handleApiErrorEnhanced({ message: 'Project ID is required' }, '400');
        }

        // التحقق من أن المستخدم يملك المشروع
        const projectDoc = await adminDb.collection('projects').doc(projectId).get();

        if (!projectDoc.exists) {
            return handleApiErrorEnhanced({ message: 'Project not found' }, '404');
        }

        const projectData = projectDoc.data();

        if (projectData?.userId !== user.id) {
            return handleApiErrorEnhanced({ message: 'Access denied' }, '403');
        }

        await adminDb.collection('projects').doc(projectId).delete();

        return { message: 'Project deleted successfully' } as { message: string };
    }
}

/**
 * معالج إضافة سياق للمشروع (PATCH)
 */
class AddContextHandler extends ComplexApiHandler<{
    type: 'file' | 'text' | 'url';
    content: string;
    fileName?: string;
    fileType?: 'pdf' | 'docx' | 'txt' | 'md';
    fileSize?: number;
}, { message: string }> {
    protected inputSchema = ProjectSchemas.addContext;
    protected requiresAdmin = false;
    protected creditCost = 1;
    protected async processRequest(data: any, context: any): Promise<{ message: string }> {
        const { params, user } = context;
        const projectId = params?.id;

        if (!projectId) {
            return handleApiErrorEnhanced({ message: 'Project ID is required' }, '400');
        }

        // التحقق من أن المستخدم يملك المشروع أو عضو في الفريق
        const projectDoc = await adminDb.collection('projects').doc(projectId).get();

        if (!projectDoc.exists) {
            return handleApiErrorEnhanced({ message: 'Project not found' }, '404');
        }

        const projectData = projectDoc.data();

        if (projectData?.userId !== user.id &&
            (!projectData?.teamId || !user.teams?.includes(projectData.teamId))) {
            return handleApiErrorEnhanced({ message: 'Access denied' }, '403');
        }

        const contextItem = {
            ...data,
            id: `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            addedAt: new Date().toISOString(),
            addedBy: user.id,
        };

        const currentContext = projectData?.externalContext || [];
        const updatedContext = [...currentContext, contextItem];

        await adminDb.collection('projects').doc(projectId).update({
            externalContext: updatedContext,
            updatedAt: new Date().toISOString(),
        });

        return { message: 'Context added successfully' } as { message: string };
    }
}

// إنشاء المعالجات
const projectListHandler = new ProjectListHandler();
const createProjectHandler = new CreateProjectHandler();
const updateProjectHandler = new UpdateProjectHandler();
const deleteProjectHandler = new DeleteProjectHandler();
const addContextHandler = new AddContextHandler();

// تصدير الـ handlers مع middleware
export const GET = withApiMiddleware(
    projectListHandler.handle.bind(projectListHandler),
    { logging: true }
);

export const POST = withApiMiddleware(
    createProjectHandler.handle.bind(createProjectHandler),
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
