/**
 * Advanced Monitoring and Analytics System
 * Comprehensive monitoring, analytics, and observability tools
 */

import { PerformanceObserver } from 'perf_hooks';

// Monitoring Types
export interface MonitoringConfig {
  enablePerformanceMonitoring?: boolean;
  enableErrorMonitoring?: boolean;
  enableUserAnalytics?: boolean;
  enableApiMonitoring?: boolean;
  enableDatabaseMonitoring?: boolean;
  enableCacheMonitoring?: boolean;
  enableSecurityMonitoring?: boolean;
  enableCustomMetrics?: boolean;
  samplingRate?: number;
  batchSize?: number;
  flushInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface MonitoringMetrics {
  performance: PerformanceMetrics;
  errors: ErrorMetrics;
  users: UserMetrics;
  api: ApiMetrics;
  database: DatabaseMetrics;
  cache: CacheMetrics;
  security: SecurityMetrics;
  custom: CustomMetrics;
}

export interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  responseTime: number;
  memoryUsage: number;
  networkLatency: number;
  frameRate: number;
  performanceScore: number;
  timestamp: string;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  errorTypes: Record<string, number>;
  errorSources: Record<string, number>;
  errorLevels: Record<string, number>;
  recentErrors: Array<{
    id: string;
    type: string;
    message: string;
    stack?: string;
    timestamp: string;
    context?: Record<string, unknown>;
  }>;
  timestamp: string;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userEngagement: number;
  userRetention: number;
  userSessions: number;
  averageSessionDuration: number;
  userActions: Record<string, number>;
  userPaths: Array<{
    path: string;
    count: number;
    averageTime: number;
  }>;
  timestamp: string;
}

export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  responseTimes: number[];
  statusCodes: Record<number, number>;
  endpoints: Record<string, {
    requests: number;
    averageResponseTime: number;
    errorRate: number;
  }>;
  timestamp: string;
}

export interface DatabaseMetrics {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number;
  queryTypes: Record<string, number>;
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  timestamp: string;
}

export interface CacheMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageResponseTime: number;
  cacheSize: number;
  evictions: number;
  timestamp: string;
}

export interface SecurityMetrics {
  totalSecurityEvents: number;
  securityEventTypes: Record<string, number>;
  blockedRequests: number;
  suspiciousActivities: number;
  authenticationFailures: number;
  authorizationFailures: number;
  timestamp: string;
}

export interface CustomMetrics {
  metrics: Record<string, {
    value: number;
    unit: string;
    timestamp: string;
  }>;
  timestamp: string;
}

// Event Tracking
export interface EventData {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  context?: Record<string, unknown>;
}

export interface EventTracker {
  track(event: string, properties?: Record<string, unknown>): void;
  trackUser(userId: string, properties?: Record<string, unknown>): void;
  trackPage(page: string, properties?: Record<string, unknown>): void;
  trackError(error: Error, context?: Record<string, unknown>): void;
  trackPerformance(metrics: PerformanceMetrics): void;
  trackApi(endpoint: string, method: string, duration: number, status: number): void;
  trackDatabase(query: string, duration: number, result: 'success' | 'error'): void;
  trackCache(key: string, hit: boolean, duration: number): void;
  trackSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical'): void;
}

// Performance Monitoring
export class PerformanceMonitor {
  private static config: MonitoringConfig = {
    enablePerformanceMonitoring: true,
    enableErrorMonitoring: true,
    enableUserAnalytics: true,
    enableApiMonitoring: true,
    enableDatabaseMonitoring: true,
    enableCacheMonitoring: true,
    enableSecurityMonitoring: true,
    enableCustomMetrics: true,
    samplingRate: 1.0,
    batchSize: 100,
    flushInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000
  };

  private static metrics: PerformanceMetrics = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    responseTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    frameRate: 0,
    performanceScore: 0,
    timestamp: new Date().toISOString()
  };

  private static observers: PerformanceObserver[] = [];

  static configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static startMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return;

    // Monitor Core Web Vitals
    this.observeWebVitals();

    // Monitor Memory Usage
    this.observeMemoryUsage();

    // Monitor Network Performance
    this.observeNetworkPerformance();

    // Monitor Rendering Performance
    this.observeRenderingPerformance();
  }

  static stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  static updateMetrics(updates: Partial<PerformanceMetrics>): void {
    this.metrics = { ...this.metrics, ...updates, timestamp: new Date().toISOString() };
  }

  private static observeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        this.metrics.fcp = fcp.startTime;
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcp = entries[entries.length - 1];
      if (lcp) {
        this.metrics.lcp = lcp.startTime;
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.processingStart && entry.startTime) {
          this.metrics.fid = entry.processingStart - entry.startTime;
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          this.metrics.cls += entry.value;
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private static observeMemoryUsage(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  private static observeNetworkPerformance(): void {
    if (typeof window === 'undefined') return;

    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const response = await originalFetch(...args);
      const end = performance.now();

      this.metrics.networkLatency = end - start;
      this.metrics.responseTime = end - start;

      return response;
    };
  }

  private static observeRenderingPerformance(): void {
    if (typeof window === 'undefined') return;

    let frameCount = 0;
    let lastTime = performance.now();

    const measureFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        this.metrics.frameRate = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }
}

