
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
import { IAdminStatsRepositoryToken } from "@/modules/admin/domain/repositories/IAdminStatsRepository";
import { IFeatureRepositoryToken } from "@/modules/admin/domain/repositories/IFeatureRepository";
import { ITransactionRepositoryToken } from "@/modules/billing/domain/repositories/ITransactionRepository";
import { IFileStorageServiceToken } from "@/modules/billing/domain/services/IFileStorageService";
import { IRagRepositoryToken } from "@/modules/rag/domain/repositories/IRagRepository";
import { IIndexedDocumentRepositoryToken } from "@/modules/rag/domain/repositories/IIndexedDocumentRepository";
import { ITemplateRepositoryToken } from "@/modules/templates/domain/repositories/ITemplateRepository";
import { ISectionRepositoryToken } from "@/modules/ai-content/domain/repositories/ISectionRepository";
import { ISettingsRepositoryToken } from "@/modules/admin/domain/repositories/ISettingsRepository";
import { IDocxExportServiceToken, IPptxExportServiceToken } from "@/modules/ai-content/domain/services/IExportService";

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
import { WritingToolRegistry } from "@/modules/ai/application/services/WritingToolRegistry";
import { WritingToolsApiClient } from "@/modules/ai/adapters/api-client/WritingToolsApiClient";
import { AgentApiClient } from "@/modules/ai/adapters/api-client/AgentApiClient";
import { GenerationLogApiClient } from "@/modules/ai/adapters/api-client/GenerationLogApiClient";
import { ImageConversionApiClient } from "@/modules/ai/adapters/api-client/ImageConversionApiClient";
import { TransactionApiClient } from "@/modules/billing/adapters/api-client/TransactionApiClient";
import { AuthApiClient } from "@/modules/users/adapters/api-client/AuthApiClient";
import { DeviceTokenApiClient } from "@/modules/users/adapters/api-client/DeviceTokenApiClient";
import { CreditService } from "@/modules/billing/application/services/CreditService";
import { LocalProjectService } from "@/modules/projects/adapters/local-storage/LocalProjectService";
import { PromptBuilder } from "@/modules/ai-content/domain/services/PromptBuilder";

// Register Client API Clients (always)
container.register(PromptBuilder, { useClass: PromptBuilder }, { lifecycle: Lifecycle.Singleton });
container.register(WritingToolRegistry, { useClass: WritingToolRegistry }, { lifecycle: Lifecycle.Singleton });
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

// Register Exporters (Lazy load implementations if they have complex deps)
const { DocxExportService } = require("@/modules/ai-content/infrastructure/exporters/DocxExportService");
const { PptxExportService } = require("@/modules/ai-content/infrastructure/exporters/PptxExportService");
const { PdfExportService } = require("@/modules/ai-content/infrastructure/exporters/PdfExportService");

container.register(IDocxExportServiceToken, { useClass: DocxExportService }, { lifecycle: Lifecycle.Singleton });
container.register(IPptxExportServiceToken, { useClass: PptxExportService }, { lifecycle: Lifecycle.Singleton });
container.register(PdfExportService, { useClass: PdfExportService }, { lifecycle: Lifecycle.Singleton });
container.register(DocumentProcessingApiClient, { useClass: DocumentProcessingApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(ReportApiClient, { useClass: ReportApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(AgentApiClient, { useClass: AgentApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(GenerationLogApiClient, { useClass: GenerationLogApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(ImageConversionApiClient, { useClass: ImageConversionApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(TransactionApiClient, { useClass: TransactionApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(AuthApiClient, { useClass: AuthApiClient }, { lifecycle: Lifecycle.Singleton });
container.register(DeviceTokenApiClient, { useClass: DeviceTokenApiClient }, { lifecycle: Lifecycle.Singleton });

// Server-side registration (Conditional)
if (typeof window === 'undefined') {
  console.log("Registering server-side dependencies...");
  // Use require to avoid bundling server-only modules in the client
  const { SQLiteProjectRepository } = require("@/modules/projects/infrastructure/repositories/SQLiteProjectRepository");
  const { SQLiteUserRepository } = require("@/modules/users/infrastructure/repositories/SQLiteUserRepository");
  const { SQLiteAuthRepository } = require("@/modules/users/infrastructure/repositories/SQLiteAuthRepository");
  const { FirebaseNotificationService } = require("@/modules/users/infrastructure/services/FirebaseNotificationService");
  const { SQLiteGenerationLogRepository } = require("@/modules/ai/infrastructure/repositories/SQLiteGenerationLogRepository");
  const { SQLiteAgentRepository } = require("@/modules/ai/infrastructure/repositories/SQLiteAgentRepository");
  const { GenkitAiService } = require("@/modules/ai/infrastructure/services/GenkitAiService");
  const { SQLiteAdminStatsRepository } = require("@/modules/admin/infrastructure/repositories/SQLiteAdminStatsRepository");
  const { SQLiteFeatureRepository } = require("@/modules/admin/infrastructure/repositories/SQLiteFeatureRepository");
  const { SQLiteSettingsRepository } = require("@/modules/admin/infrastructure/repositories/SQLiteSettingsRepository");
  const { SQLiteTransactionRepository } = require("@/modules/billing/infrastructure/repositories/SQLiteTransactionRepository");
  const { FirebaseFileStorageService } = require("@/modules/billing/infrastructure/services/FirebaseFileStorageService");
  const { DefaultRagRepository } = require("@/modules/rag/infrastructure/repositories/DefaultRagRepository");
  const { SQLiteIndexedDocumentRepository } = require("@/modules/rag/infrastructure/repositories/SQLiteIndexedDocumentRepository");
  const { SQLiteTemplateRepository } = require("@/modules/templates/infrastructure/repositories/SQLiteTemplateRepository");
  const { SQLiteSectionRepository } = require("@/modules/ai-content/infrastructure/repositories/SQLiteSectionRepository");

  container.register(IProjectRepositoryToken, {
    useClass: SQLiteProjectRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IUserRepositoryToken, {
    useClass: SQLiteUserRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IAuthRepositoryToken, {
    useClass: SQLiteAuthRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(INotificationServiceToken, {
    useClass: FirebaseNotificationService
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IGenerationLogRepositoryToken, {
    useClass: SQLiteGenerationLogRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IAgentRepositoryToken, {
    useClass: SQLiteAgentRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IAiServiceToken, {
    useClass: GenkitAiService
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IAdminStatsRepositoryToken, {
    useClass: SQLiteAdminStatsRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IFeatureRepositoryToken, {
    useClass: SQLiteFeatureRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(ISettingsRepositoryToken, {
    useClass: SQLiteSettingsRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(ITransactionRepositoryToken, {
    useClass: SQLiteTransactionRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IFileStorageServiceToken, {
    useClass: FirebaseFileStorageService
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IRagRepositoryToken, {
    useClass: DefaultRagRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IIndexedDocumentRepositoryToken, {
    useClass: SQLiteIndexedDocumentRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(ITemplateRepositoryToken, {
    useClass: SQLiteTemplateRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(ISectionRepositoryToken, {
    useClass: SQLiteSectionRepository
  }, { lifecycle: Lifecycle.Singleton });
}

export { container };
