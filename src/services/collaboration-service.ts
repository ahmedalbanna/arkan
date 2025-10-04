/**
 * خدمة التعاون والتشارك للمهام والملفات الفريق
 */

'use client';


// أنواع التعليقات والتفاعل
interface Comment {
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
    parentCommentId?: string; // للردود المتداخلة
    replies: Comment[];
    status: 'pending' | 'resolved' | 'archived';
    reactions: CommentReaction[];
    mentions: string[]; // ذكر المستخدمين الآخرين
}

interface CommentReaction {
    userId: string;
    userName: string;
    emoji: string;
    timestamp: Date;
}

interface ApprovalWorkflow {
    id: string;
    reportId: string;
    sectionId?: string; // إذا كان لموافقة قسم
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
    dueDate?: Date;
    priority: 'low' | 'medium' | 'high';
}

interface TeamShare {
    id: string;
    reportId: string;
    sharedWith: Array<{
        userId: string;
        userName: string;
        permission: 'view' | 'comment' | 'edit' | 'approve';
        invitedAt: Date;
        joinedAt?: Date;
        status: 'invited' | 'active' | 'declined';
    }>;
    permissions: {
        allowComments: boolean;
        allowSuggestions: boolean;
        allowDirectEdit: boolean;
        requireApproval: boolean;
        notifyChanges: boolean;
    };
    settings: {
        publicLink?: string;
        linkExpiration?: Date;
        passwordProtected?: boolean;
    };
    activityLog: ActivityLog[];
}

interface ActivityLog {
    id: string;
    reportId: string;
    userId: string;
    userName: string;
    action: 'view' | 'comment' | 'edit' | 'approve' | 'reject' | 'share' | 'download';
    description: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

interface CollaborationSession {
    id: string;
    reportId: string;
    participants: Array<{
        userId: string;
        userName: string;
        joinTime: Date;
        lastActivity: Date;
        isActive: boolean;
        currentSection?: string;
    }>;
    chatMessages: ChatMessage[];
    liveUpdates: LiveUpdate[];
}

interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
    type: 'text' | 'file' | 'system';
    metadata?: any;
}

interface LiveUpdate {
    id: string;
    type: 'cursor_position' | 'selection' | 'edit_suggestion' | 'comment_highlight';
    userId: string;
    userName: string;
    sectionId: string;
    position?: { line: number; column: number };
    data: any;
    timestamp: Date;
}

export class CollaborationService {

    private static sessions = new Map<string, CollaborationSession>();
    private static comments = new Map<string, Comment[]>();
    private static workflows = new Map<string, ApprovalWorkflow[]>();
    private static teamShares = new Map<string, TeamShare>();
    private static activityLogs = new Map<string, ActivityLog[]>();

    /**
     * إضافة تعليق جديد على قسم معين
     */
    static addComment(
        reportId: string,
        sectionId: string,
        commentData: {
            content: string;
            author: Comment['author'];
            parentCommentId?: string;
            mentions?: string[];
        }
    ): Comment {
        const comment: Comment = {
            id: this.generateId('comment'),
            sectionId,
            content: commentData.content,
            author: commentData.author,
            timestamp: new Date(),
            parentCommentId: commentData.parentCommentId,
            replies: [],
            status: 'pending',
            reactions: [],
            mentions: commentData.mentions || []
        };

        // إضافة التعليق إلى قاعدة البيانات الافتراضية
        const reportComments = this.comments.get(reportId) || [];
        reportComments.push(comment);
        this.comments.set(reportId, reportComments);

        // تسجيل النشاط
        this.logActivity(reportId, commentData.author.id, commentData.author.name, 'comment',
            `أضاف تعليق جديد على القسم ${sectionId}`, { commentId: comment.id });

        // إشعار المستخدمين المذكورين
        if (commentData.mentions && commentData.mentions.length > 0) {
            this.notifyMentions(reportId, commentData.mentions, comment);
        }

        console.log(`💬 تم إضافة تعليق جديد من ${commentData.author.name} على القسم ${sectionId}`);
        return comment;
    }

