
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
import { ITemplateRepositoryToken } from "@/modules/templates/domain/repositories/ITemplateRepository";

// Client-side implementations (Safe to import anywhere)
import { ProjectApiClient } from "@/modules/projects/adapters/api-client/ProjectApiClient";
import { UserApiClient } from "@/modules/users/adapters/api-client/UserApiClient";

// Register Client API Clients (always)
container.register(ProjectApiClient, {
  useClass: ProjectApiClient
}, { lifecycle: Lifecycle.Singleton });

container.register(UserApiClient, {
  useClass: UserApiClient
}, { lifecycle: Lifecycle.Singleton });

// Server-side registration (Conditional)
if (typeof window === 'undefined') {
  console.log("Registering server-side dependencies...");
  // Use require to avoid bundling server-only modules in the client
  const { FirebaseProjectRepository } = require("@/modules/projects/infrastructure/repositories/FirebaseProjectRepository");
  const { FirebaseUserRepository } = require("@/modules/users/infrastructure/repositories/FirebaseUserRepository");
  const { FirebaseAuthRepository } = require("@/modules/users/infrastructure/repositories/FirebaseAuthRepository");
  const { FirebaseNotificationService } = require("@/modules/users/infrastructure/services/FirebaseNotificationService");
  const { FirebaseGenerationLogRepository } = require("@/modules/ai/infrastructure/repositories/FirebaseGenerationLogRepository");
  const { FirebaseAgentRepository } = require("@/modules/ai/infrastructure/repositories/FirebaseAgentRepository");
  const { GenkitAiService } = require("@/modules/ai/infrastructure/services/GenkitAiService");
  const { FirebaseAdminStatsRepository } = require("@/modules/admin/infrastructure/repositories/FirebaseAdminStatsRepository");
  const { FirebaseFeatureRepository } = require("@/modules/admin/infrastructure/repositories/FirebaseFeatureRepository");
  const { FirebaseTransactionRepository } = require("@/modules/billing/infrastructure/repositories/FirebaseTransactionRepository");
  const { FirebaseFileStorageService } = require("@/modules/billing/infrastructure/services/FirebaseFileStorageService");
  const { DefaultRagRepository } = require("@/modules/rag/infrastructure/repositories/DefaultRagRepository");
  const { FirebaseTemplateRepository } = require("@/modules/templates/infrastructure/repositories/FirebaseTemplateRepository");

  container.register(IProjectRepositoryToken, {
    useClass: FirebaseProjectRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IUserRepositoryToken, {
    useClass: FirebaseUserRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IAuthRepositoryToken, {
    useClass: FirebaseAuthRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(INotificationServiceToken, {
    useClass: FirebaseNotificationService
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IGenerationLogRepositoryToken, {
    useClass: FirebaseGenerationLogRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IAgentRepositoryToken, {
    useClass: FirebaseAgentRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IAiServiceToken, {
    useClass: GenkitAiService
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IAdminStatsRepositoryToken, {
    useClass: FirebaseAdminStatsRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IFeatureRepositoryToken, {
    useClass: FirebaseFeatureRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(ITransactionRepositoryToken, {
    useClass: FirebaseTransactionRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IFileStorageServiceToken, {
    useClass: FirebaseFileStorageService
  }, { lifecycle: Lifecycle.Singleton });

  container.register(IRagRepositoryToken, {
    useClass: DefaultRagRepository
  }, { lifecycle: Lifecycle.Singleton });

  container.register(ITemplateRepositoryToken, {
    useClass: FirebaseTemplateRepository
  }, { lifecycle: Lifecycle.Singleton });
}

export { container };
