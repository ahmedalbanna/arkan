/**
 * Simple Telemetry service for tracking system events and failures.
 * In production, this would integrate with Sentry, Logtail, or Google Cloud Logging.
 */
import { performanceMonitor } from "./model-performance-monitor";

export interface TelemetryEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
}

export class Telemetry {
  private static events: TelemetryEvent[] = [];
  private static MAX_BUFFER = 100;

  public static logFailure(context: string, error: any, extra?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    const event: TelemetryEvent = {
      name: `FAILURE_${context}`,
      level: 'error',
      timestamp,
      properties: {
        message,
        stack,
        ...extra,
        ...(typeof window === 'undefined' ? performanceMonitor.getActiveRequestCounts() : {})
      }
    };

    this.recordEvent(event);
    console.error(`[TELEMETRY ERROR] [${timestamp}] [${context}]:`, message, extra || '');
  }

  public static logEvent(name: string, properties?: Record<string, any>, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const event: TelemetryEvent = {
      name,
      level,
      timestamp,
      properties: {
        ...properties,
        ...(typeof window === 'undefined' ? performanceMonitor.getActiveRequestCounts() : {})
      }
    };

    this.recordEvent(event);
    if (level === 'error') {
      console.error(`[TELEMETRY ${level.toUpperCase()}] [${timestamp}] [${name}]:`, properties);
    } else {
      console.log(`[TELEMETRY ${level.toUpperCase()}] [${timestamp}] [${name}]:`, properties);
    }
  }

  private static recordEvent(event: TelemetryEvent): void {
    this.events.push(event);
    if (this.events.length > this.MAX_BUFFER) {
      this.events.shift();
    }
  }

  public static getRecentEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  public static generateHealthSummary(): Record<string, any> {
    const recent = this.events.slice(-20);
    const errors = recent.filter(e => e.level === 'error').length;
    
    return {
      status: errors > 5 ? 'unhealthy' : errors > 0 ? 'degraded' : 'healthy',
      recentErrorCount: errors,
      activeRequests: performanceMonitor.getActiveRequestCounts(),
      uptime: process.uptime()
    };
  }
}