    /**
     * الرد على تعليق موجود
     */
    static replyToComment(
        reportId: string,
        commentId: string,
        replyData: {
            content: string;
            author: Comment['author'];
            mentions?: string[];
        }
    ): Comment | null {
        const reportComments = this.comments.get(reportId) || [];
        const parentComment = this.findCommentById(reportComments, commentId);

        if (!parentComment) {
            console.warn('Parent comment not found:', commentId);
            return null;
        }

        const reply: Comment = {
            id: this.generateId('reply'),
            sectionId: parentComment.sectionId,
            content: replyData.content,
            author: replyData.author,
            timestamp: new Date(),
            parentCommentId: commentId,
            replies: [],
            status: 'pending',
            reactions: [],
            mentions: replyData.mentions || []
        };

        // إضافة الرد إلى التعليق الأصلي
        parentComment.replies.push(reply);

        // تسجيل النشاط
        this.logActivity(reportId, replyData.author.id, replyData.author.name, 'comment',
            `رد على تعليق في القسم ${parentComment.sectionId}`, { commentId, replyId: reply.id });

        console.log(`💭 تم إضافة رد من ${replyData.author.name} على التعليق ${commentId}`);
        return reply;
    }

    /**
     * إنشاء مسار موافقة لمراجعة المحتوى
     */
    static createApprovalWorkflow(
        reportId: string,
        workflowData: {
            sectionId?: string;
            approvers: Array<{ userId: string; userName: string; role: 'primary' | 'secondary' }>;
            dueDate?: Date;
            priority: 'low' | 'medium' | 'high';
            createdBy: string;
        }
    ): ApprovalWorkflow {
        const workflow: ApprovalWorkflow = {
            id: this.generateId('workflow'),
            reportId,
            sectionId: workflowData.sectionId,
            approvers: workflowData.approvers.map(a => ({
                ...a,
                status: 'pending' as const
            })),
            workflowStatus: 'pending',
            requiredApprovals: workflowData.approvers.filter(a => a.role === 'primary').length,
            completedApprovals: 0,
            createdBy: workflowData.createdBy,
            createdAt: new Date(),
            dueDate: workflowData.dueDate,
            priority: workflowData.priority
        };

        // إضافة مسار الموافقة
        const reportWorkflows = this.workflows.get(reportId) || [];
        reportWorkflows.push(workflow);
        this.workflows.set(reportId, reportWorkflows);

        // تسجيل النشاط
        this.logActivity(reportId, workflowData.createdBy, '', 'share',
            `أنشأ مسار موافقة جديد للقسم ${workflowData.sectionId || 'التقرير الكامل'}`,
            { workflowId: workflow.id });

        console.log(`📋 تم إنشاء مسار موافقة جديد للمراجعة`);
        return workflow;
    }

    /**
     * تحديث حالة الموافقة
     */
    static updateApprovalStatus(
        reportId: string,
        workflowId: string,
        approvalData: {
            userId: string;
            status: 'approved' | 'rejected';
            comment?: string;
            approverName: string;
        }
    ): boolean {
        const reportWorkflows = this.workflows.get(reportId) || [];
        const workflow = reportWorkflows.find(w => w.id === workflowId);

        if (!workflow) {
            console.warn('Workflow not found:', workflowId);
            return false;
        }

        // العثور على المُعِتمد وتحديث حالته
        const approver = workflow.approvers.find(a => a.userId === approvalData.userId);
        if (!approver) {
            console.warn('Approver not found in workflow');
            return false;
        }

        approver.status = approvalData.status;
        approver.comment = approvalData.comment;
        approver.timestamp = new Date();

        // تحديث حالات الموافقة الإجمالية
        workflow.completedApprovals = workflow.approvers.filter(a =>
            a.status === 'approved' || a.status === 'rejected'
        ).length;

        // تحديد حالة المسار العام
        if (approvalData.status === 'rejected') {
            workflow.workflowStatus = 'rejected';
        } else if (workflow.completedApprovals >= workflow.requiredApprovals) {
            workflow.workflowStatus = 'approved';
        }

        // تسجيل النشاط
        this.logActivity(reportId, approvalData.userId, approvalData.approverName,
            approvalData.status === 'approved' ? 'approve' : 'reject',
            `${approvalData.status === 'approved' ? 'وافق' : 'رفض'} على محتوى القسم ${workflow.sectionId || 'التقرير'}`,
            { workflowId, comment: approvalData.comment });

        console.log(`✅ تم تحديث حالة الموافقة: ${approvalData.status}`);
        return true;
    }

