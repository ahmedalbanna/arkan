
import "reflect-metadata";
import { container, Lifecycle } from "tsyringe";

// Tokens
import { IProjectRepositoryToken } from "@/modules/projects/domain/repositories/IProjectRepository";
import { IUserRepositoryToken } from "@/modules/users/domain/repositories/IUserRepository";
import { IAuthRepositoryToken } from "@/modules/users/domain/repositories/IAuthRepository";
import { INotificationServiceToken } from "@/modules/users/domain/services/INotificationService";
import { IGenerationLogRepositoryToken } from "@/modules/ai/domain/repositories/IGenerationLogRepository";
import { IAgentRepositoryToken } from "@/modules/ai/domain/repositories/IAgentRepository";
import { IAiServiceToken } from "@/modules/ai/domain/services/IAiService";
import { IRetrievalServiceToken } from "@/modules/ai/domain/services/IRetrievalService";
import { IEmailServiceToken } from "@/modules/users/domain/services/IEmailService";
import { IAdminStatsRepositoryToken } from "@/modules/admin/domain/repositories/IAdminStatsRepository";
import { IFeatureRepositoryToken } from "@/modules/admin/domain/repositories/IFeatureRepository";
import { ITransactionRepositoryToken } from "@/modules/billing/domain/repositories/ITransactionRepository";
import { IFileStorageServiceToken } from "@/modules/billing/domain/services/IFileStorageService";
import { IRagRepositoryToken } from "@/modules/rag/domain/repositories/IRagRepository";
import { IIndexedDocumentRepositoryToken } from "@/modules/rag/domain/repositories/IIndexedDocumentRepository";
import { ITemplateRepositoryToken } from "@/modules/templates/domain/repositories/ITemplateRepository";
import { ISectionRepositoryToken } from "@/modules/ai-content/domain/repositories/ISectionRepository";
import { ISettingsRepositoryToken } from "@/modules/admin/domain/repositories/ISettingsRepository";
import { IDocxExportServiceToken, IPptxExportServiceToken, IPdfExportServiceToken } from "@/modules/ai-content/domain/services/IExportService";
import { ICookieServiceToken } from "@/modules/users/domain/services/ICookieService";
import { ISessionServiceToken } from "@/modules/users/domain/services/ISessionService";
import { IPasswordServiceToken } from "@/modules/users/domain/services/IPasswordService";
import { ITokenServiceToken } from "@/modules/users/domain/services/ITokenService";
import { ICacheServiceToken } from "@/infrastructure/cache/ICacheService";
import { IMarkdownServiceToken } from "@/infrastructure/di/tokens";

// Client-side implementations (Safe to import anywhere)
import { ProjectApiClient } from "@/modules/projects/adapters/api-client/ProjectApiClient";
import { UserApiClient } from "@/modules/users/adapters/api-client/UserApiClient";
import { TemplateApiClient } from "@/modules/templates/adapters/api-client/TemplateApiClient";
import { AdminApiClient } from "@/modules/admin/adapters/api-client/AdminApiClient";
import { AnalyticsApiClient } from "@/modules/admin/adapters/api-client/AnalyticsApiClient";
import { FeatureApiClient } from "@/modules/admin/adapters/api-client/FeatureApiClient";
import { SettingsApiClient } from "@/modules/admin/adapters/api-client/SettingsApiClient";
import { SectionApiClient } from "@/modules/ai-content/adapters/api-client/SectionApiClient";
import { DocumentProcessingApiClient } from "@/modules/ai-content/adapters/api-client/DocumentProcessingApiClient";
import { ReportApiClient } from "@/modules/ai-content/adapters/api-client/ReportApiClient";
import { WritingToolsApiClient } from "@/modules/ai/adapters/api-client/WritingToolsApiClient";
import { AgentApiClient } from "@/modules/ai/adapters/api-client/AgentApiClient";
import { GenerationLogApiClient } from "@/modules/ai/adapters/api-client/GenerationLogApiClient";
import { ImageConversionApiClient } from "@/modules/ai/adapters/api-client/ImageConversionApiClient";
import { TransactionApiClient } from "@/modules/billing/adapters/api-client/TransactionApiClient";
import { AuthApiClient } from "@/modules/users/adapters/api-client/AuthApiClient";
import { DeviceTokenApiClient } from "@/modules/users/adapters/api-client/DeviceTokenApiClient";
import { NotificationApiClient } from "@/modules/users/adapters/api-client/NotificationApiClient";
import { RagApiClient } from "@/modules/rag/adapters/api-client/RagApiClient";
import { DocxExportApiClient, PptxExportApiClient } from "@/modules/ai-content/adapters/api-client/ExportApiClient";
import { CreditService } from "@/modules/billing/application/services/CreditService";
import { LocalProjectService } from "@/modules/projects/infrastructure/storage/LocalProjectService";
import { PromptBuilder } from "@/modules/ai-content/domain/services/PromptBuilder";
import { CookieManager } from "@/modules/users/infrastructure/services/CookieManager";
import { SessionManager } from "@/modules/users/infrastructure/services/SessionManager";
import { BrowserCache } from "@/infrastructure/cache/BrowserCache";
import { TurndownMarkdownService } from "@/modules/ai-content/infrastructure/services/TurndownMarkdownService";

