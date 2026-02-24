
import "reflect-metadata";
import { container, Lifecycle } from "tsyringe";
import { IProjectRepositoryToken } from "@/modules/projects/domain/repositories/IProjectRepository";
import { FirebaseProjectRepository } from "@/modules/projects/infrastructure/repositories/FirebaseProjectRepository";
import { IUserRepositoryToken } from "@/modules/users/domain/repositories/IUserRepository";
import { FirebaseUserRepository } from "@/modules/users/infrastructure/repositories/FirebaseUserRepository";
import { IAuthRepositoryToken } from "@/modules/users/domain/repositories/IAuthRepository";
import { FirebaseAuthRepository } from "@/modules/users/infrastructure/repositories/FirebaseAuthRepository";
import { INotificationServiceToken } from "@/modules/users/domain/services/INotificationService";
import { FirebaseNotificationService } from "@/modules/users/infrastructure/services/FirebaseNotificationService";
import { IGenerationLogRepositoryToken } from "@/modules/ai/domain/repositories/IGenerationLogRepository";
import { FirebaseGenerationLogRepository } from "@/modules/ai/infrastructure/repositories/FirebaseGenerationLogRepository";
import { IAgentRepositoryToken } from "@/modules/ai/domain/repositories/IAgentRepository";
import { FirebaseAgentRepository } from "@/modules/ai/infrastructure/repositories/FirebaseAgentRepository";
import { IAiServiceToken } from "@/modules/ai/domain/services/IAiService";
import { GenkitAiService } from "@/modules/ai/infrastructure/services/GenkitAiService";
import { IAdminStatsRepositoryToken } from "@/modules/admin/domain/repositories/IAdminStatsRepository";
import { FirebaseAdminStatsRepository } from "@/modules/admin/infrastructure/repositories/FirebaseAdminStatsRepository";
import { ProjectApiClient } from "@/modules/projects/adapters/api-client/ProjectApiClient";
import { UserApiClient } from "@/modules/users/adapters/api-client/UserApiClient";

// Projects Module
container.register(IProjectRepositoryToken, {
  useClass: FirebaseProjectRepository
}, { lifecycle: Lifecycle.Singleton });

// Users Module
container.register(IUserRepositoryToken, {
  useClass: FirebaseUserRepository
}, { lifecycle: Lifecycle.Singleton });

container.register(IAuthRepositoryToken, {
  useClass: FirebaseAuthRepository
}, { lifecycle: Lifecycle.Singleton });

container.register(INotificationServiceToken, {
  useClass: FirebaseNotificationService
}, { lifecycle: Lifecycle.Singleton });

// AI Module
container.register(IGenerationLogRepositoryToken, {
  useClass: FirebaseGenerationLogRepository
}, { lifecycle: Lifecycle.Singleton });

container.register(IAgentRepositoryToken, {
  useClass: FirebaseAgentRepository
}, { lifecycle: Lifecycle.Singleton });

container.register(IAiServiceToken, {
  useClass: GenkitAiService
}, { lifecycle: Lifecycle.Singleton });

// Admin Module
container.register(IAdminStatsRepositoryToken, {
  useClass: FirebaseAdminStatsRepository
}, { lifecycle: Lifecycle.Singleton });

// Client API Clients
container.register(ProjectApiClient, {
  useClass: ProjectApiClient
}, { lifecycle: Lifecycle.Singleton });

container.register(UserApiClient, {
  useClass: UserApiClient
}, { lifecycle: Lifecycle.Singleton });

export { container };