// Error Monitoring
export class ErrorMonitor {
  private static config: MonitoringConfig = {
    enableErrorMonitoring: true,
    samplingRate: 1.0,
    batchSize: 100,
    flushInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000
  };

  private static metrics: ErrorMetrics = {
    totalErrors: 0,
    errorRate: 0,
    errorTypes: {},
    errorSources: {},
    errorLevels: {},
    recentErrors: [],
    timestamp: new Date().toISOString()
  };

  static configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static startMonitoring(): void {
    if (!this.config.enableErrorMonitoring) return;

    // Monitor unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        type: 'unhandled',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason, {
        type: 'unhandledrejection'
      });
    });
  }

  static trackError(error: Error, context?: Record<string, unknown>): void {
    if (!this.config.enableErrorMonitoring) return;

    const errorData = {
      id: `error_${Date.now()}_${Math.random()}`,
      type: error.constructor.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context
    };

    this.metrics.totalErrors++;
    this.metrics.errorTypes[errorData.type] = (this.metrics.errorTypes[errorData.type] || 0) + 1;
    this.metrics.errorSources[context?.type as string || 'unknown'] =
      (this.metrics.errorSources[context?.type as string || 'unknown'] || 0) + 1;
    this.metrics.errorLevels['high'] = (this.metrics.errorLevels['high'] || 0) + 1;

    this.metrics.recentErrors.push(errorData);
    if (this.metrics.recentErrors.length > 100) {
      this.metrics.recentErrors = this.metrics.recentErrors.slice(-100);
    }

    this.metrics.timestamp = new Date().toISOString();
  }

  static getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  static getRecentErrors(): ErrorMetrics['recentErrors'] {
    return [...this.metrics.recentErrors];
  }
}

// User Analytics
export class UserAnalytics {
  private static config: MonitoringConfig = {
    enableUserAnalytics: true,
    samplingRate: 1.0,
    batchSize: 100,
    flushInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000
  };

  private static metrics: UserMetrics = {
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    userEngagement: 0,
    userRetention: 0,
    userSessions: 0,
    averageSessionDuration: 0,
    userActions: {},
    userPaths: [],
    timestamp: new Date().toISOString()
  };

  private static currentSession: {
    id: string;
    startTime: number;
    actions: number;
    pages: string[];
  } | null = null;

  static configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static startSession(): void {
    if (!this.config.enableUserAnalytics) return;

    this.currentSession = {
      id: `session_${Date.now()}_${Math.random()}`,
      startTime: Date.now(),
      actions: 0,
      pages: []
    };

    this.metrics.userSessions++;
    this.metrics.activeUsers++;
  }

  static endSession(): void {
    if (!this.currentSession) return;

    const duration = Date.now() - this.currentSession.startTime;
    this.metrics.averageSessionDuration =
      (this.metrics.averageSessionDuration + duration) / 2;

    this.currentSession = null;
    this.metrics.activeUsers = Math.max(0, this.metrics.activeUsers - 1);
  }

  static trackUserAction(action: string, properties?: Record<string, unknown>): void {
    if (!this.config.enableUserAnalytics || !this.currentSession) return;

    this.currentSession.actions++;
    this.metrics.userActions[action] = (this.metrics.userActions[action] || 0) + 1;
  }

  static trackPageView(page: string, properties?: Record<string, unknown>): void {
    if (!this.config.enableUserAnalytics || !this.currentSession) return;

    this.currentSession.pages.push(page);

    const existingPath = this.metrics.userPaths.find(p => p.path === page);
    if (existingPath) {
      existingPath.count++;
    } else {
      this.metrics.userPaths.push({
        path: page,
        count: 1,
        averageTime: 0
      });
    }
  }

