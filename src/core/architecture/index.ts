/**
 * Architecture Index
 * Exports all architecture components
 */

export * from './core-module';
export * from './dependency-injection';
export * from './modular-patterns';
export * from './service-layer';

// Re-export commonly used types and classes
export {
    createServiceIdentifier, DependencyInjectionContainer, Injectable,
    registerService, SERVICE_IDENTIFIERS, ServiceContainer,
    ServiceDescriptor, ServiceIdentifier, ServiceLocator
} from './dependency-injection';

export {
    BaseService, Command,
    CommandHandler, CrudService, DomainEvent, EventBus, EventHandler, Query,
    QueryHandler, Repository, ServiceFactory, ServiceOptions, ServiceRegistry, ServiceResult, UnitOfWork,
    UnitOfWorkImpl
} from './service-layer';

export {
    appContext, ApplicationContext, BaseBuilder, Builder, Configuration,
    ConfigurationManager, Factory, FeatureFlag,
    FeatureFlagManager, GenericFactory, Middleware,
    MiddlewarePipeline, Module,
    ModuleRegistry, Observer, Plugin,
    PluginManager, Strategy,
    StrategyManager, Subject
} from './modular-patterns';

export {
    Analytics, AnalyticsService, ApiClient, ApiClientService, CacheService, ConfigurationService, CORE_SERVICES, coreModule, DomainEvent, ErrorHandler, ErrorHandlerService, EventBus, EventBusService, EventHandler, CacheService as ICacheService, Configuration as IConfiguration, Logger, LoggerService, PerformanceMonitor, PerformanceMonitorService
} from './core-module';

