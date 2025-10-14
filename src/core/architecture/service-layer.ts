/**
 * Service Layer Abstraction
 * Provides a unified interface for all business services
 */

import { SERVICE_IDENTIFIERS, ServiceContainer, ServiceIdentifier } from './dependency-injection';

export interface ServiceResult<T = unknown, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface ServiceOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTtl?: number;
  validate?: boolean;
}

export abstract class BaseService {
  protected container: ServiceContainer;
  protected logger: any;
  protected cache: any;
  protected errorHandler: any;

  constructor(container: ServiceContainer) {
    this.container = container;
    this.logger = container.get(SERVICE_IDENTIFIERS.Logger);
    this.cache = container.get(SERVICE_IDENTIFIERS.Cache);
    this.errorHandler = container.get(SERVICE_IDENTIFIERS.ErrorHandler);
  }

  protected async execute<T>(
    operation: () => Promise<T>,
    options: ServiceOptions = {}
  ): Promise<ServiceResult<T>> {
    const startTime = Date.now();

    try {
      this.logger.log('info', `Starting service operation`, {
        service: this.constructor.name,
        options
      });

      const result = await this.withRetry(operation, options.retries || 3);

      const duration = Date.now() - startTime;
      this.logger.log('info', `Service operation completed`, {
        service: this.constructor.name,
        duration
      });

      return {
        success: true,
        data: result,
        metadata: { duration }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.log('error', `Service operation failed`, {
        service: this.constructor.name,
        error: error instanceof Error ? error.message : String(error),
        duration
      });

      this.errorHandler.handle(error, this.constructor.name);

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        message: error instanceof Error ? error.message : String(error),
        metadata: { duration }
      };
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (i === retries) {
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  protected async withCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.cache.get<T>(key);
    if (cached !== null) {
      this.logger.log('debug', `Cache hit for key: ${key}`);
      return cached;
    }

    // Execute operation
    const result = await operation();

    // Store in cache
    await this.cache.set(key, result, ttl);
    this.logger.log('debug', `Cached result for key: ${key}`);

    return result;
  }

  protected validateInput<T>(data: unknown, validator: (data: unknown) => data is T): T {
    if (!validator(data)) {
      throw new Error('Invalid input data');
    }
    return data;
  }
}

// Generic CRUD Service
export abstract class CrudService<TEntity, TCreateData, TUpdateData> extends BaseService {
  abstract create(data: TCreateData): Promise<ServiceResult<TEntity>>;
  abstract get(id: string): Promise<ServiceResult<TEntity>>;
  abstract getAll(filters?: Record<string, unknown>): Promise<ServiceResult<TEntity[]>>;
  abstract update(id: string, data: TUpdateData): Promise<ServiceResult<TEntity>>;
  abstract delete(id: string): Promise<ServiceResult<void>>;
}

// Repository Pattern
export interface Repository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  findAll(filters?: Record<string, unknown>): Promise<TEntity[]>;
  create(entity: Omit<TEntity, 'id'>): Promise<TEntity>;
  update(id: TId, updates: Partial<TEntity>): Promise<TEntity>;
  delete(id: TId): Promise<void>;
  count(filters?: Record<string, unknown>): Promise<number>;
}

// Unit of Work Pattern
export interface UnitOfWork {
  repositories: Map<string, Repository<any>>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  dispose(): void;
}

export class UnitOfWorkImpl implements UnitOfWork {
  repositories = new Map<string, Repository<any>>();
  private isCommitted = false;
  private isRolledBack = false;

  registerRepository<T>(name: string, repository: Repository<T>): void {
    this.repositories.set(name, repository);
  }

  getRepository<T>(name: string): Repository<T> {
    const repo = this.repositories.get(name);
    if (!repo) {
      throw new Error(`Repository not found: ${name}`);
    }
    return repo as Repository<T>;
  }

  async commit(): Promise<void> {
    if (this.isCommitted || this.isRolledBack) {
      throw new Error('Unit of work has already been committed or rolled back');
    }

    try {
      // In a real implementation, this would coordinate database transactions
      this.isCommitted = true;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async rollback(): Promise<void> {
    if (this.isCommitted || this.isRolledBack) {
      throw new Error('Unit of work has already been committed or rolled back');
    }

    // In a real implementation, this would rollback database transactions
    this.isRolledBack = true;
  }

  dispose(): void {
    this.repositories.clear();
  }
}

// Command Pattern
export interface Command<TResult = unknown> {
  execute(): Promise<TResult>;
}

export interface CommandHandler<TCommand extends Command, TResult = unknown> {
  handle(command: TCommand): Promise<TResult>;
}

// Query Pattern
export interface Query<TResult = unknown> {
  execute(): Promise<TResult>;
}

export interface QueryHandler<TQuery extends Query, TResult = unknown> {
  handle(query: TQuery): Promise<TResult>;
}

// Event System
export interface DomainEvent {
  id: string;
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface EventHandler<TEvent extends DomainEvent> {
  handle(event: TEvent): Promise<void>;
}

export class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  register<TEvent extends DomainEvent>(
    eventType: string,
    handler: EventHandler<TEvent>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async publish<TEvent extends DomainEvent>(event: TEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    await Promise.all(
      handlers.map(handler => handler.handle(event))
    );
  }
}

// Service Factory
export class ServiceFactory {
  constructor(private container: ServiceContainer) {}

  createService<T extends BaseService>(
    ServiceClass: new (container: ServiceContainer) => T
  ): T {
    return new ServiceClass(this.container);
  }

  createScopedService<T extends BaseService>(
    ServiceClass: new (container: ServiceContainer) => T
  ): T {
    const scopedContainer = this.container.createScope();
    return new ServiceClass(scopedContainer);
  }
}

// Service Registry
export class ServiceRegistry {
  private services = new Map<string, ServiceIdentifier>();

  register<T>(name: string, identifier: ServiceIdentifier<T>): void {
    this.services.set(name, identifier);
  }

  get<T>(name: string): ServiceIdentifier<T> {
    const identifier = this.services.get(name);
    if (!identifier) {
      throw new Error(`Service not registered: ${name}`);
    }
    return identifier as ServiceIdentifier<T>;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }
}
