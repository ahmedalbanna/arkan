/**
 * Dependency Injection System for Core Application
 * Provides a lightweight, type-safe dependency injection container
 */

export interface ServiceIdentifier<T = unknown> {
  readonly id: string;
  readonly type: T;
}

export interface ServiceDescriptor<T = unknown> {
  identifier: ServiceIdentifier<T>;
  factory: () => T;
  singleton?: boolean;
  dependencies?: ServiceIdentifier[];
}

export interface ServiceContainer {
  register<T>(descriptor: ServiceDescriptor<T>): void;
  get<T>(identifier: ServiceIdentifier<T>): T;
  has<T>(identifier: ServiceIdentifier<T>): boolean;
  createScope(): ServiceContainer;
  dispose(): void;
}

export class DependencyInjectionContainer implements ServiceContainer {
  private services = new Map<string, ServiceDescriptor>();
  private instances = new Map<string, unknown>();
  private scopedInstances = new Map<string, unknown>();
  private isDisposed = false;

  register<T>(descriptor: ServiceDescriptor<T>): void {
    if (this.isDisposed) {
      throw new Error('Container has been disposed');
    }

    this.services.set(descriptor.identifier.id, descriptor);
  }

  get<T>(identifier: ServiceIdentifier<T>): T {
    if (this.isDisposed) {
      throw new Error('Container has been disposed');
    }

    const descriptor = this.services.get(identifier.id);
    if (!descriptor) {
      throw new Error(`Service not registered: ${identifier.id}`);
    }

    // Check if singleton instance exists
    if (descriptor.singleton && this.instances.has(identifier.id)) {
      return this.instances.get(identifier.id) as T;
    }

    // Check if scoped instance exists
    if (this.scopedInstances.has(identifier.id)) {
      return this.scopedInstances.get(identifier.id) as T;
    }

    // Resolve dependencies
    const dependencies = descriptor.dependencies?.map(dep => this.get(dep)) || [];

    // Create instance
    const instance = descriptor.factory.apply(null, dependencies) as T;

    // Store instance
    if (descriptor.singleton) {
      this.instances.set(identifier.id, instance);
    } else {
      this.scopedInstances.set(identifier.id, instance);
    }

    return instance;
  }

  has<T>(identifier: ServiceIdentifier<T>): boolean {
    return this.services.has(identifier.id);
  }

  createScope(): ServiceContainer {
    const scopedContainer = new DependencyInjectionContainer();

    // Copy service descriptors
    for (const [id, descriptor] of this.services) {
      scopedContainer.services.set(id, descriptor);
    }

    // Copy singleton instances
    for (const [id, instance] of this.instances) {
      scopedContainer.instances.set(id, instance);
    }

    return scopedContainer;
  }

  dispose(): void {
    this.services.clear();
    this.instances.clear();
    this.scopedInstances.clear();
    this.isDisposed = true;
  }
}

// Service identifiers factory
export function createServiceIdentifier<T>(id: string): ServiceIdentifier<T> {
  return {
    id,
    type: undefined as T
  };
}

// Decorator for automatic dependency injection
export function Injectable<T>(identifier: ServiceIdentifier<T>) {
  return function <TFunction extends new (...args: any[]) => T>(target: TFunction) {
    return class extends target {
      static readonly __serviceIdentifier = identifier;
    };
  };
}

// Service registration helper
export function registerService<T>(
  container: ServiceContainer,
  identifier: ServiceIdentifier<T>,
  factory: () => T,
  options: { singleton?: boolean; dependencies?: ServiceIdentifier[] } = {}
): void {
  container.register({
    identifier,
    factory,
    singleton: options.singleton ?? true,
    dependencies: options.dependencies
  });
}

// Global container instance
export const globalContainer = new DependencyInjectionContainer();

// Service locator pattern
export class ServiceLocator {
  private static container: ServiceContainer = globalContainer;

  static setContainer(container: ServiceContainer): void {
    this.container = container;
  }

  static get<T>(identifier: ServiceIdentifier<T>): T {
    return this.container.get(identifier);
  }

  static has<T>(identifier: ServiceIdentifier<T>): boolean {
    return this.container.has(identifier);
  }
}

// Common service identifiers
export const SERVICE_IDENTIFIERS = {
  // Core services
  Logger: createServiceIdentifier<Logger>('logger'),
  Cache: createServiceIdentifier<CacheService>('cache'),
  ApiClient: createServiceIdentifier<ApiClient>('api-client'),
  ErrorHandler: createServiceIdentifier<ErrorHandler>('error-handler'),

  // Performance services
  PerformanceMonitor: createServiceIdentifier<PerformanceMonitor>('performance-monitor'),
  Analytics: createServiceIdentifier<Analytics>('analytics'),

  // Auth services
  AuthService: createServiceIdentifier<AuthService>('auth-service'),
  UserService: createServiceIdentifier<UserService>('user-service'),

  // Business services
  ProjectService: createServiceIdentifier<ProjectService>('project-service'),
  TeamService: createServiceIdentifier<TeamService>('team-service'),
  AgentService: createServiceIdentifier<AgentService>('agent-service'),
} as const;

// Type definitions for services
export interface Logger {
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, metadata?: Record<string, unknown>): void;
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface ApiClient {
  request<T>(url: string, options?: RequestInit): Promise<T>;
}

export interface ErrorHandler {
  handle(error: unknown, context?: string): void;
}

export interface PerformanceMonitor {
  track(metric: string, value: number): void;
}

export interface Analytics {
  track(event: string, properties?: Record<string, unknown>): void;
}

export interface AuthService {
  login(credentials: { email: string; password: string }): Promise<{ token: string; user: any }>;
  logout(): Promise<void>;
}

export interface UserService {
  getProfile(userId: string): Promise<any>;
  updateProfile(userId: string, data: any): Promise<any>;
}

export interface ProjectService {
  create(data: any): Promise<any>;
  get(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export interface TeamService {
  create(data: any): Promise<any>;
  get(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export interface AgentService {
  create(data: any): Promise<any>;
  get(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}
