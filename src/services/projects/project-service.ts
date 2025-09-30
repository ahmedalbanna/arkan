/**
 * خدمة المشاريع
 *
 * هذا الملف يحتوي على جميع وظائف إدارة المشاريع
 */

import { ProjectSchemas } from '@/app/api/shared/validators/api-validators';
import type { SavedProject } from '@/lib/models/project';
import { apiClient } from '../shared/api-client';
import { ComplexService, SimpleService } from '../shared/base-service';

export interface CreateProjectData {
    title: string;
    description?: string;
    type: 'proposal' | 'report' | 'presentation' | 'academic';
    language: 'ar' | 'en';
    teamId?: string;
}

export interface UpdateProjectData {
    title?: string;
    description?: string;
    status?: 'active' | 'inactive' | 'pending';
}

export interface AddContextData {
    type: 'file' | 'text' | 'url';
    content: string;
    fileName?: string;
    fileType?: 'pdf' | 'docx' | 'txt' | 'md';
    fileSize?: number;
}

/**
 * خدمة قائمة المشاريع
 */
export class ProjectListService extends SimpleService<SavedProject[]> {
    protected endpoint = '/api/projects';
    protected requiresAuth = true;

    async call(token: string): Promise<SavedProject[]> {
        return apiClient.get(this.endpoint, { token });
    }
}

/**
 * خدمة الحصول على مشروع
 */
export class GetProjectService extends SimpleService<SavedProject> {
    protected endpoint = '/api/projects';
    protected requiresAuth = true;

    async call(token: string, projectId: string): Promise<SavedProject> {
        const endpoint = `${this.endpoint}/${projectId}`;
        return apiClient.get(endpoint, { token });
    }
}

/**
 * خدمة إنشاء مشروع
 */
export class CreateProjectService extends ComplexService<CreateProjectData, SavedProject> {
    protected endpoint = '/api/projects';
    protected method: 'POST' = 'POST';
    protected inputSchema = ProjectSchemas.createProject;
    protected requiresAuth = true;
}

/**
 * خدمة تحديث المشروع
 */
export class UpdateProjectService extends ComplexService<UpdateProjectData, SavedProject> {
    protected endpoint = '/api/projects';
    protected method: 'PUT' = 'PUT';
    protected inputSchema = ProjectSchemas.updateProject;
    protected requiresAuth = true;

    async call(data: UpdateProjectData, token: string, projectId: string): Promise<SavedProject> {
        const endpoint = `${this.endpoint}/${projectId}`;
        return apiClient.put(endpoint, data, { token });
    }
}

/**
 * خدمة حذف المشروع
 */
export class DeleteProjectService extends ComplexService<{}, { message: string }> {
    protected endpoint = '/api/projects';
    protected method: 'DELETE' = 'DELETE';
    protected inputSchema = undefined;
    protected requiresAuth = true;

    async call(data: {}, token: string, projectId: string): Promise<{ message: string }> {
        const endpoint = `${this.endpoint}/${projectId}`;
        return apiClient.delete(endpoint, { token });
    }
}

/**
 * خدمة إضافة سياق للمشروع
 */
export class AddContextService extends ComplexService<AddContextData, { message: string }> {
    protected endpoint = '/api/projects';
    protected method: 'PATCH' = 'PATCH';
    protected inputSchema = ProjectSchemas.addContext;
    protected requiresAuth = true;

    async call(data: AddContextData, token: string, projectId: string): Promise<{ message: string }> {
        const endpoint = `${this.endpoint}/${projectId}`;
        return apiClient.patch(endpoint, data, { token });
    }
}

/**
 * دوال مساعدة للمشاريع
 */
export const projectService = {
    list: new ProjectListService(),
    get: new GetProjectService(),
    create: new CreateProjectService(),
    update: new UpdateProjectService(),
    delete: new DeleteProjectService(),
    addContext: new AddContextService(),
};

/**
 * دالة الحصول على قائمة المشاريع
 */
export async function fetchProjects(token: string): Promise<SavedProject[]> {
    return projectService.list.call(token);
}

/**
 * دالة الحصول على مشروع
 */
export async function fetchProject(projectId: string, token: string): Promise<SavedProject> {
    return projectService.get.call(token, projectId);
}

/**
 * دالة إنشاء مشروع
 */
export async function createProject(data: CreateProjectData, token: string): Promise<SavedProject> {
    return projectService.create.call(data, token);
}

/**
 * دالة تحديث المشروع
 */
export async function updateProject(
    projectId: string,
    data: UpdateProjectData,
    token: string
): Promise<SavedProject> {
    return projectService.update.call(data, token, projectId);
}

/**
 * دالة حذف المشروع
 */
export async function deleteProject(projectId: string, token: string): Promise<{ message: string }> {
    return projectService.delete.call({}, token, projectId);
}

/**
 * دالة إضافة سياق للمشروع
 */
export async function addContextToProjectApi(
    projectId: string,
    contextFile: AddContextData,
    token: string
): Promise<{ message: string }> {
    return projectService.addContext.call(contextFile, token, projectId);
}
