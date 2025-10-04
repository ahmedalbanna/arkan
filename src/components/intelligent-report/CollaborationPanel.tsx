/**
 * لوحة التعاون والتشارك للمشاريع الفريق
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CollaborationService } from '@/services/collaboration-service';
import {
    CheckCheck,
    CheckCircle,
    Clock,
    Eye,
    MessageSquare,
    Plus,
    Reply,
    Send,
    Share2,
    UserPlus,
    Users
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface CollaborationPanelProps {
    reportId: string;
    currentUserId: string;
    currentUserName: string;
    className?: string;
}

interface CommentWithSection {
    id: string;
    sectionId: string;
    sectionTitle: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        role?: string;
    };
    timestamp: Date;
    status: 'pending' | 'resolved' | 'archived';
    replies: any[];
    reactions: any[];
}

export function CollaborationPanel({
    reportId,
    currentUserId,
    currentUserName,
    className
}: CollaborationPanelProps) {

    const [activeTab, setActiveTab] = useState<'comments' | 'approvals' | 'sharing' | 'chat'>('comments');

    // حالة التعليقات
    const [comments, setComments] = useState<CommentWithSection[]>([]);
    const [newComment, setNewComment] = useState('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    // حالة مسارات الموافقة
    const [approvalWorkflows, setApprovalWorkflows] = useState<any[]>([]);
    const [newWorkflow, setNewWorkflow] = useState({
        sectionId: '',
        approvers: [],
        dueDate: '',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    // حالة المشاركة مع الفريق
    const [teamShare, setTeamShare] = useState<any>(null);
    const [sharingForm, setSharingForm] = useState({
        users: '',
        permission: 'view' as 'view' | 'comment' | 'edit' | 'approve'
    });

    // حالة دردشة التعاون
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeSession, setActiveSession] = useState<any>(null);

    // تحميل البيانات الأولية
    useEffect(() => {
        loadCollaborationData();

        // الانضمام إلى جلسة التعاون
        if (reportId) {
            const session = CollaborationService.joinCollaborationSession(reportId, {
                userId: currentUserId,
                userName: currentUserName
            });
            setActiveSession(session);
        }
    }, [reportId, currentUserId, currentUserName]);

    const loadCollaborationData = useCallback(() => {
        try {
            // تحميل التعليقات
            const commentData = CollaborationService.getComments(reportId);
            const commentsWithSections: CommentWithSection[] = commentData.map(comment => ({
                ...comment,
                sectionTitle: getSectionTitle(comment.sectionId)
            }));
            setComments(commentsWithSections);

            // تحميل مسارات الموافقة
            const workflows = CollaborationService.getActiveApprovalWorkflows(reportId);
            setApprovalWorkflows(workflows);

            // تحميل معلومات المشاركة
            const share = CollaborationService.getTeamShare(reportId);
            setTeamShare(share);

            // تحميل رسائل الدردشة إذا كانت الجلسة نشطة
            if (activeSession) {
                setChatMessages(activeSession.chatMessages);
            }

        } catch (error) {
            console.error('خطأ في تحميل بيانات التعاون:', error);
        }
    }, [reportId, activeSession]);

    const getSectionTitle = (sectionId: string): string => {
        // محاكاة أسماء الأقسام الفعلية
        const titles: Record<string, string> = {
            introduction: 'المقدمة',
            literatureReview: 'مراجعة الأدب',
            systemAnalysis: 'تحليلس النظام',
            designStrategy: 'استراتيجية التصميم',
            systemDesign: 'تصميم النظام',
            conclusion: 'الخاتمة'
        };
        return titles[sectionId] || sectionId;
    };

    const addComment = useCallback(() => {
        if (!newComment.trim() || !selectedSection) return;

        try {
            const comment = CollaborationService.addComment(reportId, selectedSection, {
                content: newComment,
                author: {
                    id: currentUserId,
                    name: currentUserName,
                    role: 'editor'
                }
            });

            if (comment) {
                setComments(prev => [...prev, {
                    ...comment,
                    sectionTitle: getSectionTitle(comment.sectionId)
                }]);
                setNewComment('');
                setSelectedSection('');
            }

        } catch (error) {
            console.error('خطأ في إضافة التعليق:', error);
        }
    }, [newComment, selectedSection, reportId, currentUserId, currentUserName]);

    const addReply = useCallback((commentId: string, replyContent: string) => {
        if (!replyContent.trim()) return;

        try {
            const reply = CollaborationService.replyToComment(reportId, commentId, {
                content: replyContent,
                author: {
                    id: currentUserId,
                    name: currentUserName,
                    role: 'editor'
                }
            });

            if (reply) {
                // تحديث التعليقات محلياً
                setComments(prev => prev.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            replies: [...comment.replies, reply]
                        };
                    }
                    return comment;
                }));
            }

        } catch (error) {
            console.error('خطأ في إضافة الرد:', error);
        }
    }, [reportId, currentUserId, currentUserName]);

    const createApprovalWorkflow = useCallback(() => {
        if (!newWorkflow.approvers.length || !newWorkflow.sectionId) return;

        try {
            const workflow = CollaborationService.createApprovalWorkflow(reportId, {
                sectionId: newWorkflow.sectionId || undefined,
                approvers: newWorkflow.approvers.map((approver: any) => ({
                    userId: approver.userId,
                    userName: approver.userName,
                    role: approver.role
                })),
                dueDate: newWorkflow.dueDate ? new Date(newWorkflow.dueDate) : undefined,
                priority: newWorkflow.priority,
                createdBy: currentUserId
            });

            setApprovalWorkflows(prev => [...prev, workflow]);
            setNewWorkflow({
                sectionId: '',
                approvers: [],
                dueDate: '',
                priority: 'medium'
            });

        } catch (error) {
            console.error('خطأ في إنشاء مسار الموافقة:', error);
        }
    }, [reportId, newWorkflow, currentUserId]);

    const shareWithTeam = useCallback(() => {
        if (!sharingForm.users.trim()) return;

        try {
            // تحليل المستخدمين المُدخلين
            const users = sharingForm.users.split('\n')
                .filter(user => user.trim())
                .map(user => ({
                    userId: `user_${Math.random().toString(36).substr(2, 9)}`, // محاكاة معرف المستخدم
                    userName: user.trim(),
                    permission: sharingForm.permission
                }));

            const share = CollaborationService.shareWithTeam(reportId, {
                sharedWith: users,
                permissions: {
                    allowComments: true,
                    allowSuggestions: true,
                    allowDirectEdit: false,
                    requireApproval: true,
                    notifyChanges: true
                },
                sharedBy: currentUserId
            });

            setTeamShare(share);

        } catch (error) {
            console.error('خطأ في المشاركة مع الفريق:', error);
        }
    }, [reportId, sharingForm, currentUserId]);

    const sendChatMessage = useCallback(() => {
        if (!newMessage.trim()) return;

        try {
            const message = CollaborationService.addChatMessage(reportId, {
                userId: currentUserId,
                userName: currentUserName,
                content: newMessage
            });

            if (message) {
                setChatMessages(prev => [...prev, message]);
                setNewMessage('');
            }

        } catch (error) {
            console.error('خطأ في إرسال الرسالة:', error);
        }
    }, [reportId, newMessage, currentUserId, currentUserName]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900';
            case 'resolved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900';
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900';
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* شريط تبويب التعاون */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <Button
                    variant={activeTab === 'comments' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('comments')}
                    className="flex items-center gap-2"
                >
                    <MessageSquare className="h-4 w-4" />
                    التعليقات
                </Button>
                <Button
                    variant={activeTab === 'approvals' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('approvals')}
                    className="flex items-center gap-2"
                >
                    <CheckCheck className="h-4 w-4" />
                    الموافقات
                </Button>
                <Button
                    variant={activeTab === 'sharing' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('sharing')}
                    className="flex items-center gap-2"
                >
                    <Share2 className="h-4 w-4" />
                    المشاركة
                </Button>
                <Button
                    variant={activeTab === 'chat' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('chat')}
                    className="flex items-center gap-2"
                >
                    <Users className="h-4 w-4" />
                    الدردشة
                </Button>
            </div>

            {/* تبويب التعليقات */}
            {activeTab === 'comments' && (
                <div className="space-y-4">
                    {/* إضافة تعليق جديد */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                إضافة تعليق جديد
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>القسم المستهدف</Label>
                                <select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="">اختر القسم المراد التعليق عليه</option>
                                    <option value="introduction">المقدمة</option>
                                    <option value="literatureReview">مراجعة الأدب</option>
                                    <option value="systemAnalysis">تحليل النظام</option>
                                    <option value="designStrategy">استراتيجية التصميم</option>
                                    <option value="systemDesign">تصميم النظام</option>
                                    <option value="conclusion">الخاتمة</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>محتوى التعليق</Label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="اكتب تعليقك هنا بالنسبة للقسم المحدد..."
                                    className="w-full p-3 border rounded h-24 resize-none"
                                />
                            </div>
                            <Button onClick={addComment} disabled={!newComment.trim() || !selectedSection}>
                                <Plus className="h-4 w-4 mr-2" />
                                إضافة التعليق
                            </Button>
                        </CardContent>
                    </Card>

                    {/* عرض التعليقات */}
                    <Card>
                        <CardHeader>
                            <CardTitle>التعليقات على التقرير</CardTitle>
                            <CardDescription>
                                جميع التعليقات والمناقشات حول أقسام التقرير المختلفة
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {comments.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        لا توجد تعليقات بعد على هذا التقرير
                                    </div>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                        {comment.author.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {comment.author.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {comment.sectionTitle} • {formatTimeAgo(comment.timestamp)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge className={getStatusColor(comment.status)}>
                                                    {comment.status === 'pending' ? 'انتظار' :
                                                        comment.status === 'resolved' ? 'محلول' : 'أرشفة'}
                                                </Badge>
                                            </div>

                                            <div className="text-sm">
                                                {comment.content}
                                            </div>

                                            {/* الردود على التعلق */}
                                            {comment.replies.length > 0 && (
                                                <div className="ml-4 space-y-2">
                                                    <Separator />
                                                    {comment.replies.map((reply, index) => (
                                                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                                    {reply.author.name.charAt(0)}
                                                                </div>
                                                                <span className="font-medium text-xs">{reply.author.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatTimeAgo(reply.timestamp)}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-700 dark:text-gray-300">
                                                                {reply.content}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* إضافة رد */}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Reply className="h-3 w-3" />
                                                    رد
                                                </Button>
                                            </div>

                                            {replyingTo === comment.id && (
                                                <div className="border-t pt-3">
                                                    <div className="flex gap-2">
                                                        <textarea
                                                            placeholder="اكتب ردك هنا..."
                                                            className="flex-1 p-2 border rounded text-sm resize-none h-16"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    const target = e.target as HTMLTextAreaElement;
                                                                    addReply(comment.id, target.value);
                                                                    target.value = '';
                                                                    setReplyingTo(null);
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                const textarea = document.querySelector(`textarea[placeholder="اكتب ردك هنا..."]`) as HTMLTextAreaElement;
                                                                addReply(comment.id, textarea.value);
                                                                textarea.value = '';
                                                                setReplyingTo(null);
                                                            }}
                                                        >
                                                            <Send className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* تبويب الموافقات */}
            {activeTab === 'approvals' && (
                <div className="space-y-4">
                    {/* إنشاء مسار موافقة جديد */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                إنشاء مسار موافقة جديد
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>القسم المطلوب موافقته</Label>
                                    <select
                                        value={newWorkflow.sectionId}
                                        onChange={(e) => setNewWorkflow(prev => ({ ...prev, sectionId: e.target.value }))}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">التقرير كاملاً</option>
                                        <option value="introduction">المقدمة فقط</option>
                                        <option value="literatureReview">مراجعة الأدب فقط</option>
                                        <option value="systemAnalysis">تحليل النظام فقط</option>
                                        <option value="designStrategy">استراتيجية التصميم فقط</option>
                                        <option value="systemDesign">تصميم النظام فقط</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>الأولوية</Label>
                                    <select
                                        value={newWorkflow.priority}
                                        onChange={(e) => setNewWorkflow(prev => ({ ...prev, priority: e.target.value as any }))}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="low">منخفضة</option>
                                        <option value="medium">متوسطة</option>
                                        <option value="high">عالية</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>تاريخ الاستحقاق</Label>
                                <Input
                                    type="datetime-local"
                                    value={newWorkflow.dueDate}
                                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, dueDate: e.target.value }))}
                                />
                            </div>
                            <Button onClick={createApprovalWorkflow} disabled={!newWorkflow.sectionId}>
                                <Plus className="h-4 w-4 mr-2" />
                                إنشاء مسار الموافقة
                            </Button>
                        </CardContent>
                    </Card>

                    {/* عرض مسارات الموافقة النشطة */}
                    <Card>
                        <CardHeader>
                            <CardTitle>مسارات الموافقة النشطة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {approvalWorkflows.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        لا توجد مسارات موافقة نشطة
                                    </div>
                                ) : (
                                    approvalWorkflows.map(workflow => (
                                        <div key={workflow.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="font-medium">
                                                        موافقة {getSectionTitle(workflow.sectionId) || 'التقرير كاملاً'}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        أنشئ {formatTimeAgo(workflow.createdAt)}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge className={getPriorityColor(workflow.priority)}>
                                                        أولوية {workflow.priority}
                                                    </Badge>
                                                    <Badge className={getStatusColor(workflow.workflowStatus)}>
                                                        {workflow.workflowStatus === 'pending' ? 'انتظاراً' :
                                                            workflow.workflowStatus === 'approved' ? 'موافق عليه' :
                                                                workflow.workflowStatus === 'rejected' ? 'مرفوض' : 'قيد التجهيز'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-sm font-medium">المُعتمدين:</div>
                                                {workflow.approvers.map((approver: any, index: number) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                                                            {approver.userName.charAt(0)}
                                                        </div>
                                                        <span className="text-sm">{approver.userName}</span>
                                                        <Badge variant="outline" className={getStatusColor(approver.status)}>
                                                            {approver.status === 'pending' ? 'انتظاراً' :
                                                                approver.status === 'approved' ? 'موافق' : 'مرفوض'}
                                                        </Badge>
                                                        {approver.comment && (
                                                            <span className="text-xs text-muted-foreground">
                                                                "{approver.comment}"
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {workflow.dueDate && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Clock className="h-4 w-4" />
                                                        الموعد النهائي: {new Date(workflow.dueDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* تبويب المشاركة */}
            {activeTab === 'sharing' && (
                <div className="space-y-4">
                    {/* مشاركة مع الفريق */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                مشاركة مع أعضاء الفريق
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>أعضاء الفريق (اكتب اسم كل عضو في سطر جديد)</Label>
                                <textarea
                                    value={sharingForm.users}
                                    onChange={(e) => setSharingForm(prev => ({ ...prev, users: e.target.value }))}
                                    placeholder="أحمد محمد&#10;سارة أحمد&#10;محمد علي"
                                    className="w-full p-3 border rounded h-24 resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>نوع الإذن</Label>
                                <select
                                    value={sharingForm.permission}
                                    onChange={(e) => setSharingForm(prev => ({ ...prev, permission: e.target.value as any }))}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="view">عرض فقط</option>
                                    <option value="comment">عرض وتعليق</option>
                                    <option value="edit">عرض وتعليق وتحرير</option>
                                    <option value="approve">عين وتعليق وتحريـــر وموافقة</option>
                                </select>
                            </div>
                            <Button onClick={shareWithTeam} disabled={!sharingForm.users.trim()}>
                                <Share2 className="h-4 w-4 mr-2" />
                                مشاركة مع الفريق
                            </Button>
                        </CardContent>
                    </Card>

                    {/* حالــة المشاركة الحالية */}
                    {teamShare && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="h-5 w-5" />
                                    حالة المشاركة الحالية
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-sm font-medium">أعضاء الفريق المشارك معهم:</div>
                                    {teamShare.sharedWith.map((member: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between border rounded p-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                                    {member.userName.charAt(0)}
                                                </div>
                                                <span className="text-sm">{member.userName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {member.permission === 'view' ? 'عرض' :
                                                        member.permission === 'comment' ? 'تعليق' :
                                                            member.permission === 'edit' ? 'تحرير' : 'موافقة'}
                                                </Badge>
                                                <Badge className={getStatusColor(member.status)}>
                                                    {member.status === 'invited' ? 'مدعو' :
                                                        member.status === 'active' ? 'نشط' : 'مرفوض'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}

                                    <Separator />

                                    <div>
                                        <div className="text-sm font-medium mb-2">الإذنات المُعطاة:</div>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <div>• التعليقات: {teamShare.permissions.allowComments ? 'مُفعلة' : 'معطلة'}</div>
                                            <div>• الاقتراحات: {teamShare.permissions.allowSuggestions ? 'مُفعلة' : 'معطلة'}</div>
                                            <div>• التحرير المباشر: {teamShare.permissions.allowDirectEdit ? 'مُفعل' : 'معطل'}</div>
                                            <div>• تُطلب الموافقة من التغييرات: {teamShare.permissions.requireApproval ? 'مفعلة' : 'معطلة'}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* تبويب الدردشة */}
            {activeTab === 'chat' && (
                <div className="space-y-4">
                    {/* رسائل الدردشة */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                دردشة التعاون النشطة
                                {activeSession && (
                                    <Badge variant="outline">
                                        {activeSession.participants.length} مشارك
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* نافذة الرسائل */}
                            <div className="border rounded h-64 overflow-y-auto p-3 space-y-2">
                                {chatMessages.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        لا توجد رسائل بعد في دردشة التعاون
                                    </div>
                                ) : (
                                    chatMessages.map(message => (
                                        <div key={message.id} className="flex gap-2">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                                {message.userName.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">{message.userName}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatTimeAgo(message.timestamp)}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    {message.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* إدخال رسالة جديدة */}
                            <div className="flex gap-2">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="اكتب رسالتك هنا..."
                                    className="flex-1 p-2 border rounded resize-y h-16"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendChatMessage();
                                        }
                                    }}
                                />
                                <Button onClick={sendChatMessage} disabled={!newMessage.trim()}>
                                    <Send className="h-4 w-4 mr-2" />
                                    إرسال
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* المشاركين النشطين */}
                    {activeSession && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    الأعضاء النشطين
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {activeSession.participants.map((participant: any) => (
                                        <div key={participant.userId} className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${participant.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            <span className="text-sm">{participant.userName}</span>
                                            <span className="text-xs text-muted-foreground">
                                                انضم {formatTimeAgo(participant.joinTime)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* معلومات إضافية */}
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    جميع التفاعلات والأنشطة مُسجلاً تلقائياً للمراجعة والمتابعة.
                </AlertDescription>
            </Alert>
        </div>
    );
}

// دالة مساعدة لتنسيق الوقت المنقضي
function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} يوم مضت`;
    if (diffHours > 0) return `${diffHours} ساعة مضت`;
    if (diffMinutes > 0) return `${diffMinutes} دقيقة مضت`;
    return 'الآن';
}
