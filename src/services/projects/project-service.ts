/**
 * خدمة المشاريع
 *
 * هذا الملف يحتوي على جميع وظائف إدارة المشاريع
 */

import { apiClient } from '@/core/api/client/api-client';
import { ComplexService, SimpleService } from '@/core/api/client/base-client';
import { ProjectSchemas } from '@/core/validation/api-validators';
import type { ProjectState, SavedProject } from '@/lib/models/project';

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
        const response = await this.client.get<SavedProject[]>(this.endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
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
        const response = await this.client.get<SavedProject>(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
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
export class UpdateProjectService extends ComplexService<ProjectState, SavedProject> {
    protected endpoint = '/api/projects';
    protected method: 'PUT' = 'PUT';
    protected inputSchema = undefined; // سيتم التحقق من الصحة في API route
    protected requiresAuth = true;

    async call(data: ProjectState, token: string, projectId: string): Promise<SavedProject> {
        const endpoint = `${this.endpoint}/${projectId}`;
        const response = await this.client.put<SavedProject>(endpoint, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
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
        const response = await this.client.delete<{ message: string }>(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
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
        const response = await this.client.patch<{ message: string }>(endpoint, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    }
}

/**
 * دوال مساعدة للمشاريع
 */
export const projectService = {
    get list() { return new ProjectListService(apiClient); },
    get get() { return new GetProjectService(apiClient); },
    get create() { return new CreateProjectService(apiClient); },
    get update() { return new UpdateProjectService(apiClient); },
    get delete() { return new DeleteProjectService(apiClient); },
    get addContext() { return new AddContextService(apiClient); },
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
    data: ProjectState,
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
