'use client';

/**
 * Comprehensive Error Logging System
 * Advanced logging with structured data, context, and analytics
 */

export interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
  CRITICAL: 4;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: keyof LogLevel;
  message: string;
  context?: LogContext;
  metadata?: Record<string, unknown>;
  tags?: string[];
  userId?: string;
  sessionId?: string;
  requestId?: string;
  source?: string;
  stack?: string;
}

export interface LogContext {
  operation: string;
  component?: string;
  function?: string;
  file?: string;
  line?: number;
  column?: number;
  environment?: string;
  version?: string;
  buildId?: string;
}

export interface LogFilter {
  level?: keyof LogLevel;
  userId?: string;
  sessionId?: string;
  source?: string;
  tags?: string[];
  since?: Date;
  until?: Date;
  operation?: string;
  component?: string;
}

export interface LogMetrics {
  totalLogs: number;
  logsByLevel: Record<keyof LogLevel, number>;
  logsBySource: Record<string, number>;
  logsByUser: Record<string, number>;
  logsByOperation: Record<string, number>;
  averageLogsPerMinute: number;
  errorRate: number;
  criticalErrorRate: number;
}

// Structured Logger
export class StructuredLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 50000;
  private currentLevel: keyof LogLevel = 'INFO';
  private context: Partial<LogContext> = {};
  private userId?: string;
  private sessionId?: string;
  private requestId?: string;
  private tags: string[] = [];

  private readonly LOG_LEVELS: LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4
  };

  constructor(options: {
    maxLogs?: number;
    defaultLevel?: keyof LogLevel;
    context?: Partial<LogContext>;
  } = {}) {
    this.maxLogs = options.maxLogs || 50000;
    this.currentLevel = options.defaultLevel || 'INFO';
    this.context = options.context || {};
  }

  setLevel(level: keyof LogLevel): void {
    this.currentLevel = level;
  }

  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  setUser(userId: string, sessionId?: string): void {
    this.userId = userId;
    this.sessionId = sessionId;
  }

  setRequest(requestId: string): void {
    this.requestId = requestId;
  }

  addTags(tags: string[]): void {
    this.tags = [...this.tags, ...tags];
  }

  debug(message: string, metadata?: Record<string, unknown>, tags?: string[]): void {
    this.log('DEBUG', message, metadata, tags);
  }

  info(message: string, metadata?: Record<string, unknown>, tags?: string[]): void {
    this.log('INFO', message, metadata, tags);
  }

  warn(message: string, metadata?: Record<string, unknown>, tags?: string[]): void {
    this.log('WARN', message, metadata, tags);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>, tags?: string[]): void {
    const errorMetadata = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: (error as any).cause
      } : undefined
    };
    this.log('ERROR', message, errorMetadata, tags);
  }

  critical(message: string, error?: Error, metadata?: Record<string, unknown>, tags?: string[]): void {
    const errorMetadata = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: (error as any).cause
      } : undefined
    };
    this.log('CRITICAL', message, errorMetadata, tags);
  }

  private log(
    level: keyof LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    tags?: string[]
  ): void {
    if (this.LOG_LEVELS[level] < this.LOG_LEVELS[this.currentLevel]) {
      return;
    }

    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      context: this.context,
      metadata,
      tags: tags ? [...this.tags, ...tags] : this.tags,
      userId: this.userId,
      sessionId: this.sessionId,
      requestId: this.requestId,
      source: this.getSource(),
      stack: level === 'ERROR' || level === 'CRITICAL' ? this.getStackTrace() : undefined
    };

    this.logs.push(logEntry);

    // Maintain log size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output to console
    this.outputToConsole(logEntry);

    // Send to external services
    this.sendToExternalServices(logEntry);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSource(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';

    const lines = stack.split('\n');
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('at ') && !line.includes('node_modules')) {
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
        if (match) {
          return `${match[2]}:${match[3]}:${match[4]}`;
        }
      }
    }

    return 'unknown';
  }

  private getStackTrace(): string {
    const error = new Error();
    return error.stack || '';
  }

  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const level = logEntry.level.padEnd(8);
    const message = logEntry.message;
    const context = logEntry.context?.operation ? `[${logEntry.context.operation}]` : '';
    const tags = logEntry.tags?.length ? `[${logEntry.tags.join(',')}]` : '';

    const logMessage = `${timestamp} ${level} ${context} ${tags} ${message}`;

    switch (logEntry.level) {
      case 'DEBUG':
        console.debug(logMessage, logEntry.metadata);
        break;
      case 'INFO':
        console.info(logMessage, logEntry.metadata);
        break;
      case 'WARN':
        console.warn(logMessage, logEntry.metadata);
        break;
      case 'ERROR':
      case 'CRITICAL':
        console.error(logMessage, logEntry.metadata);
        if (logEntry.stack) {
          console.error(logEntry.stack);
        }
        break;
    }
  }

  private async sendToExternalServices(logEntry: LogEntry): Promise<void> {
    try {
      // Send to Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        if (logEntry.level === 'ERROR' || logEntry.level === 'CRITICAL') {
          (window as any).gtag('event', 'exception', {
            description: logEntry.message,
            fatal: logEntry.level === 'CRITICAL'
          });
        }
      }

      // Send to custom logging endpoint
      if (logEntry.level === 'ERROR' || logEntry.level === 'CRITICAL') {
        await this.sendToLoggingEndpoint(logEntry);
      }
    } catch (error) {
      // Don't let external service errors break logging
      console.error('Failed to send log to external service:', error);
    }
  }

  private async sendToLoggingEndpoint(logEntry: LogEntry): Promise<void> {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...logEntry,
          timestamp: logEntry.timestamp.toISOString()
        })
      });
    } catch {
      // Ignore network errors
    }
  }

  // Query methods
  getLogs(filter?: LogFilter): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.userId) {
      filtered = filtered.filter(log => log.userId === filter.userId);
    }

    if (filter?.sessionId) {
      filtered = filtered.filter(log => log.sessionId === filter.sessionId);
    }

    if (filter?.source) {
      filtered = filtered.filter(log => log.source?.includes(filter.source!));
    }

    if (filter?.tags?.length) {
      filtered = filtered.filter(log =>
        filter.tags!.some(tag => log.tags?.includes(tag))
      );
    }

    if (filter?.since) {
      filtered = filtered.filter(log => log.timestamp >= filter.since!);
    }

    if (filter?.until) {
      filtered = filtered.filter(log => log.timestamp <= filter.until!);
    }

    if (filter?.operation) {
      filtered = filtered.filter(log => log.context?.operation === filter.operation);
    }

    if (filter?.component) {
      filtered = filtered.filter(log => log.context?.component === filter.component);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getLogById(id: string): LogEntry | undefined {
    return this.logs.find(log => log.id === id);
  }

  getMetrics(): LogMetrics {
    const totalLogs = this.logs.length;
    const logsByLevel: Record<keyof LogLevel, number> = {
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      CRITICAL: 0
    };

    const logsBySource: Record<string, number> = {};
    const logsByUser: Record<string, number> = {};
    const logsByOperation: Record<string, number> = {};

    let errorCount = 0;
    let criticalCount = 0;

    for (const log of this.logs) {
      logsByLevel[log.level]++;

      if (log.source) {
        logsBySource[log.source] = (logsBySource[log.source] || 0) + 1;
      }

      if (log.userId) {
        logsByUser[log.userId] = (logsByUser[log.userId] || 0) + 1;
      }

      if (log.context?.operation) {
        logsByOperation[log.context.operation] = (logsByOperation[log.context.operation] || 0) + 1;
      }

      if (log.level === 'ERROR') errorCount++;
      if (log.level === 'CRITICAL') criticalCount++;
    }

    // Calculate average logs per minute
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const recentLogs = this.logs.filter(log => log.timestamp >= oneMinuteAgo);
    const averageLogsPerMinute = recentLogs.length;

    return {
      totalLogs,
      logsByLevel,
      logsBySource,
      logsByUser,
      logsByOperation,
      averageLogsPerMinute,
      errorRate: totalLogs > 0 ? errorCount / totalLogs : 0,
      criticalErrorRate: totalLogs > 0 ? criticalCount / totalLogs : 0
    };
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }

    // CSV format
    const headers = ['id', 'timestamp', 'level', 'message', 'userId', 'sessionId', 'requestId', 'source', 'operation'];
    const rows = this.logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.level,
      log.message.replace(/"/g, '""'),
      log.userId || '',
      log.sessionId || '',
      log.requestId || '',
      log.source || '',
      log.context?.operation || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  clearLogs(): void {
    this.logs = [];
  }

  // Performance monitoring
  timeOperation<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    this.debug(`Starting operation: ${operation}`);

    try {
      const result = fn();
      const duration = performance.now() - start;
      this.info(`Completed operation: ${operation}`, { duration: `${duration.toFixed(2)}ms` });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`Failed operation: ${operation}`, error as Error, { duration: `${duration.toFixed(2)}ms` });
      throw error;
    }
  }

  async timeAsyncOperation<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    this.debug(`Starting async operation: ${operation}`);

    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.info(`Completed async operation: ${operation}`, { duration: `${duration.toFixed(2)}ms` });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`Failed async operation: ${operation}`, error as Error, { duration: `${duration.toFixed(2)}ms` });
      throw error;
    }
  }
}

// Logger Factory
export class LoggerFactory {
  private static loggers = new Map<string, StructuredLogger>();

  static createLogger(name: string, options?: {
    maxLogs?: number;
    defaultLevel?: keyof LogLevel;
    context?: Partial<LogContext>;
  }): StructuredLogger {
    if (this.loggers.has(name)) {
      return this.loggers.get(name)!;
    }

    const logger = new StructuredLogger(options);
    this.loggers.set(name, logger);
    return logger;
  }

  static getLogger(name: string): StructuredLogger | undefined {
    return this.loggers.get(name);
  }

  static getAllLoggers(): Map<string, StructuredLogger> {
    return new Map(this.loggers);
  }

  static clearAllLoggers(): void {
    for (const logger of this.loggers.values()) {
      logger.clearLogs();
    }
    this.loggers.clear();
  }
}

// Global logger instance
export const logger = LoggerFactory.createLogger('core', {
  defaultLevel: 'INFO',
  context: {
    component: 'core',
    environment: process.env.NODE_ENV || 'development'
  }
});

// React Hook for logging
export function useLogger(component: string) {
  const componentLogger = React.useMemo(() => {
    return LoggerFactory.createLogger(component, {
      context: { component }
    });
  }, [component]);

  return componentLogger;
}
