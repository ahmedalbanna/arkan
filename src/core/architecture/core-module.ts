/**
 * Core Module Definition
 * Defines the core module with all essential services
 */

import { createServiceIdentifier } from './dependency-injection';
import { Module } from './modular-patterns';

// Core service identifiers
export const CORE_SERVICES = {
  Logger: createServiceIdentifier<Logger>('core.logger'),
  Cache: createServiceIdentifier<CacheService>('core.cache'),
  ApiClient: createServiceIdentifier<ApiClient>('core.api-client'),
  ErrorHandler: createServiceIdentifier<ErrorHandler>('core.error-handler'),
  PerformanceMonitor: createServiceIdentifier<PerformanceMonitor>('core.performance-monitor'),
  Analytics: createServiceIdentifier<Analytics>('core.analytics'),
  Configuration: createServiceIdentifier<Configuration>('core.configuration'),
  EventBus: createServiceIdentifier<EventBus>('core.event-bus'),
} as const;

// Service implementations
export class LoggerService implements Logger {
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, metadata?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      metadata: metadata || {}
    };

    // Console logging
    switch (level) {
      case 'debug':
        console.debug(`[${timestamp}] DEBUG: ${message}`, metadata);
        break;
      case 'info':
        console.info(`[${timestamp}] INFO: ${message}`, metadata);
        break;
      case 'warn':
        console.warn(`[${timestamp}] WARN: ${message}`, metadata);
        break;
      case 'error':
        console.error(`[${timestamp}] ERROR: ${message}`, metadata);
        break;
    }

    // In production, you might want to send logs to a logging service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'log', {
        level,
        message,
        metadata: JSON.stringify(metadata)
      });
    }
  }
}

export class CacheService implements CacheService {
  private cache = new Map<string, { value: unknown; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl: number = 300000): Promise<void> {
    const expires = Date.now() + ttl;
    this.cache.set(key, { value, expires });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

export class ApiClientService implements ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

export class ErrorHandlerService implements ErrorHandler {
  handle(error: unknown, context?: string): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(`Error in ${context || 'unknown context'}:`, {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    });

    // In production, you might want to send errors to an error tracking service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: errorMessage,
        fatal: false
      });
    }
  }
}

export class PerformanceMonitorService implements PerformanceMonitor {
  private metrics: Array<{ name: string; value: number; timestamp: number }> = [];

  track(metric: string, value: number): void {
    this.metrics.push({
      name: metric,
      value,
      timestamp: Date.now()
    });

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance', {
        metric_name: metric,
        metric_value: value
      });
    }
  }

  getMetrics(): Array<{ name: string; value: number; timestamp: number }> {
    return [...this.metrics];
  }
}

export class AnalyticsService implements Analytics {
  track(event: string, properties?: Record<string, unknown>): void {
    console.log(`Analytics: ${event}`, properties);

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }
  }
}

export class ConfigurationService implements Configuration {
  private config = new Map<string, unknown>();

  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: T): T | undefined {
    const value = this.config.get(key) as T;
    return value !== undefined ? value : defaultValue;
  }

  set<T>(key: string, value: T): void {
    this.config.set(key, value);
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.config);
  }
}

export class EventBusService implements EventBus {
  private handlers = new Map<string, Array<(data: any) => Promise<void>>>();

  register<TEvent extends DomainEvent>(
    eventType: string,
    handler: EventHandler<TEvent>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler.handle.bind(handler));
  }

  async publish<TEvent extends DomainEvent>(event: TEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    await Promise.all(
      handlers.map(handler => handler(event))
    );
  }
}

// Core module definition
export const coreModule: Module = {
  name: 'core',
  version: '1.0.0',
  dependencies: [],
  services: [
    {
      identifier: CORE_SERVICES.Logger,
      factory: () => new LoggerService(),
      singleton: true
    },
    {
      identifier: CORE_SERVICES.Cache,
      factory: () => new CacheService(),
      singleton: true
    },
    {
      identifier: CORE_SERVICES.ApiClient,
      factory: () => new ApiClientService(),
      singleton: true
    },
    {
      identifier: CORE_SERVICES.ErrorHandler,
      factory: () => new ErrorHandlerService(),
      singleton: true
    },
    {
      identifier: CORE_SERVICES.PerformanceMonitor,
      factory: () => new PerformanceMonitorService(),
      singleton: true
    },
    {
      identifier: CORE_SERVICES.Analytics,
      factory: () => new AnalyticsService(),
      singleton: true
    },
    {
      identifier: CORE_SERVICES.Configuration,
      factory: () => new ConfigurationService(),
      singleton: true
    },
    {
      identifier: CORE_SERVICES.EventBus,
      factory: () => new EventBusService(),
      singleton: true
    }
  ],
  async initialize(container) {
    // Initialize core services
    const logger = container.get(CORE_SERVICES.Logger);
    logger.log('info', 'Core module initialized');
  }
};

// Type definitions
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

export interface Configuration {
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  set<T>(key: string, value: T): void;
  has(key: string): boolean;
  getAll(): Record<string, unknown>;
}

export interface EventBus {
  register<TEvent extends DomainEvent>(eventType: string, handler: EventHandler<TEvent>): void;
  publish<TEvent extends DomainEvent>(event: TEvent): Promise<void>;
}

export interface DomainEvent {
  id: string;
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface EventHandler<TEvent extends DomainEvent> {
  handle(event: TEvent): Promise<void>;
}
