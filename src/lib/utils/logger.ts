/**
 * Centralized logging utility
 * Replaces console.log statements throughout the application
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  private send(entry: LogEntry): void {
    if (this.isDevelopment) {
      const consoleMethod = entry.level === 'error' ? console.error : 
                           entry.level === 'warn' ? console.warn : 
                           console.log;
      
      if (entry.data) {
        consoleMethod(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.data);
      } else {
        consoleMethod(`[${entry.level.toUpperCase()}] ${entry.message}`);
      }
    } else {
      // In production, send to external logging service (Sentry, LogRocket, etc.)
      // For now, only log errors to console
      if (entry.level === 'error') {
        console.error(entry.message, entry.data);
      }
    }
  }

  info(message: string, data?: unknown): void {
    this.send(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: unknown): void {
    this.send(this.formatMessage('warn', message, data));
  }

  error(message: string, data?: unknown): void {
    this.send(this.formatMessage('error', message, data));
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.send(this.formatMessage('debug', message, data));
    }
  }
}

export const logger = new Logger();
