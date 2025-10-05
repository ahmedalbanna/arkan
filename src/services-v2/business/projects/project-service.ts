/**
 * خدمة المشاريع - Services v2.0
 *
 * خدمة محسنة لإدارة المشاريع مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

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

export interface ProjectSection {
    id: string;
    name: string;
    content: string;
    type: string;
    status: 'draft' | 'in_progress' | 'completed' | 'needs_review';
    wordCount: number;
    lastModified: string;
    metadata?: Record<string, any>;
}

export interface SavedProject {
    id: string;
    title: string;
    description?: string;
    type: 'proposal' | 'report' | 'presentation' | 'academic';
    language: 'ar' | 'en';
    status: 'active' | 'inactive' | 'pending';
    teamId?: string;
    sections: ProjectSection[];
    externalContext: Array<{
        id: string;
        type: string;
        name: string;
        size: number;
        uploadedAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
    lastAccessed: string;
}

export class ProjectServiceV2 extends BaseService {
    constructor() {
        super('ProjectServiceV2');
    }

    /**
     * إنشاء مشروع جديد مع مراقبة الأداء
     */
    async createProject(data: CreateProjectData, token: string): Promise<SavedProject> {
        const operationId = this.startOperation('createProject');

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create project');
            }

            const project = await response.json();
            this.endOperation(operationId, { success: true });
            return project;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.createProject');
            throw error;
        }
    }

    /**
     * جلب قائمة المشاريع مع مراقبة شاملة
     */
    async fetchProjects(token: string): Promise<SavedProject[]> {
        const operationId = this.startOperation('fetchProjects');

        try {
            const response = await fetch('/api/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            const projects = await response.json();
            this.endOperation(operationId, { success: true, projectCount: projects.length });
            return projects;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.fetchProjects');
            throw error;
        }
    }

    /**
     * جلب مشروع محدد مع مراقبة الأداء
     */
    async fetchProject(projectId: string, token: string): Promise<SavedProject | null> {
        const operationId = this.startOperation('fetchProject');

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    this.endOperation(operationId, { success: true, result: 'not-found' });
                    return null;
                }
                throw new Error('Failed to fetch project');
            }

            const project = await response.json();
            this.endOperation(operationId, { success: true });
            return project;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.fetchProject');
            throw error;
        }
    }

    /**
     * تحديث مشروع مع مراقبة شاملة
     */
    async updateProject(projectId: string, data: UpdateProjectData, token: string): Promise<SavedProject> {
        const operationId = this.startOperation('updateProject');

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update project');
            }

            const project = await response.json();
            this.endOperation(operationId, { success: true });
            return project;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.updateProject');
            throw error;
        }
    }

    /**
     * حذف مشروع مع مراقبة الأداء
     */
    async deleteProject(projectId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteProject');

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete project');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.deleteProject');
            throw error;
        }
    }

    /**
     * إضافة سياق خارجي للمشروع مع مراقبة شاملة
     */
    async addContextToProject(projectId: string, contextData: AddContextData, token: string): Promise<{
        id: string;
        type: string;
        name: string;
        size: number;
        uploadedAt: string;
    }> {
        const operationId = this.startOperation('addContextToProject');

        try {
            const response = await fetch(`/api/projects/${projectId}/context`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(contextData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add context to project');
            }

            const context = await response.json();
            this.endOperation(operationId, { success: true });
            return context;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.addContextToProject');
            throw error;
        }
    }

    /**
     * حذف سياق خارجي من المشروع مع مراقبة الأداء
     */
    async removeContextFromProject(projectId: string, contextId: string, token: string): Promise<void> {
        const operationId = this.startOperation('removeContextFromProject');

        try {
            const response = await fetch(`/api/projects/${projectId}/context/${contextId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to remove context from project');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.removeContextFromProject');
            throw error;
        }
    }

    /**
     * إضافة قسم جديد للمشروع مع مراقبة شاملة
     */
    async addProjectSection(
        projectId: string,
        sectionData: {
            name: string;
            content: string;
            type: string;
        },
        token: string
    ): Promise<ProjectSection> {
        const operationId = this.startOperation('addProjectSection');

        try {
            const response = await fetch(`/api/projects/${projectId}/sections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(sectionData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add project section');
            }

            const section = await response.json();
            this.endOperation(operationId, { success: true });
            return section;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.addProjectSection');
            throw error;
        }
    }

    /**
     * تحديث قسم في المشروع مع مراقبة الأداء
     */
    async updateProjectSection(
        projectId: string,
        sectionId: string,
        updates: Partial<ProjectSection>,
        token: string
    ): Promise<ProjectSection> {
        const operationId = this.startOperation('updateProjectSection');

        try {
            const response = await fetch(`/api/projects/${projectId}/sections/${sectionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update project section');
            }

            const section = await response.json();
            this.endOperation(operationId, { success: true });
            return section;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.updateProjectSection');
            throw error;
        }
    }

    /**
     * حذف قسم من المشروع مع مراقبة شاملة
     */
    async deleteProjectSection(projectId: string, sectionId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteProjectSection');

        try {
            const response = await fetch(`/api/projects/${projectId}/sections/${sectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete project section');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.deleteProjectSection');
            throw error;
        }
    }

    /**
     * مشاركة مشروع مع مراقبة الأداء
     */
    async shareProject(
        projectId: string,
        shareWith: string[],
        permissions: 'view' | 'edit' | 'admin',
        token: string
    ): Promise<{
        shareId: string;
        shareUrl: string;
        expiresAt?: string;
    }> {
        const operationId = this.startOperation('shareProject');

        try {
            const response = await fetch(`/api/projects/${projectId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shareWith,
                    permissions
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to share project');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, shareWithCount: shareWith.length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.shareProject');
            throw error;
        }
    }

    /**
     * إلغاء مشاركة مشروع مع مراقبة شاملة
     */
    async unshareProject(projectId: string, shareId: string, token: string): Promise<void> {
        const operationId = this.startOperation('unshareProject');

        try {
            const response = await fetch(`/api/projects/${projectId}/share/${shareId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to unshare project');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.unshareProject');
            throw error;
        }
    }

    /**
     * جلب إحصائيات المشاريع مع مراقبة الأداء
     */
    async getProjectStats(token: string): Promise<{
        totalProjects: number;
        activeProjects: number;
        projectsByType: Record<string, number>;
        recentActivity: Array<{
            projectId: string;
            projectName: string;
            action: string;
            timestamp: string;
        }>;
        storageUsage: number;
    }> {
        const operationId = this.startOperation('getProjectStats');

        try {
            const response = await fetch('/api/projects/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch project stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.getProjectStats');
            throw error;
        }
    }

    /**
     * نسخ مشروع مع مراقبة شاملة
     */
    async duplicateProject(projectId: string, newName: string, token: string): Promise<SavedProject> {
        const operationId = this.startOperation('duplicateProject');

        try {
            const response = await fetch(`/api/projects/${projectId}/duplicate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to duplicate project');
            }

            const project = await response.json();
            this.endOperation(operationId, { success: true });
            return project;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.duplicateProject');
            throw error;
        }
    }

    /**
     * تصدير مشروع مع مراقبة الأداء
     */
    async exportProject(
        projectId: string,
        format: 'pdf' | 'docx' | 'json' | 'markdown',
        options?: {
            includeSections?: string[];
            includeContext?: boolean;
            includeMetadata?: boolean;
        },
        token?: string
    ): Promise<{
        format: string;
        data: string;
        filename: string;
        size: number;
    }> {
        const operationId = this.startOperation('exportProject');

        try {
            const response = await fetch(`/api/projects/${projectId}/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ format, options })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to export project');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, format });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.exportProject');
            throw error;
        }
    }

    /**
     * استيراد مشروع من ملف مع مراقبة شاملة
     */
    async importProject(file: File, token: string): Promise<SavedProject> {
        const operationId = this.startOperation('importProject');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/projects/import', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to import project');
            }

            const project = await response.json();
            this.endOperation(operationId, { success: true, fileSize: file.size });
            return project;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.importProject');
            throw error;
        }
    }

    /**
     * البحث في المشاريع مع مراقبة الأداء
     */
    async searchProjects(query: string, filters: {
        type?: string;
        status?: string;
        teamId?: string;
        limit?: number;
        offset?: number;
    } = {}, token: string): Promise<{
        projects: SavedProject[];
        totalCount: number;
        hasMore: boolean;
    }> {
        const operationId = this.startOperation('searchProjects');

        try {
            const queryParams = new URLSearchParams({ q: query });

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await fetch(`/api/projects/search?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to search projects');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, resultCount: result.projects?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.searchProjects');
            throw error;
        }
    }

    /**
     * جلب مشاريع مشتركة مع المستخدم مع مراقبة شاملة
     */
    async getSharedProjects(token: string): Promise<SavedProject[]> {
        const operationId = this.startOperation('getSharedProjects');

        try {
            const response = await fetch('/api/projects/shared', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch shared projects');
            }

            const projects = await response.json();
            this.endOperation(operationId, { success: true, projectCount: projects.length });
            return projects;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.getSharedProjects');
            throw error;
        }
    }

    /**
     * إضافة تعاون على مشروع مع مراقبة الأداء
     */
    async addCollaborator(
        projectId: string,
        collaborator: {
            userId: string;
            permissions: 'view' | 'edit' | 'admin';
        },
        token: string
    ): Promise<{
        collaboratorId: string;
        userId: string;
        permissions: string;
        addedAt: string;
    }> {
        const operationId = this.startOperation('addCollaborator');

        try {
            const response = await fetch(`/api/projects/${projectId}/collaborators`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(collaborator)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add collaborator');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.addCollaborator');
            throw error;
        }
    }

    /**
     * إزالة تعاون من مشروع مع مراقبة شاملة
     */
    async removeCollaborator(projectId: string, collaboratorId: string, token: string): Promise<void> {
        const operationId = this.startOperation('removeCollaborator');

        try {
            const response = await fetch(`/api/projects/${projectId}/collaborators/${collaboratorId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to remove collaborator');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.removeCollaborator');
            throw error;
        }
    }

    /**
     * جلب تعاوني المشروع مع مراقبة الأداء
     */
    async getProjectCollaborators(projectId: string, token: string): Promise<Array<{
        id: string;
        userId: string;
        userName: string;
        userEmail: string;
        permissions: 'view' | 'edit' | 'admin';
        joinedAt: string;
    }>> {
        const operationId = this.startOperation('getProjectCollaborators');

        try {
            const response = await fetch(`/api/projects/${projectId}/collaborators`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch project collaborators');
            }

            const collaborators = await response.json();
            this.endOperation(operationId, { success: true, collaboratorCount: collaborators.length });
            return collaborators;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectServiceV2.getProjectCollaborators');
            throw error;
        }
    }
}