/**
 * API Route لإدارة المشاريع الفردية - النسخة المبسطة
 *
 * يستخدم النظام الجديد المبسط للـ API
 */

import { ApiResponse, createApiHandler } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { ProjectStateSchema } from '@/lib/project-state-schema';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Helper to verify user owns the project
const verifyProjectOwner = async (requesterId: string, projectId: string) => {
    // رفض المشاريع المؤقتة - يجب أن تكون محفوظة في الخادم
    if (projectId.startsWith('temp-')) {
        throw new Error('Temporary projects are now managed in browser cache');
    }

    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
        throw new Error('Project not found');
    }
    const project = projectDoc.data();
    if (project?.userId !== requesterId) {
        throw new Error('Forbidden: You do not own this project');
    }
    return project;
};

// Schema لإضافة السياق
const addContextSchema = z.object({
    fileName: z.string(),
    content: z.string(),
    type: z.enum(['context', 'example']),
});

export const GET = createApiHandler(async (context) => {
    try {
        const { params, user } = context;
        const { id: projectId } = await params;
        const project = await verifyProjectOwner(user.id, projectId);
        return ApiResponse.success({ id: projectId, ...project });
    } catch (error) {
        console.error('Error fetching project:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return ApiResponse.notFound('Project not found');
        }
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return ApiResponse.forbidden('Access denied');
        }
        return ApiResponse.error('Failed to fetch project', 500);
    }
}, { requireAuth: true });

export const PUT = createApiHandler(async (context) => {
    try {
        const { params, user, request } = context;
        const { id: projectId } = await params;
        const data = await request.json();
        
        await verifyProjectOwner(user.id, projectId);

        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        await adminDb.collection("projects").doc(projectId).update(updateData);
        revalidatePath('/projects');

        return ApiResponse.success({ id: projectId, ...updateData });
    } catch (error) {
        console.error('Error updating project:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return ApiResponse.notFound('Project not found');
        }
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return ApiResponse.forbidden('Access denied');
        }
        return ApiResponse.error('Failed to update project', 500);
    }
}, { validateBody: ProjectStateSchema, requireAuth: true });

export const DELETE = createApiHandler(async (context) => {
    try {
        const { params, user } = context;
        const { id: projectId } = await params;
        
        await verifyProjectOwner(user.id, projectId);
        await adminDb.collection("projects").doc(projectId).delete();
        revalidatePath('/projects');
        
        return ApiResponse.success({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return ApiResponse.notFound('Project not found');
        }
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return ApiResponse.forbidden('Access denied');
        }
        return ApiResponse.error('Failed to delete project', 500);
    }
}, { requireAuth: true });

export const PATCH = createApiHandler(async (context) => {
    try {
        const { params, user, request } = context;
        const { id: projectId } = await params;
        const data = await request.json();
        
        await verifyProjectOwner(user.id, projectId);

        const projectRef = adminDb.collection("projects").doc(projectId);
        await projectRef.update({
            externalContext: FieldValue.arrayUnion(data),
            updatedAt: new Date().toISOString(),
        });

        return ApiResponse.success({ message: 'Context added successfully' });
    } catch (error) {
        console.error('Error adding context:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return ApiResponse.notFound('Project not found');
        }
        if (error instanceof Error && error.message.includes('Forbidden')) {
            return ApiResponse.forbidden('Access denied');
        }
        return ApiResponse.error('Failed to add context', 500);
    }
}, { validateBody: addContextSchema, requireAuth: true });
