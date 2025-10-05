/**
 * خدمة التعاون والتشارك - Services v2.0
 *
 * خدمة محسنة للتعاون والتشارك للمهام والملفات الفريق مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface Comment {
    id: string;
    sectionId: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        role?: 'admin' | 'editor' | 'reviewer' | 'viewer';
    };
    timestamp: Date;
    parentCommentId?: string;
    replies: Comment[];
    status: 'pending' | 'resolved' | 'archived';
    reactions: CommentReaction[];
    mentions: string[];
}

export interface CommentReaction {
    userId: string;
    userName: string;
    emoji: string;
    timestamp: Date;
}

export interface ApprovalWorkflow {
    id: string;
    reportId: string;
    sectionId?: string;
    approvers: Array<{
        userId: string;
        userName: string;
        role: 'primary' | 'secondary';
        status: 'pending' | 'approved' | 'rejected';
        comment?: string;
        timestamp?: Date;
    }>;
    workflowStatus: 'pending' | 'in_progress' | 'approved' | 'rejected';
    requiredApprovals: number;
    completedApprovals: number;
    createdBy: string;
    createdAt: Date;
}

export interface SharedFile {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    uploadedBy: string;
    uploadedAt: Date;
    accessLevel: 'view' | 'edit' | 'admin';
    collaborators: string[];
}

export interface TaskAssignment {
    id: string;
    title: string;
    description: string;
    assigneeId: string;
    assigneeName: string;
    assignerId: string;
    assignerName: string;
    dueDate: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in_progress' | 'review' | 'completed';
    reportId?: string;
    sectionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class CollaborationServiceV2 extends BaseService {
    constructor() {
        super('CollaborationServiceV2');
    }

    /**
     * إضافة تعليق على قسم مع مراقبة الأداء
     */
    async addComment(sectionId: string, content: string, token: string, parentCommentId?: string): Promise<Comment> {
        const operationId = this.startOperation('addComment');

        try {
            const response = await fetch('/api/collaboration/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sectionId,
                    content,
                    parentCommentId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add comment');
            }

            const comment = await response.json();
            this.endOperation(operationId, { success: true });
            return comment;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.addComment');
            throw error;
        }
    }

    /**
     * جلب تعليقات قسم مع مراقبة شاملة
     */
    async getComments(sectionId: string, token: string): Promise<Comment[]> {
        const operationId = this.startOperation('getComments');

        try {
            const response = await fetch(`/api/collaboration/comments/${sectionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.comments?.length || 0 });
            return result.comments || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.getComments');
            throw error;
        }
    }

    /**
     * تحديث تعليق مع مراقبة الأداء
     */
    async updateComment(commentId: string, content: string, token: string): Promise<Comment> {
        const operationId = this.startOperation('updateComment');

        try {
            const response = await fetch(`/api/collaboration/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update comment');
            }

            const comment = await response.json();
            this.endOperation(operationId, { success: true });
            return comment;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.updateComment');
            throw error;
        }
    }

    /**
     * حذف تعليق مع مراقبة شاملة
     */
    async deleteComment(commentId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteComment');

        try {
            const response = await fetch(`/api/collaboration/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete comment');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.deleteComment');
            throw error;
        }
    }

    /**
     * إضافة تفاعل على تعليق مع مراقبة الأداء
     */
    async addCommentReaction(commentId: string, emoji: string, token: string): Promise<CommentReaction> {
        const operationId = this.startOperation('addCommentReaction');

        try {
            const response = await fetch(`/api/collaboration/comments/${commentId}/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ emoji })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add reaction');
            }

            const reaction = await response.json();
            this.endOperation(operationId, { success: true });
            return reaction;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.addCommentReaction');
            throw error;
        }
    }

    /**
     * بدء سير موافقة مع مراقبة شاملة
     */
    async startApprovalWorkflow(workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt'>, token: string): Promise<ApprovalWorkflow> {
        const operationId = this.startOperation('startApprovalWorkflow');

        try {
            const response = await fetch('/api/collaboration/approval-workflows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(workflow)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to start approval workflow');
            }

            const approvalWorkflow = await response.json();
            this.endOperation(operationId, { success: true });
            return approvalWorkflow;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.startApprovalWorkflow');
            throw error;
        }
    }

    /**
     * جلب سير الموافقات مع مراقبة الأداء
     */
    async getApprovalWorkflows(reportId: string, token: string): Promise<ApprovalWorkflow[]> {
        const operationId = this.startOperation('getApprovalWorkflows');

        try {
            const response = await fetch(`/api/collaboration/approval-workflows/${reportId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch approval workflows');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.workflows?.length || 0 });
            return result.workflows || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.getApprovalWorkflows');
            throw error;
        }
    }

    /**
     * تحديث حالة موافقة مع مراقبة شاملة
     */
    async updateApprovalStatus(workflowId: string, approverId: string, status: 'approved' | 'rejected', comment?: string, token?: string): Promise<ApprovalWorkflow> {
        const operationId = this.startOperation('updateApprovalStatus');

        try {
            const response = await fetch(`/api/collaboration/approval-workflows/${workflowId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    approverId,
                    status,
                    comment
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update approval status');
            }

            const workflow = await response.json();
            this.endOperation(operationId, { success: true });
            return workflow;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.updateApprovalStatus');
            throw error;
        }
    }

    /**
     * مشاركة ملف مع مراقبة الأداء
     */
    async shareFile(file: Omit<SharedFile, 'id' | 'uploadedAt'>, token: string): Promise<SharedFile> {
        const operationId = this.startOperation('shareFile');

        try {
            const response = await fetch('/api/collaboration/files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(file)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to share file');
            }

            const sharedFile = await response.json();
            this.endOperation(operationId, { success: true });
            return sharedFile;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.shareFile');
            throw error;
        }
    }

    /**
     * جلب الملفات المشتركة مع مراقبة شاملة
     */
    async getSharedFiles(token: string): Promise<SharedFile[]> {
        const operationId = this.startOperation('getSharedFiles');

        try {
            const response = await fetch('/api/collaboration/files', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch shared files');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.files?.length || 0 });
            return result.files || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.getSharedFiles');
            throw error;
        }
    }

    /**
     * إنشاء مهمة تعاونية مع مراقبة الأداء
     */
    async createTask(task: Omit<TaskAssignment, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<TaskAssignment> {
        const operationId = this.startOperation('createTask');

        try {
            const response = await fetch('/api/collaboration/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(task)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create task');
            }

            const createdTask = await response.json();
            this.endOperation(operationId, { success: true });
            return createdTask;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.createTask');
            throw error;
        }
    }

    /**
     * جلب مهام المستخدم مع مراقبة شاملة
     */
    async getUserTasks(token: string, status?: TaskAssignment['status']): Promise<TaskAssignment[]> {
        const operationId = this.startOperation('getUserTasks');

        try {
            const queryParams = status ? `?status=${status}` : '';
            const response = await fetch(`/api/collaboration/tasks${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user tasks');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.tasks?.length || 0 });
            return result.tasks || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.getUserTasks');
            throw error;
        }
    }

    /**
     * تحديث حالة مهمة مع مراقبة الأداء
     */
    async updateTaskStatus(taskId: string, status: TaskAssignment['status'], token: string): Promise<TaskAssignment> {
        const operationId = this.startOperation('updateTaskStatus');

        try {
            const response = await fetch(`/api/collaboration/tasks/${taskId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update task status');
            }

            const task = await response.json();
            this.endOperation(operationId, { success: true });
            return task;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'CollaborationServiceV2.updateTaskStatus');
            throw error;
        }
    }
}