  static trackUser(userId: string, properties?: Record<string, unknown>): void {
    if (!this.config.enableUserAnalytics) return;

    this.metrics.totalUsers++;
    this.metrics.newUsers++;
  }

  static getMetrics(): UserMetrics {
    return { ...this.metrics };
  }

  static getCurrentSession(): typeof this.currentSession {
    return this.currentSession;
  }
}

// API Monitoring
export class ApiMonitor {
  private static config: MonitoringConfig = {
    enableApiMonitoring: true,
    samplingRate: 1.0,
    batchSize: 100,
    flushInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000
  };

  private static metrics: ApiMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    responseTimes: [],
    statusCodes: {},
    endpoints: {},
    timestamp: new Date().toISOString()
  };

  static configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static startMonitoring(): void {
    if (!this.config.enableApiMonitoring) return;

    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const url = args[0] as string;
      const method = args[1]?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const end = performance.now();
        const duration = end - start;

        this.trackRequest(url, method, duration, response.status);
        return response;
      } catch (error) {
        const end = performance.now();
        const duration = end - start;

        this.trackRequest(url, method, duration, 500);
        throw error;
      }
    };
  }

  static trackRequest(endpoint: string, method: string, duration: number, status: number): void {
    if (!this.config.enableApiMonitoring) return;

    this.metrics.totalRequests++;
    this.metrics.responseTimes.push(duration);

    if (status >= 200 && status < 300) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    this.metrics.statusCodes[status] = (this.metrics.statusCodes[status] || 0) + 1;

    const endpointKey = `${method} ${endpoint}`;
    if (!this.metrics.endpoints[endpointKey]) {
      this.metrics.endpoints[endpointKey] = {
        requests: 0,
        averageResponseTime: 0,
        errorRate: 0
      };
    }

    const endpointMetrics = this.metrics.endpoints[endpointKey];
    endpointMetrics.requests++;
    endpointMetrics.averageResponseTime =
      (endpointMetrics.averageResponseTime + duration) / 2;
    endpointMetrics.errorRate =
      (this.metrics.failedRequests / this.metrics.totalRequests) * 100;

    // Update average response time
    this.metrics.averageResponseTime =
      this.metrics.responseTimes.reduce((a, b) => a + b, 0) /
      this.metrics.responseTimes.length;

    // Keep only last 1000 response times
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes = this.metrics.responseTimes.slice(-1000);
    }

    this.metrics.timestamp = new Date().toISOString();
  }

  static getMetrics(): ApiMetrics {
    return { ...this.metrics };
  }

  static getEndpointMetrics(endpoint: string): ApiMetrics['endpoints'][string] | undefined {
    return this.metrics.endpoints[endpoint];
  }
}

// Database Monitoring
export class DatabaseMonitor {
  private static config: MonitoringConfig = {
    enableDatabaseMonitoring: true,
    samplingRate: 1.0,
    batchSize: 100,
    flushInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000
  };

  private static metrics: DatabaseMetrics = {
    totalQueries: 0,
    averageQueryTime: 0,
    slowQueries: 0,
    queryTypes: {},
    connectionPool: {
      active: 0,
      idle: 0,
      total: 0
    },
    timestamp: new Date().toISOString()
  };

  static configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static trackQuery(query: string, duration: number, result: 'success' | 'error'): void {
    if (!this.config.enableDatabaseMonitoring) return;

    this.metrics.totalQueries++;

    if (duration > 1000) { // Slow query threshold
      this.metrics.slowQueries++;
    }

    const queryType = this.getQueryType(query);
    this.metrics.queryTypes[queryType] = (this.metrics.queryTypes[queryType] || 0) + 1;

    // Update average query time
    this.metrics.averageQueryTime =
      (this.metrics.averageQueryTime + duration) / 2;

    this.metrics.timestamp = new Date().toISOString();
  }

  static updateConnectionPool(active: number, idle: number, total: number): void {
    if (!this.config.enableDatabaseMonitoring) return;

    this.metrics.connectionPool = { active, idle, total };
    this.metrics.timestamp = new Date().toISOString();
  }

  private static getQueryType(query: string): string {
    const trimmedQuery = query.trim().toUpperCase();
    if (trimmedQuery.startsWith('SELECT')) return 'SELECT';
    if (trimmedQuery.startsWith('INSERT')) return 'INSERT';
    if (trimmedQuery.startsWith('UPDATE')) return 'UPDATE';
    if (trimmedQuery.startsWith('DELETE')) return 'DELETE';
    return 'OTHER';
  }