// Register Client API Clients (always — safe for browser)
container.register(ICookieServiceToken, { useClass: CookieManager }, { lifecycle: Lifecycle.Singleton });
container.register(ISessionServiceToken, { useClass: SessionManager }, { lifecycle: Lifecycle.Singleton });
container.register(ICacheServiceToken, { useClass: BrowserCache }, { lifecycle: Lifecycle.Singleton });
container.register(IMarkdownServiceToken, { useClass: TurndownMarkdownService }, { lifecycle: Lifecycle.Singleton });
container.register(PromptBuilder, { useClass: PromptBuilder }, { lifecycle: Lifecycle.Singleton });
container.register(CreditService, { useClass: CreditService }, { lifecycle: Lifecycle.Singleton });
container.register(LocalProjectService, { useClass: LocalProjectService }, { lifecycle: Lifecycle.Singleton });
container.register(WritingToolsApiClient, { useClass: WritingToolsApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(ProjectApiClient, { useClass: ProjectApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(UserApiClient, { useClass: UserApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(TemplateApiClient, { useClass: TemplateApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(AdminApiClient, { useClass: AdminApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(AnalyticsApiClient, { useClass: AnalyticsApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(FeatureApiClient, { useClass: FeatureApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(SettingsApiClient, { useClass: SettingsApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(SectionApiClient, { useClass: SectionApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(DocumentProcessingApiClient, { useClass: DocumentProcessingApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(ReportApiClient, { useClass: ReportApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(AgentApiClient, { useClass: AgentApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(GenerationLogApiClient, { useClass: GenerationLogApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(ImageConversionApiClient, { useClass: ImageConversionApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(TransactionApiClient, { useClass: TransactionApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(AuthApiClient, { useClass: AuthApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(DeviceTokenApiClient, { useClass: DeviceTokenApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(NotificationApiClient, { useClass: NotificationApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(RagApiClient, { useClass: RagApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(IDocxExportServiceToken, { useClass: DocxExportApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(IPptxExportServiceToken, { useClass: PptxExportApiClient }, { lifecycle: Lifecycle.Singleton });

// Server-side registration (Conditional).
// require() is used for all server-only modules to prevent static bundling.
// The async_hooks Node.js built-in is stubbed for browser builds via next.config.ts turbopack.resolveAlias.
if (typeof window === 'undefined') {
  console.log("Registering server-side dependencies...");
  const { DrizzleProjectRepository } = require("@/modules/projects/infrastructure/repositories/DrizzleProjectRepository");
  const { DrizzleUserRepository } = require("@/modules/users/infrastructure/repositories/DrizzleUserRepository");
  const { DrizzleAuthRepository } = require("@/modules/users/infrastructure/repositories/DrizzleAuthRepository");
  const { DrizzleNotificationService } = require("@/modules/users/infrastructure/services/DrizzleNotificationService");
  const { DrizzleGenerationLogRepository } = require("@/modules/ai/infrastructure/repositories/DrizzleGenerationLogRepository");
  const { DrizzleAgentRepository } = require("@/modules/ai/infrastructure/repositories/DrizzleAgentRepository");
  // Use N8nAiService when N8N_AI_WEBHOOK_URL is set, otherwise fall back to GenkitAiService
  const useN8n = Boolean(process.env.N8N_AI_WEBHOOK_URL);
  const AiServiceImpl = useN8n
    ? require("@/modules/ai/infrastructure/services/N8nAiService").N8nAiService
    : require("@/modules/ai/infrastructure/services/GenkitAiService").GenkitAiService;
  const { WritingToolRegistry } = require("@/modules/ai/application/services/WritingToolRegistry");
  const { DrizzleAdminStatsRepository } = require("@/modules/admin/infrastructure/repositories/DrizzleAdminStatsRepository");
  const { DrizzleFeatureRepository } = require("@/modules/admin/infrastructure/repositories/DrizzleFeatureRepository");
  const { DrizzleSettingsRepository } = require("@/modules/admin/infrastructure/repositories/DrizzleSettingsRepository");
  const { DrizzleTransactionRepository } = require("@/modules/billing/infrastructure/repositories/DrizzleTransactionRepository");
  const { LocalFileStorageService } = require("@/modules/billing/infrastructure/services/LocalFileStorageService");
  const { DefaultRagRepository } = require("@/modules/rag/infrastructure/repositories/DefaultRagRepository");
  const { DrizzleIndexedDocumentRepository } = require("@/modules/rag/infrastructure/repositories/DrizzleIndexedDocumentRepository");
  const { DrizzleTemplateRepository } = require("@/modules/templates/infrastructure/repositories/DrizzleTemplateRepository");
  const { DrizzleSectionRepository } = require("@/modules/ai-content/infrastructure/repositories/DrizzleSectionRepository");
  const { DocxExportService } = require("@/modules/ai-content/infrastructure/exporters/DocxExportService");
  const { PptxExportService } = require("@/modules/ai-content/infrastructure/exporters/PptxExportService");
  const { PdfExportService } = require("@/modules/ai-content/infrastructure/exporters/PdfExportService");
  const { NodemailerEmailService } = require("@/modules/users/infrastructure/services/NodemailerEmailService");
  const { TwoFactorAuthService } = require("@/modules/users/infrastructure/services/TwoFactorAuthService");
  const { BcryptPasswordService } = require("@/modules/users/infrastructure/services/BcryptPasswordService");
  const { JoseTokenService } = require("@/modules/users/infrastructure/services/JoseTokenService");

  container.register(IPasswordServiceToken, { useClass: BcryptPasswordService }, { lifecycle: Lifecycle.Singleton });
  container.register(ITokenServiceToken, { useClass: JoseTokenService }, { lifecycle: Lifecycle.Singleton });
  container.register(IEmailServiceToken, { useClass: NodemailerEmailService }, { lifecycle: Lifecycle.Singleton });
  container.register(TwoFactorAuthService, { useClass: TwoFactorAuthService }, { lifecycle: Lifecycle.Singleton });
  container.register(IProjectRepositoryToken, { useClass: DrizzleProjectRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(IUserRepositoryToken, { useClass: DrizzleUserRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(IAuthRepositoryToken, { useClass: DrizzleAuthRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(INotificationServiceToken, { useClass: DrizzleNotificationService }, { lifecycle: Lifecycle.Singleton });
  container.register(IGenerationLogRepositoryToken, { useClass: DrizzleGenerationLogRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(IAgentRepositoryToken, { useClass: DrizzleAgentRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(IAiServiceToken, { useClass: AiServiceImpl }, { lifecycle: Lifecycle.Singleton });
  container.register(IDocxExportServiceToken, { useClass: DocxExportService }, { lifecycle: Lifecycle.Singleton });
  container.register(IPptxExportServiceToken, { useClass: PptxExportService }, { lifecycle: Lifecycle.Singleton });
  container.register(IPdfExportServiceToken, { useClass: PdfExportService }, { lifecycle: Lifecycle.Singleton });
  container.register(WritingToolRegistry, { useClass: WritingToolRegistry }, { lifecycle: Lifecycle.Singleton });
  container.register(IAdminStatsRepositoryToken, { useClass: DrizzleAdminStatsRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(IFeatureRepositoryToken, { useClass: DrizzleFeatureRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(ISettingsRepositoryToken, { useClass: DrizzleSettingsRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(ITransactionRepositoryToken, { useClass: DrizzleTransactionRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(IFileStorageServiceToken, { useClass: LocalFileStorageService }, { lifecycle: Lifecycle.Singleton });
  container.register(IRagRepositoryToken, { useClass: DefaultRagRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(IRetrievalServiceToken, { useClass: DefaultRagRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(IIndexedDocumentRepositoryToken, { useClass: DrizzleIndexedDocumentRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(ITemplateRepositoryToken, { useClass: DrizzleTemplateRepository }, { lifecycle: Lifecycle.Singleton });
  container.register(ISectionRepositoryToken, { useClass: DrizzleSectionRepository }, { lifecycle: Lifecycle.Singleton });
}

export { container };