    /**
     * مشاركة التقرير مع فريق العمل
     */
    static shareWithTeam(
        reportId: string,
        shareData: {
            sharedWith: Array<{ userId: string; userName: string; permission: 'view' | 'comment' | 'edit' | 'approve' }>;
            permissions: TeamShare['permissions'];
            settings?: TeamShare['settings'];
            sharedBy: string;
        }
    ): TeamShare {
        const teamShare: TeamShare = {
            id: this.generateId('share'),
            reportId,
            sharedWith: shareData.sharedWith.map(user => ({
                ...user,
                invitedAt: new Date(),
                status: 'invited' as const
            })),
            permissions: shareData.permissions,
            settings: shareData.settings || {},
            activityLog: []
        };

        // إضافة مشاركة الفريق
        this.teamShares.set(reportId, teamShare);

        // تسجيل النشاط
        this.logActivity(reportId, shareData.sharedBy, '', 'share',
            `شارك التقرير مع ${shareData.sharedWith.length} عضو في الفريق`,
            { shareId: teamShare.id });

        console.log(`👥 تم مشاركة التقرير مع فريق العمل`);
        return teamShare;
    }

    /**
     * الانضمام إلى جلسة تعاون نشطة
     */
    static joinCollaborationSession(
        reportId: string,
        userData: {
            userId: string;
            userName: string;
        }
    ): CollaborationSession {
        let session = this.sessions.get(reportId);

        if (!session) {
            // إنشاء جلسة تعاون جديدة
            session = {
                id: this.generateId('session'),
                reportId,
                participants: [],
                chatMessages: [],
                liveUpdates: []
            };
            this.sessions.set(reportId, session);
        }

        // إضافة المشارك الجديد
        const existingParticipant = session.participants.find(p => p.userId === userData.userId);

        if (existingParticipant) {
            // تحديث وقت آخر نشاط إذا كان موجوداً
            existingParticipant.lastActivity = new Date();
            existingParticipant.isActive = true;
        } else {
            // إضافة مشارك جديد
            session.participants.push({
                ...userData,
                joinTime: new Date(),
                lastActivity: new Date(),
                isActive: true
            });
        }

        // إضافة رسالة نظام
        const systemMessage: ChatMessage = {
            id: this.generateId('message'),
            userId: 'system',
            userName: 'النظام',
            content: `${userData.userName} انضم إلى جلسة التعاون`,
            timestamp: new Date(),
            type: 'system'
        };
        session.chatMessages.push(systemMessage);

        console.log(`🚀 انضم ${userData.userName} إلى جلسة التعاون`);
        return session;
    }

    /**
     * إضافة رسالة في دردشة التعاون
     */
    static addChatMessage(
        reportId: string,
        messageData: {
            userId: string;
            userName: string;
            content: string;
            type?: 'text' | 'file' | 'system';
        }
    ): ChatMessage | null {
        const session = this.sessions.get(reportId);

        if (!session) {
            console.warn('No active collaboration session found');
            return null;
        }

        const message: ChatMessage = {
            id: this.generateId('message'),
            userId: messageData.userId,
            userName: messageData.userName,
            content: messageData.content,
            timestamp: new Date(),
            type: messageData.type || 'text'
        };

        session.chatMessages.push(message);

        // تحديث آخر نشاط للمستخدم
        const participant = session.participants.find(p => p.userId === messageData.userId);
        if (participant) {
            participant.lastActivity = new Date();
        }

        console.log(`💬 رسالة جديدة من ${messageData.userName}: ${messageData.content}`);
        return message;
    }