  static getMetrics(): DatabaseMetrics {
    return { ...this.metrics };
  }
}

// Cache Monitoring
export class CacheMonitor {
  private static config: MonitoringConfig = {
    enableCacheMonitoring: true,
    samplingRate: 1.0,
    batchSize: 100,
    flushInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000
  };

  private static metrics: CacheMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    averageResponseTime: 0,
    cacheSize: 0,
    evictions: 0,
    timestamp: new Date().toISOString()
  };

  static configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static trackCacheRequest(key: string, hit: boolean, duration: number): void {
    if (!this.config.enableCacheMonitoring) return;

    this.metrics.totalRequests++;

    if (hit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    this.metrics.hitRate = (this.metrics.cacheHits / this.metrics.totalRequests) * 100;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime + duration) / 2;

    this.metrics.timestamp = new Date().toISOString();
  }

  static updateCacheSize(size: number): void {
    if (!this.config.enableCacheMonitoring) return;

    this.metrics.cacheSize = size;
    this.metrics.timestamp = new Date().toISOString();
  }

  static trackEviction(): void {
    if (!this.config.enableCacheMonitoring) return;

    this.metrics.evictions++;
    this.metrics.timestamp = new Date().toISOString();
  }

  static getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }
}

// Security Monitoring
export class SecurityMonitor {
  private static config: MonitoringConfig = {
    enableSecurityMonitoring: true,
    samplingRate: 1.0,
    batchSize: 100,
    flushInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000
  };

  private static metrics: SecurityMetrics = {
    totalSecurityEvents: 0,
    securityEventTypes: {},
    blockedRequests: 0,
    suspiciousActivities: 0,
    authenticationFailures: 0,
    authorizationFailures: 0,
    timestamp: new Date().toISOString()
  };

  static configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static trackSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    if (!this.config.enableSecurityMonitoring) return;

    this.metrics.totalSecurityEvents++;
    this.metrics.securityEventTypes[event] = (this.metrics.securityEventTypes[event] || 0) + 1;

    if (severity === 'high' || severity === 'critical') {
      this.metrics.suspiciousActivities++;
    }

    this.metrics.timestamp = new Date().toISOString();
  }

  static trackAuthenticationFailure(): void {
    if (!this.config.enableSecurityMonitoring) return;

    this.metrics.authenticationFailures++;
    this.metrics.timestamp = new Date().toISOString();
  }

  static trackAuthorizationFailure(): void {
    if (!this.config.enableSecurityMonitoring) return;

    this.metrics.authorizationFailures++;
    this.metrics.timestamp = new Date().toISOString();
  }

  static trackBlockedRequest(): void {
    if (!this.config.enableSecurityMonitoring) return;

    this.metrics.blockedRequests++;
    this.metrics.timestamp = new Date().toISOString();
  }

  static getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }
}

// Custom Metrics
export class CustomMetrics {
  private static config: MonitoringConfig = {
    enableCustomMetrics: true,
    samplingRate: 1.0,
    batchSize: 100,
    flushInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000
  };

  private static metrics: CustomMetrics = {
    metrics: {},
    timestamp: new Date().toISOString()
  };

  static configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static trackMetric(name: string, value: number, unit: string = ''): void {
    if (!this.config.enableCustomMetrics) return;

    this.metrics.metrics[name] = {
      value,
      unit,
      timestamp: new Date().toISOString()
    };

    this.metrics.timestamp = new Date().toISOString();
  }

  static incrementMetric(name: string, increment: number = 1): void {
    if (!this.config.enableCustomMetrics) return;

    const existing = this.metrics.metrics[name];
    if (existing) {
      existing.value += increment;
      existing.timestamp = new Date().toISOString();
    } else {
      this.metrics.metrics[name] = {
        value: increment,
        unit: '',
        timestamp: new Date().toISOString()
      };
    }

    this.metrics.timestamp = new Date().toISOString();
  }

  static getMetrics(): CustomMetrics {
    return { ...this.metrics };
  }

  static getMetric(name: string): CustomMetrics['metrics'][string] | undefined {
    return this.metrics.metrics[name];
  }
}

// Event Tracker
export class EventTracker implements EventTracker {
  private static config: MonitoringConfig = {
    enableUserAnalytics: true,
    enableErrorMonitoring: true,
    enablePerformanceMonitoring: true,
    enableApiMonitoring: true,
    enableDatabaseMonitoring: true,
    enableCacheMonitoring: true,
    enableSecurityMonitoring: true,
    samplingRate: 1.0,
    batchSize: 100,
    flushInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000
  };

