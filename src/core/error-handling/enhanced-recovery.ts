/**
 * Enhanced Error Recovery System
 * Provides intelligent error recovery mechanisms and user-friendly error handling
 */

export interface ErrorRecoveryStrategy {
  name: string;
  canHandle(error: Error): boolean;
  recover(error: Error, context?: ErrorContext): Promise<RecoveryResult>;
  priority: number; // Higher number = higher priority
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface RecoveryResult {
  success: boolean;
  recoveredData?: any;
  fallbackAction?: string;
  message: string;
  retryAfter?: number;
  requiresUserAction?: boolean;
}

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  enableFallback?: boolean;
  logRecovery?: boolean;
  notifyUser?: boolean;
}

// Network Error Recovery
export class NetworkErrorRecovery implements ErrorRecoveryStrategy {
  name = 'network-error-recovery';
  priority = 10;

  canHandle(error: Error): boolean {
    return error.message.includes('network') ||
           error.message.includes('timeout') ||
           error.message.includes('fetch') ||
           error.name === 'NetworkError';
  }

  async recover(error: Error, context?: ErrorContext): Promise<RecoveryResult> {
    const retryDelay = this.calculateRetryDelay(error);

    return {
      success: true,
      message: 'Network error detected. Will retry automatically.',
      retryAfter: retryDelay,
      requiresUserAction: false,
      fallbackAction: 'retry'
    };
  }

  private calculateRetryDelay(error: Error): number {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds

    if (error.message.includes('timeout')) {
      return Math.min(baseDelay * 2, maxDelay);
    }

    return baseDelay;
  }
}

// Authentication Error Recovery
export class AuthenticationErrorRecovery implements ErrorRecoveryStrategy {
  name = 'authentication-error-recovery';
  priority = 20;

  canHandle(error: Error): boolean {
    return error.message.includes('unauthorized') ||
           error.message.includes('authentication') ||
           error.message.includes('token') ||
           error.name === 'AuthenticationError';
  }

  async recover(error: Error, context?: ErrorContext): Promise<RecoveryResult> {
    // Try to refresh token
    try {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return {
          success: true,
          message: 'Authentication refreshed successfully.',
          requiresUserAction: false,
          fallbackAction: 'retry'
        };
      }
    } catch (refreshError) {
      // Token refresh failed
    }

