/**
 * Legacy Services - Arkan v2.0
 *
 * خدمات قديمة للانتقال التدريجي
 * هذه الخدمات تُستخدم فقط أثناء فترة الانتقال
 */

// روابط للخدمات القديمة في مجلد services الأصلي
export * from '../../services';

// تصدير محدد لبعض الخدمات المهمة التي قد تحتاج الانتقال التدريجي
export { UserService } from '../../services/users';
export { ProjectService } from '../../services/projects';
export { AuthService } from '../../services/auth';
export { ChatService } from '../../services/chat';
export { AnalyticsService } from '../../services/analytics';
export { TemplateService } from '../../services/templates';
export { TeamService } from '../../services/teams';
export { PaymentService, CreditService, TransactionService } from '../../services/payment';

// خدمات الذكاء الاصطناعي القديمة
export { ReportService } from '../../services/ai/report-service';
export { ProposalService } from '../../services/ai/proposal-service';
export { DiagramService } from '../../services/ai/diagram-service';
export { AcademicSolverService } from '../../services/ai/academic-solver-service';
export { WritingToolsService } from '../../services/ai/writing-tools-service';
export { DocumentProcessingService } from '../../services/ai/document-processing-service';

// خدمات إدارية قديمة
export { AdminService } from '../../services/admin';
export { AgentService } from '../../services/admin/agent-service';
export { FeatureService } from '../../services/admin/feature-service';
export { GenerationLogService } from '../../services/admin/generation-log-service';