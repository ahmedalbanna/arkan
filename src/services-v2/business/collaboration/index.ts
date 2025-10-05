/**
 * خدمات التعاون - Services v2.0
 *
 * تصدير جميع خدمات التعاون المحسنة
 */

export {
    CollaborationServiceV2,
    type Comment,
    type CommentReaction,
    type ApprovalWorkflow,
    type SharedFile,
    type TaskAssignment
} from './collaboration-service';

export {
    ChatServiceV2,
    type RawChatSession,
    type ChatMessage,
    type CreateConversationData
} from './chat-service';