    /**
     * تحديث الموقع المباشر للمستخدم
     */
    static updateLivePosition(
        reportId: string,
        updateData: {
            userId: string;
            userName: string;
            type: LiveUpdate['type'];
            sectionId: string;
            position?: { line: number; column: number };
            data: any;
        }
    ): LiveUpdate | null {
        const session = this.sessions.get(reportId);

        if (!session) {
            return null;
        }

        const liveUpdate: LiveUpdate = {
            id: this.generateId('update'),
            type: updateData.type,
            userId: updateData.userId,
            userName: updateData.userName,
            sectionId: updateData.sectionId,
            position: updateData.position,
            data: updateData.data,
            timestamp: new Date()
        };

        session.liveUpdates.push(liveUpdate);

        // الاحتفاظ بـ 100 تحديث حديث فقط
        if (session.liveUpdates.length > 100) {
            session.liveUpdates = session.liveUpdates.slice(-100);
        }

        return liveUpdate;
    }

    /**
     * الحصول على جميع التعليقات للتقرير
     */
    static getComments(reportId: string, sectionId?: string): Comment[] {
        const reportComments = this.comments.get(reportId) || [];

        if (sectionId) {
            return reportComments.filter(c => c.sectionId === sectionId);
        }

        return reportComments;
    }

    /**
     * الحصول على مسارات الموافقة النشطه
     */
    static getActiveApprovalWorkflows(reportId: string): ApprovalWorkflow[] {
        const workflows = this.workflows.get(reportId) || [];
        return workflows.filter(w => w.workflowStatus === 'pending' || w.workflowStatus === 'in_progress');
    }

    /**
     * الحصول على معلومات المشاركة مع الفريق
     */
    static getTeamShare(reportId: string): TeamShare | null {
        return this.teamShares.get(reportId) || null;
    }

    /**
     * الحصول على سجل الأنشطة
     */
    static getActivityLog(reportId: string, limit: number = 50): ActivityLog[] {
        const logs = this.activityLogs.get(reportId) || [];
        return logs.slice(-limit).reverse(); // أحدث الأنشطة أولاً
    }

    // === طرق المساعدة الداخلية ===

    private static generateId(prefix: string): string {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private static findCommentById(comments: Comment[], commentId: string): Comment | null {
        for (const comment of comments) {
            if (comment.id === commentId) {
                return comment;
            }
            const found = this.findCommentById(comment.replies, commentId);
            if (found) return found;
        }
        return null;
    }

    private static logActivity(
        reportId: string,
        userId: string,
        userName: string,
        action: ActivityLog['action'],
        description: string,
        metadata?: Record<string, any>
    ): void {
        const log: ActivityLog = {
            id: this.generateId('log'),
            reportId,
            userId,
            userName,
            action,
            description,
            timestamp: new Date(),
            metadata
        };

        const logs = this.activityLogs.get(reportId) || [];
        logs.push(log);
        this.activityLogs.set(reportId, logs);

        // الاحتفاظ بـ آخر 500 سجل نشاط
        if (logs.length > 500) {
            const recentLogs = logs.slice(-500);
            this.activityLogs.set(reportId, recentLogs);
        }
    }

    private static notifyMentions(reportId: string, mentionedUserIds: string[], comment: Comment): void {
        console.log(`🔔 إشعار المستخدمين المذكورين: ${mentionedUserIds.join(', ')}`);
        // هنا يمكن إضافة منطق الإشعارات الفعلية (رسائل البريد الإلكتروني، إشعارات الدفع، إلخ)
    }

    /**
     * تحديث حالة التصميم غير المتصل للمستخدمين
     */
    static markUserOffline(reportId: string, userId: string): void {
        const session = this.sessions.get(reportId);
        if (session) {
            const participant = session.participants.find(p => p.userId === userId);
            if (participant) {
                participant.isActive = false;
            }

            // إضافة رسالة نظام
            const participantInfo = session.participants.find(p => p.userId === userId);
            if (participantInfo) {
                const systemMessage: ChatMessage = {
                    id: this.generateId('message'),
                    userId: 'system',
                    userName: 'النظام',
                    content: `${participantInfo.userName} غادر جلسة التعاون`,
                    timestamp: new Date(),
                    type: 'system'
                };
                session.chatMessages.push(systemMessage);
            }
        }
    }
}
