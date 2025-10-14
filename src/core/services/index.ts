/**
 * نظام الخدمات المبسط - الفهرس الرئيسي
 *
 * نظام موحد ومبسط لجميع خدمات التطبيق
 */

// الخدمة الأساسية
export * from './simple-service';

// الخدمات المتخصصة
export * from './admin-service';
export * from './ai-service';
export * from './analytics-service';
export * from './auth-service';
export * from './chat-service';
export * from './payment-service';
export * from './project-service';
export * from './team-service';

// طبقة التوافق للانتقال التدريجي
export * from './compatibility-layer';

// إعادة تصدير الخدمات الرئيسية للسهولة
export { adminService, adminUtils } from './admin-service';
export { aiService, aiUtils } from './ai-service';
export { analyticsService, analyticsUtils } from './analytics-service';
export { authService, authUtils } from './auth-service';
export { chatService, chatUtils } from './chat-service';
export { paymentService, paymentUtils } from './payment-service';
export { projectService, projectUtils } from './project-service';
export { api, apiService, useApiService } from './simple-service';
export { teamService, teamUtils } from './team-service';

// أنواع البيانات المشتركة
export type {
    CreateAgentCategoryData, CreateAgentData, CreateSectionData, DashboardStats, GenerationLog, SystemSettings, UpdateAgentData, UserProfile
} from './admin-service';

export type {
    AcademicSolverRequest,
    AcademicSolverResponse, AgentChatRequest, AnalyzeContextOutput, DiagramRequest,
    DiagramResponse, ExternalContext, FileProcessingRequest,
    GenerationRequest,
    GenerationResponse, LectureRequest,
    ManipulateTextRequest, PresentationRequest,
    ProposalRequest,
    ReportRequest, TTSOutput, TTSRequest, TranslationRequest, WritingToolRequest,
    WritingToolResponse
} from './ai-service';

export type {
    AuthResponse,
    LoginCredentials, ResetPasswordResponse, SignupResponse
} from './auth-service';

export type {
    AddContextData,
    CreateProjectData, GenerateProjectPlanData,
    ProjectPlanRequest,
    ProjectStats, UpdateProjectData
} from './project-service';

export type {
    CreateTeamData, InviteMemberData,
    TeamMember,
    TeamStats, UpdateTeamData
} from './team-service';

export type {
    CreditPurchaseData, PaymentData, PaymentProofData, PaymentReportData, TransactionFilters, UserTransactionStats, VerifyPaymentData
} from './payment-service';

export type {
    AgentChatData, ChatMessage, ChatSession,
    ChatStats, CreateConversationData
} from './chat-service';

export type {
    AgentAnalytics, AnalyticsData, SystemMetrics, UsageReport, UserDashboardStats
} from './analytics-service';

export type {
    RequestOptions,
    ServiceConfig,
    ServiceResponse
} from './simple-service';