  static configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static track(event: string, properties?: Record<string, unknown>): void {
    if (!this.config.enableUserAnalytics) return;

    UserAnalytics.trackUserAction(event, properties);
  }

  static trackUser(userId: string, properties?: Record<string, unknown>): void {
    if (!this.config.enableUserAnalytics) return;

    UserAnalytics.trackUser(userId, properties);
  }

  static trackPage(page: string, properties?: Record<string, unknown>): void {
    if (!this.config.enableUserAnalytics) return;

    UserAnalytics.trackPageView(page, properties);
  }

  static trackError(error: Error, context?: Record<string, unknown>): void {
    if (!this.config.enableErrorMonitoring) return;

    ErrorMonitor.trackError(error, context);
  }

  static trackPerformance(metrics: PerformanceMetrics): void {
    if (!this.config.enablePerformanceMonitoring) return;

    PerformanceMonitor.updateMetrics(metrics);
  }

  static trackApi(endpoint: string, method: string, duration: number, status: number): void {
    if (!this.config.enableApiMonitoring) return;

    ApiMonitor.trackRequest(endpoint, method, duration, status);
  }

  static trackDatabase(query: string, duration: number, result: 'success' | 'error'): void {
    if (!this.config.enableDatabaseMonitoring) return;

    DatabaseMonitor.trackQuery(query, duration, result);
  }

  static trackCache(key: string, hit: boolean, duration: number): void {
    if (!this.config.enableCacheMonitoring) return;

    CacheMonitor.trackCacheRequest(key, hit, duration);
  }

  static trackSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    if (!this.config.enableSecurityMonitoring) return;

    SecurityMonitor.trackSecurityEvent(event, severity);
  }
}

// Monitoring Manager
export class MonitoringManager {
  private static config: MonitoringConfig = {
    enablePerformanceMonitoring: true,
    enableErrorMonitoring: true,
    enableUserAnalytics: true,
    enableApiMonitoring: true,
    enableDatabaseMonitoring: true,
    enableCacheMonitoring: true,
    enableSecurityMonitoring: true,
    enableCustomMetrics: true,
    samplingRate: 1.0,
    batchSize: 100,
    flushInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000
  };

  static configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };

    // Configure all monitors
    PerformanceMonitor.configure(this.config);
    ErrorMonitor.configure(this.config);
    UserAnalytics.configure(this.config);
    ApiMonitor.configure(this.config);
    DatabaseMonitor.configure(this.config);
    CacheMonitor.configure(this.config);
    SecurityMonitor.configure(this.config);
    CustomMetrics.configure(this.config);
    EventTracker.configure(this.config);
  }

  static startMonitoring(): void {
    PerformanceMonitor.startMonitoring();
    ErrorMonitor.startMonitoring();
    UserAnalytics.startSession();
    ApiMonitor.startMonitoring();
  }

  static stopMonitoring(): void {
    PerformanceMonitor.stopMonitoring();
    UserAnalytics.endSession();
  }

  static getAllMetrics(): MonitoringMetrics {
    return {
      performance: PerformanceMonitor.getMetrics(),
      errors: ErrorMonitor.getMetrics(),
      users: UserAnalytics.getMetrics(),
      api: ApiMonitor.getMetrics(),
      database: DatabaseMonitor.getMetrics(),
      cache: CacheMonitor.getMetrics(),
      security: SecurityMonitor.getMetrics(),
      custom: CustomMetrics.getMetrics()
    };
  }

  static getMetricsByType(type: keyof MonitoringMetrics): MonitoringMetrics[keyof MonitoringMetrics] {
    switch (type) {
      case 'performance':
        return PerformanceMonitor.getMetrics();
      case 'errors':
        return ErrorMonitor.getMetrics();
      case 'users':
        return UserAnalytics.getMetrics();
      case 'api':
        return ApiMonitor.getMetrics();
      case 'database':
        return DatabaseMonitor.getMetrics();
      case 'cache':
        return CacheMonitor.getMetrics();
      case 'security':
        return SecurityMonitor.getMetrics();
      case 'custom':
        return CustomMetrics.getMetrics();
      default:
        throw new Error(`Unknown metrics type: ${type}`);
    }
  }
}

// Export all monitoring utilities
export {
    ApiMonitor, CacheMonitor, CustomMetrics, DatabaseMonitor, ErrorMonitor, EventTracker,
    MonitoringManager, PerformanceMonitor, SecurityMonitor, UserAnalytics
};

