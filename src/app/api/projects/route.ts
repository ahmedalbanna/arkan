/**
 * API Route للمشاريع - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { ProjectSchemas } from '@/core/validation/api-validators';
import { adminDb } from '@/lib/firebase/server-init';
import type { SavedProject } from '@/lib/models/project';

export const GET = createApiHandler(async (context) => {
    try {
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

        return ApiResponse.success(projects as SavedProject[]);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return ApiResponse.error('Failed to fetch projects', 500);
    }
}, { requireAuth: true });

export const POST = createApiHandler(async (context) => {
    try {
        const { user, request } = context;
        const data = await request.json();

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

        return ApiResponse.created(result);
    } catch (error) {
        console.error('Error creating project:', error);
        return ApiResponse.error('Failed to create project', 500);
    }
}, { validateBody: ProjectSchemas.createProject, requireAuth: true });

export const PUT = createApiHandler(async (context) => {
    try {
        const { params, user, request } = context;
        const projectId = params?.id;
        const data = await request.json();

        if (!projectId) {
            return ApiResponse.badRequest('Project ID is required');
        }

        // التحقق من أن المستخدم يملك المشروع أو عضو في الفريق
        const projectDoc = await adminDb.collection('projects').doc(projectId).get();

        if (!projectDoc.exists) {
            return ApiResponse.notFound('Project not found');
        }

        const projectData = projectDoc.data();

        if (projectData?.userId !== user.id &&
            (!projectData?.teamId || !user.teams?.includes(projectData.teamId))) {
            return ApiResponse.forbidden('Access denied');
        }

        const updateData = {
            ...data,
            updatedAt: new Date().toISOString(),
        };

        await adminDb.collection('projects').doc(projectId).update(updateData);

        const result = {
            id: projectId,
            ...projectData,
            ...updateData,
        } as SavedProject;

        return ApiResponse.success(result);
    } catch (error) {
        console.error('Error updating project:', error);
        return ApiResponse.error('Failed to update project', 500);
    }
}, { validateBody: ProjectSchemas.updateProject, requireAuth: true });

export const DELETE = createApiHandler(async (context) => {
    try {
        const { params, user } = context;
        const projectId = params?.id;

        if (!projectId) {
            return ApiResponse.badRequest('Project ID is required');
        }

        // التحقق من أن المستخدم يملك المشروع
        const projectDoc = await adminDb.collection('projects').doc(projectId).get();

        if (!projectDoc.exists) {
            return ApiResponse.notFound('Project not found');
        }

        const projectData = projectDoc.data();

        if (projectData?.userId !== user.id) {
            return ApiResponse.forbidden('Access denied');
        }

        await adminDb.collection('projects').doc(projectId).delete();

        return ApiResponse.success({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        return ApiResponse.error('Failed to delete project', 500);
    }
}, { requireAuth: true });

export const PATCH = createApiHandler(async (context) => {
    try {
        const { params, user, request } = context;
        const projectId = params?.id;
        const data = await request.json();

        if (!projectId) {
            return ApiResponse.badRequest('Project ID is required');
        }

        // التحقق من أن المستخدم يملك المشروع أو عضو في الفريق
        const projectDoc = await adminDb.collection('projects').doc(projectId).get();

        if (!projectDoc.exists) {
            return ApiResponse.notFound('Project not found');
        }

        const projectData = projectDoc.data();

        if (projectData?.userId !== user.id &&
            (!projectData?.teamId || !user.teams?.includes(projectData.teamId))) {
            return ApiResponse.forbidden('Access denied');
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

        return ApiResponse.success({ message: 'Context added successfully' });
    } catch (error) {
        console.error('Error adding context:', error);
        return ApiResponse.error('Failed to add context', 500);
    }
}, { validateBody: ProjectSchemas.addContext, requireAuth: true });