    return {
      success: false,
      message: 'Please log in again to continue.',
      requiresUserAction: true,
      fallbackAction: 'redirect-to-login'
    };
  }

  private async refreshToken(): Promise<boolean> {
    try {
      // Implement token refresh logic
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

// Validation Error Recovery
export class ValidationErrorRecovery implements ErrorRecoveryStrategy {
  name = 'validation-error-recovery';
  priority = 5;

  canHandle(error: Error): boolean {
    return error.message.includes('validation') ||
           error.message.includes('invalid') ||
           error.name === 'ValidationError';
  }

  async recover(error: Error, context?: ErrorContext): Promise<RecoveryResult> {
    const suggestions = this.generateSuggestions(error);

    return {
      success: false,
      message: `Please check your input: ${suggestions.join(', ')}`,
      requiresUserAction: true,
      fallbackAction: 'show-validation-errors'
    };
  }

  private generateSuggestions(error: Error): string[] {
    const suggestions: string[] = [];

    if (error.message.includes('email')) {
      suggestions.push('Please enter a valid email address');
    }

    if (error.message.includes('password')) {
      suggestions.push('Password must be at least 8 characters long');
    }

    if (error.message.includes('required')) {
      suggestions.push('Please fill in all required fields');
    }

    return suggestions;
  }
}

// Data Corruption Recovery
export class DataCorruptionRecovery implements ErrorRecoveryStrategy {
  name = 'data-corruption-recovery';
  priority = 15;

  canHandle(error: Error): boolean {
    return error.message.includes('corrupt') ||
           error.message.includes('invalid data') ||
           error.message.includes('parse error');
  }

  async recover(error: Error, context?: ErrorContext): Promise<RecoveryResult> {
    // Try to recover from backup or cache
    const recoveredData = await this.attemptDataRecovery(context);

    if (recoveredData) {
      return {
        success: true,
        recoveredData,
        message: 'Data recovered from backup.',
        requiresUserAction: false,
        fallbackAction: 'use-recovered-data'
      };
    }

    return {
      success: false,
      message: 'Unable to recover data. Please try again or contact support.',
      requiresUserAction: true,
      fallbackAction: 'show-error-message'
    };
  }

  private async attemptDataRecovery(context?: ErrorContext): Promise<any> {
    try {
      // Try to get data from cache
      const cachedData = await this.getCachedData(context);
      if (cachedData) {
        return cachedData;
      }

      // Try to get data from backup
      const backupData = await this.getBackupData(context);
      if (backupData) {
        return backupData;
      }

      return null;
    } catch {
      return null;
    }
  }

  private async getCachedData(context?: ErrorContext): Promise<any> {
    // Implement cache retrieval logic
    return null;
  }

  private async getBackupData(context?: ErrorContext): Promise<any> {
    // Implement backup retrieval logic
    return null;
  }
}

// Error Recovery Manager
export class ErrorRecoveryManager {
  private strategies: ErrorRecoveryStrategy[] = [];
  private recoveryHistory: RecoveryAttempt[] = [];
  private maxHistory = 1000;

  constructor() {
    this.registerDefaultStrategies();
  }

  registerStrategy(strategy: ErrorRecoveryStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  async attemptRecovery(
    error: Error,
    context?: ErrorContext,
    options: ErrorRecoveryOptions = {}
  ): Promise<RecoveryResult> {
    const attempt: RecoveryAttempt = {
      error: error.message,
      context,
      timestamp: new Date(),
      strategies: []
    };

    for (const strategy of this.strategies) {
      if (strategy.canHandle(error)) {
        attempt.strategies.push(strategy.name);

        try {
          const result = await strategy.recover(error, context);

          if (result.success) {
            attempt.success = true;
            attempt.result = result;
            this.recordAttempt(attempt);

            if (options.logRecovery) {
              console.log(`Recovery successful using ${strategy.name}:`, result.message);
            }

            return result;
          }
        } catch (recoveryError) {
          console.error(`Recovery failed for ${strategy.name}:`, recoveryError);
        }
      }
    }

    // No recovery strategy succeeded
    attempt.success = false;
    attempt.result = {
      success: false,
      message: 'No recovery strategy available for this error.',
      requiresUserAction: true,
      fallbackAction: 'show-error-message'
    };

    this.recordAttempt(attempt);
    return attempt.result;
  }

  private registerDefaultStrategies(): void {
    this.registerStrategy(new NetworkErrorRecovery());
    this.registerStrategy(new AuthenticationErrorRecovery());
    this.registerStrategy(new ValidationErrorRecovery());
    this.registerStrategy(new DataCorruptionRecovery());
  }

  private recordAttempt(attempt: RecoveryAttempt): void {
    this.recoveryHistory.push(attempt);

    if (this.recoveryHistory.length > this.maxHistory) {
      this.recoveryHistory = this.recoveryHistory.slice(-this.maxHistory);
    }
  }

  getRecoveryStats(): RecoveryStats {
    const total = this.recoveryHistory.length;
    const successful = this.recoveryHistory.filter(a => a.success).length;
    const byStrategy = new Map<string, number>();

    for (const attempt of this.recoveryHistory) {
      for (const strategy of attempt.strategies) {
        byStrategy.set(strategy, (byStrategy.get(strategy) || 0) + 1);
      }
    }

    return {
      totalAttempts: total,
      successfulRecoveries: successful,
      successRate: total > 0 ? successful / total : 0,
      strategyUsage: Object.fromEntries(byStrategy),
      recentAttempts: this.recoveryHistory.slice(-10)
    };
  }
}

// User-Friendly Error Messages
export class UserFriendlyErrorFormatter {
  private errorMessages = new Map<string, string>();

  constructor() {
    this.initializeDefaultMessages();
  }

  formatError(error: Error, context?: ErrorContext): UserFriendlyError {
    const errorKey = this.getErrorKey(error);
    const userMessage = this.errorMessages.get(errorKey) || this.getGenericMessage(error);

    return {
      title: this.getErrorTitle(error),
      message: userMessage,
      severity: this.getErrorSeverity(error),
      action: this.getSuggestedAction(error),
      technicalDetails: this.getTechnicalDetails(error, context),
      helpUrl: this.getHelpUrl(error)
    };
  }

  private initializeDefaultMessages(): void {
    this.errorMessages.set('network-error', 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.');
    this.errorMessages.set('authentication-error', 'Your session has expired. Please log in again to continue.');
    this.errorMessages.set('validation-error', 'Please check your input and try again.');
    this.errorMessages.set('permission-error', 'You don\'t have permission to perform this action.');
    this.errorMessages.set('not-found-error', 'The requested resource could not be found.');
    this.errorMessages.set('server-error', 'Something went wrong on our end. Please try again later.');
    this.errorMessages.set('timeout-error', 'The request is taking longer than expected. Please try again.');
  }

  private getErrorKey(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) return 'network-error';
    if (message.includes('unauthorized') || message.includes('authentication')) return 'authentication-error';
    if (message.includes('validation') || message.includes('invalid')) return 'validation-error';
    if (message.includes('permission') || message.includes('forbidden')) return 'permission-error';
    if (message.includes('not found') || message.includes('404')) return 'not-found-error';
    if (message.includes('timeout')) return 'timeout-error';
    if (message.includes('server') || message.includes('500')) return 'server-error';

    return 'generic-error';
  }

  private getGenericMessage(error: Error): string {
    return 'Something went wrong. Please try again or contact support if the problem persists.';
  }

  private getErrorTitle(error: Error): string {
    const severity = this.getErrorSeverity(error);

    switch (severity) {
      case 'critical':
        return 'Critical Error';
      case 'high':
        return 'Error';
      case 'medium':
        return 'Warning';
      case 'low':
        return 'Notice';
      default:
        return 'Error';
    }
  }

  private getErrorSeverity(error: Error): 'critical' | 'high' | 'medium' | 'low' {
    const message = error.message.toLowerCase();

    if (message.includes('critical') || message.includes('fatal')) return 'critical';
    if (message.includes('unauthorized') || message.includes('permission')) return 'high';
    if (message.includes('validation') || message.includes('invalid')) return 'medium';

    return 'high';
  }

  private getSuggestedAction(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('network')) return 'Check your internet connection';
    if (message.includes('unauthorized')) return 'Log in again';
    if (message.includes('validation')) return 'Check your input';
    if (message.includes('permission')) return 'Contact your administrator';
    if (message.includes('not found')) return 'Check the URL or try again later';
    if (message.includes('timeout')) return 'Try again in a moment';

    return 'Try again or contact support';
  }

  private getTechnicalDetails(error: Error, context?: ErrorContext): string {
    const details = [`Error: ${error.message}`];

    if (error.stack) {
      details.push(`Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
    }

    if (context) {
      details.push(`Operation: ${context.operation}`);
      details.push(`Timestamp: ${context.timestamp.toISOString()}`);
    }

    return details.join('\n');
  }

  private getHelpUrl(error: Error): string | undefined {
    const message = error.message.toLowerCase();

    if (message.includes('authentication')) return '/help/authentication';
    if (message.includes('permission')) return '/help/permissions';
    if (message.includes('validation')) return '/help/validation';

    return '/help/errors';
  }
}

// Enhanced Error Logger
export class EnhancedErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 10000;
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'error';

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }

  log(error: Error, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    const log: ErrorLog = {
      id: this.generateId(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: (error as any).cause
      },
      context,
      metadata,
      timestamp: new Date(),
      level: this.determineLogLevel(error),
      resolved: false
    };

    this.logs.push(log);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Send to external logging service if configured
    this.sendToExternalService(log);
  }

  private determineLogLevel(error: Error): 'debug' | 'info' | 'warn' | 'error' {
    const message = error.message.toLowerCase();

    if (message.includes('critical') || message.includes('fatal')) return 'error';
    if (message.includes('warning')) return 'warn';
    if (message.includes('info')) return 'info';

    return 'error';
  }

  private async sendToExternalService(log: ErrorLog): Promise<void> {
    try {
      // Send to external logging service (e.g., Sentry, LogRocket, etc.)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: log.error.message,
          fatal: log.level === 'error'
        });
      }
    } catch {
      // Ignore external service errors
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getLogs(filter?: {
    level?: 'debug' | 'info' | 'warn' | 'error';
    resolved?: boolean;
    since?: Date;
  }): ErrorLog[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.resolved !== undefined) {
      filtered = filtered.filter(log => log.resolved === filter.resolved);
    }

    if (filter?.since) {
      filtered = filtered.filter(log => log.timestamp >= filter.since!);
    }

    return filtered;
  }

  markAsResolved(logId: string): void {
    const log = this.logs.find(l => l.id === logId);
    if (log) {
      log.resolved = true;
    }
  }

  getErrorStats(): ErrorStats {
    const total = this.logs.length;
    const byLevel = new Map<string, number>();
    const byError = new Map<string, number>();
    const resolved = this.logs.filter(l => l.resolved).length;

    for (const log of this.logs) {
      byLevel.set(log.level, (byLevel.get(log.level) || 0) + 1);
      byError.set(log.error.name, (byError.get(log.error.name) || 0) + 1);
    }

    return {
      total,
      resolved,
      unresolved: total - resolved,
      byLevel: Object.fromEntries(byLevel),
      byError: Object.fromEntries(byError),
      resolutionRate: total > 0 ? resolved / total : 0
    };
  }
}

// Type definitions
export interface RecoveryAttempt {
  error: string;
  context?: ErrorContext;
  timestamp: Date;
  strategies: string[];
  success: boolean;
  result?: RecoveryResult;
}

export interface RecoveryStats {
  totalAttempts: number;
  successfulRecoveries: number;
  successRate: number;
  strategyUsage: Record<string, number>;
  recentAttempts: RecoveryAttempt[];
}

export interface UserFriendlyError {
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  technicalDetails: string;
  helpUrl?: string;
}

export interface ErrorLog {
  id: string;
  error: {
    name: string;
    message: string;
    stack?: string;
    cause?: any;
  };
  context?: ErrorContext;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  resolved: boolean;
}

export interface ErrorStats {
  total: number;
  resolved: number;
  unresolved: number;
  byLevel: Record<string, number>;
  byError: Record<string, number>;
  resolutionRate: number;
}

// Global instances
export const errorRecoveryManager = new ErrorRecoveryManager();
export const userFriendlyErrorFormatter = new UserFriendlyErrorFormatter();
export const enhancedErrorLogger = new EnhancedErrorLogger();
