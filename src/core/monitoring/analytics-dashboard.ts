/**
 * Analytics Dashboard and Reporting System
 * Comprehensive analytics dashboard and reporting capabilities
 */

import { ApiMetrics, ErrorMetrics, MonitoringMetrics, PerformanceMetrics, UserMetrics } from './monitoring-system';

// Dashboard Types
export interface DashboardConfig {
  refreshInterval?: number;
  maxDataPoints?: number;
  enableRealTime?: boolean;
  enableHistoricalData?: boolean;
  enableExport?: boolean;
  enableAlerts?: boolean;
  theme?: 'light' | 'dark';
  layout?: 'grid' | 'list' | 'custom';
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'alert' | 'custom';
  data: any;
  config: WidgetConfig;
  position: { x: number; y: number; width: number; height: number };
  refreshInterval?: number;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  colors?: string[];
  thresholds?: Array<{
    value: number;
    color: string;
    label: string;
  }>;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'slack' | 'sms';
  config: Record<string, unknown>;
}

export interface ReportConfig {
  name: string;
  description?: string;
  metrics: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
  recipients: string[];
}

// Dashboard Manager
export class DashboardManager {
  private static config: DashboardConfig = {
    refreshInterval: 30000,
    maxDataPoints: 1000,
    enableRealTime: true,
    enableHistoricalData: true,
    enableExport: true,
    enableAlerts: true,
    theme: 'light',
    layout: 'grid'
  };

  private static widgets: DashboardWidget[] = [];
  private static alertRules: AlertRule[] = [];
  private static reports: ReportConfig[] = [];

  static configure(config: Partial<DashboardConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static addWidget(widget: DashboardWidget): void {
    this.widgets.push(widget);
  }

  static removeWidget(widgetId: string): void {
    this.widgets = this.widgets.filter(w => w.id !== widgetId);
  }

  static updateWidget(widgetId: string, updates: Partial<DashboardWidget>): void {
    const widget = this.widgets.find(w => w.id === widgetId);
    if (widget) {
      Object.assign(widget, updates);
    }
  }

  static getWidgets(): DashboardWidget[] {
    return [...this.widgets];
  }

  static getWidget(widgetId: string): DashboardWidget | undefined {
    return this.widgets.find(w => w.id === widgetId);
  }

  static addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  static removeAlertRule(ruleId: string): void {
    this.alertRules = this.alertRules.filter(r => r.id !== ruleId);
  }

  static getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  static getAlertRule(ruleId: string): AlertRule | undefined {
    return this.alertRules.find(r => r.id === ruleId);
  }

  static addReport(report: ReportConfig): void {
    this.reports.push(report);
  }

  static removeReport(reportName: string): void {
    this.reports = this.reports.filter(r => r.name !== reportName);
  }

  static getReports(): ReportConfig[] {
    return [...this.reports];
  }

  static getReport(reportName: string): ReportConfig | undefined {
    return this.reports.find(r => r.name === reportName);
  }
}

// Performance Dashboard
export class PerformanceDashboard {
  static createPerformanceWidget(): DashboardWidget {
    return {
      id: 'performance-overview',
      title: 'Performance Overview',
      type: 'chart',
      data: {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        performanceScore: 0
      },
      config: {
        chartType: 'line',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
        thresholds: [
          { value: 1800, color: '#ef4444', label: 'Poor FCP' },
          { value: 1000, color: '#f59e0b', label: 'Needs Improvement' },
          { value: 500, color: '#10b981', label: 'Good FCP' }
        ]
      },
      position: { x: 0, y: 0, width: 6, height: 4 },
      refreshInterval: 5000
    };
  }

  static createMemoryUsageWidget(): DashboardWidget {
    return {
      id: 'memory-usage',
      title: 'Memory Usage',
      type: 'chart',
      data: {
        used: 0,
        total: 0,
        percentage: 0
      },
      config: {
        chartType: 'area',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: ['#3b82f6', '#ef4444'],
        thresholds: [
          { value: 80, color: '#ef4444', label: 'High Memory Usage' },
          { value: 60, color: '#f59e0b', label: 'Medium Memory Usage' },
          { value: 40, color: '#10b981', label: 'Low Memory Usage' }
        ]
      },
      position: { x: 6, y: 0, width: 6, height: 4 },
      refreshInterval: 5000
    };
  }

  static createNetworkPerformanceWidget(): DashboardWidget {
    return {
      id: 'network-performance',
      title: 'Network Performance',
      type: 'chart',
      data: {
        latency: 0,
        throughput: 0,
        errorRate: 0
      },
      config: {
        chartType: 'bar',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: ['#3b82f6', '#10b981', '#ef4444']
      },
      position: { x: 0, y: 4, width: 6, height: 4 },
      refreshInterval: 5000
    };
  }

  static createPerformanceScoreWidget(): DashboardWidget {
    return {
      id: 'performance-score',
      title: 'Performance Score',
      type: 'metric',
      data: {
        score: 0,
        grade: 'A',
        trend: 'up'
      },
      config: {
        thresholds: [
          { value: 90, color: '#10b981', label: 'Excellent' },
          { value: 70, color: '#f59e0b', label: 'Good' },
          { value: 50, color: '#ef4444', label: 'Poor' }
        ]
      },
      position: { x: 6, y: 4, width: 6, height: 4 },
      refreshInterval: 5000
    };
  }
}

// Error Dashboard
export class ErrorDashboard {
  static createErrorOverviewWidget(): DashboardWidget {
    return {
      id: 'error-overview',
      title: 'Error Overview',
      type: 'chart',
      data: {
        totalErrors: 0,
        errorRate: 0,
        errorTypes: {},
        recentErrors: []
      },
      config: {
        chartType: 'pie',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
      },
      position: { x: 0, y: 0, width: 6, height: 4 },
      refreshInterval: 10000
    };
  }

  static createErrorTrendWidget(): DashboardWidget {
    return {
      id: 'error-trend',
      title: 'Error Trend',
      type: 'chart',
      data: {
        errors: [],
        trend: 'up'
      },
      config: {
        chartType: 'line',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: ['#ef4444']
      },
      position: { x: 6, y: 0, width: 6, height: 4 },
      refreshInterval: 10000
    };
  }

  static createErrorTypesWidget(): DashboardWidget {
    return {
      id: 'error-types',
      title: 'Error Types',
      type: 'table',
      data: {
        columns: ['Type', 'Count', 'Rate', 'Trend'],
        rows: []
      },
      config: {
        showLegend: false,
        showGrid: true,
        showTooltip: false
      },
      position: { x: 0, y: 4, width: 12, height: 4 },
      refreshInterval: 10000
    };
  }
}

// User Analytics Dashboard
export class UserAnalyticsDashboard {
  static createUserOverviewWidget(): DashboardWidget {
    return {
      id: 'user-overview',
      title: 'User Overview',
      type: 'metric',
      data: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        userEngagement: 0
      },
      config: {
        thresholds: [
          { value: 1000, color: '#10b981', label: 'High User Count' },
          { value: 500, color: '#f59e0b', label: 'Medium User Count' },
          { value: 100, color: '#ef4444', label: 'Low User Count' }
        ]
      },
      position: { x: 0, y: 0, width: 6, height: 4 },
      refreshInterval: 30000
    };
  }

  static createUserEngagementWidget(): DashboardWidget {
    return {
      id: 'user-engagement',
      title: 'User Engagement',
      type: 'chart',
      data: {
        engagement: 0,
        retention: 0,
        sessions: 0,
        averageSessionDuration: 0
      },
      config: {
        chartType: 'bar',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
      },
      position: { x: 6, y: 0, width: 6, height: 4 },
      refreshInterval: 30000
    };
  }

  static createUserPathsWidget(): DashboardWidget {
    return {
      id: 'user-paths',
      title: 'User Paths',
      type: 'chart',
      data: {
        paths: [],
        popularPaths: []
      },
      config: {
        chartType: 'scatter',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      },
      position: { x: 0, y: 4, width: 12, height: 4 },
      refreshInterval: 30000
    };
  }
}

// API Dashboard
export class ApiDashboard {
  static createApiOverviewWidget(): DashboardWidget {
    return {
      id: 'api-overview',
      title: 'API Overview',
      type: 'metric',
      data: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0
      },
      config: {
        thresholds: [
          { value: 1000, color: '#ef4444', label: 'High Response Time' },
          { value: 500, color: '#f59e0b', label: 'Medium Response Time' },
          { value: 100, color: '#10b981', label: 'Low Response Time' }
        ]
      },
      position: { x: 0, y: 0, width: 6, height: 4 },
      refreshInterval: 5000
    };
  }

  static createApiPerformanceWidget(): DashboardWidget {
    return {
      id: 'api-performance',
      title: 'API Performance',
      type: 'chart',
      data: {
        responseTimes: [],
        statusCodes: {},
        endpoints: {}
      },
      config: {
        chartType: 'line',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
      },
      position: { x: 6, y: 0, width: 6, height: 4 },
      refreshInterval: 5000
    };
  }

  static createApiEndpointsWidget(): DashboardWidget {
    return {
      id: 'api-endpoints',
      title: 'API Endpoints',
      type: 'table',
      data: {
        columns: ['Endpoint', 'Method', 'Requests', 'Avg Response Time', 'Error Rate'],
        rows: []
      },
      config: {
        showLegend: false,
        showGrid: true,
        showTooltip: false
      },
      position: { x: 0, y: 4, width: 12, height: 4 },
      refreshInterval: 5000
    };
  }
}

// Report Generator
export class ReportGenerator {
  static generatePerformanceReport(metrics: PerformanceMetrics): string {
    return `
Performance Report
=================
Generated: ${new Date().toISOString()}

Core Web Vitals:
- First Contentful Paint (FCP): ${metrics.fcp.toFixed(2)}ms
- Largest Contentful Paint (LCP): ${metrics.lcp.toFixed(2)}ms
- First Input Delay (FID): ${metrics.fid.toFixed(2)}ms
- Cumulative Layout Shift (CLS): ${metrics.cls.toFixed(4)}

Performance Metrics:
- Response Time: ${metrics.responseTime.toFixed(2)}ms
- Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB
- Network Latency: ${metrics.networkLatency.toFixed(2)}ms
- Frame Rate: ${metrics.frameRate.toFixed(2)}fps
- Performance Score: ${metrics.performanceScore.toFixed(2)}/100

Recommendations:
${this.getPerformanceRecommendations(metrics)}
    `;
  }

  static generateErrorReport(metrics: ErrorMetrics): string {
    return `
Error Report
===========
Generated: ${new Date().toISOString()}

Error Summary:
- Total Errors: ${metrics.totalErrors}
- Error Rate: ${metrics.errorRate.toFixed(2)}%

Error Types:
${Object.entries(metrics.errorTypes).map(([type, count]) =>
  `- ${type}: ${count}`).join('\n')}

Error Sources:
${Object.entries(metrics.errorSources).map(([source, count]) =>
  `- ${source}: ${count}`).join('\n')}

Recent Errors:
${metrics.recentErrors.slice(0, 10).map(error =>
  `- ${error.type}: ${error.message} (${error.timestamp})`).join('\n')}

Recommendations:
${this.getErrorRecommendations(metrics)}
    `;
  }

  static generateUserReport(metrics: UserMetrics): string {
    return `
User Analytics Report
====================
Generated: ${new Date().toISOString()}

User Summary:
- Total Users: ${metrics.totalUsers}
- Active Users: ${metrics.activeUsers}
- New Users: ${metrics.newUsers}
- User Engagement: ${metrics.userEngagement.toFixed(2)}%
- User Retention: ${metrics.userRetention.toFixed(2)}%

Session Metrics:
- Total Sessions: ${metrics.userSessions}
- Average Session Duration: ${metrics.averageSessionDuration.toFixed(2)}ms

Top User Actions:
${Object.entries(metrics.userActions).slice(0, 10).map(([action, count]) =>
  `- ${action}: ${count}`).join('\n')}

Popular User Paths:
${metrics.userPaths.slice(0, 10).map(path =>
  `- ${path.path}: ${path.count} visits (avg ${path.averageTime.toFixed(2)}ms)`).join('\n')}

Recommendations:
${this.getUserRecommendations(metrics)}
    `;
  }

  static generateApiReport(metrics: ApiMetrics): string {
    return `
API Performance Report
=====================
Generated: ${new Date().toISOString()}

API Summary:
- Total Requests: ${metrics.totalRequests}
- Successful Requests: ${metrics.successfulRequests}
- Failed Requests: ${metrics.failedRequests}
- Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms

Status Code Distribution:
${Object.entries(metrics.statusCodes).map(([code, count]) =>
  `- ${code}: ${count}`).join('\n')}

Top Endpoints:
${Object.entries(metrics.endpoints).slice(0, 10).map(([endpoint, data]) =>
  `- ${endpoint}: ${data.requests} requests, ${data.averageResponseTime.toFixed(2)}ms avg, ${data.errorRate.toFixed(2)}% error rate`).join('\n')}

Recommendations:
${this.getApiRecommendations(metrics)}
    `;
  }

  private static getPerformanceRecommendations(metrics: PerformanceMetrics): string {
    const recommendations = [];

    if (metrics.fcp > 1800) {
      recommendations.push('- Optimize First Contentful Paint (FCP) - consider code splitting and lazy loading');
    }

    if (metrics.lcp > 2500) {
      recommendations.push('- Optimize Largest Contentful Paint (LCP) - optimize images and critical resources');
    }

    if (metrics.fid > 100) {
      recommendations.push('- Optimize First Input Delay (FID) - reduce JavaScript execution time');
    }

    if (metrics.cls > 0.1) {
      recommendations.push('- Optimize Cumulative Layout Shift (CLS) - ensure stable layouts');
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push('- Optimize memory usage - check for memory leaks');
    }

    if (metrics.frameRate < 30) {
      recommendations.push('- Optimize frame rate - reduce rendering complexity');
    }

    return recommendations.join('\n') || '- Performance is within acceptable ranges';
  }

  private static getErrorRecommendations(metrics: ErrorMetrics): string {
    const recommendations = [];

    if (metrics.errorRate > 5) {
      recommendations.push('- High error rate detected - investigate error sources');
    }

    const topErrorType = Object.entries(metrics.errorTypes).sort((a, b) => b[1] - a[1])[0];
    if (topErrorType && topErrorType[1] > metrics.totalErrors * 0.3) {
      recommendations.push(`- Focus on reducing ${topErrorType[0]} errors (${topErrorType[1]} occurrences)`);
    }

    if (metrics.recentErrors.length > 50) {
      recommendations.push('- High number of recent errors - check error handling');
    }

    return recommendations.join('\n') || '- Error rates are within acceptable ranges';
  }

  private static getUserRecommendations(metrics: UserMetrics): string {
    const recommendations = [];

    if (metrics.userEngagement < 50) {
      recommendations.push('- Low user engagement - consider improving user experience');
    }

    if (metrics.userRetention < 30) {
      recommendations.push('- Low user retention - analyze user behavior patterns');
    }

    if (metrics.averageSessionDuration < 60000) {
      recommendations.push('- Short session duration - improve content relevance');
    }

    const topAction = Object.entries(metrics.userActions).sort((a, b) => b[1] - a[1])[0];
    if (topAction) {
      recommendations.push(`- Focus on optimizing ${topAction[0]} (${topAction[1]} actions)`);
    }

    return recommendations.join('\n') || '- User metrics are within acceptable ranges';
  }

  private static getApiRecommendations(metrics: ApiMetrics): string {
    const recommendations = [];

    if (metrics.averageResponseTime > 1000) {
      recommendations.push('- High average response time - optimize API performance');
    }

    const errorRate = (metrics.failedRequests / metrics.totalRequests) * 100;
    if (errorRate > 5) {
      recommendations.push('- High error rate - investigate API errors');
    }

    const slowEndpoints = Object.entries(metrics.endpoints)
      .filter(([_, data]) => data.averageResponseTime > 1000);

    if (slowEndpoints.length > 0) {
      recommendations.push(`- Slow endpoints detected: ${slowEndpoints.map(([endpoint]) => endpoint).join(', ')}`);
    }

    return recommendations.join('\n') || '- API performance is within acceptable ranges';
  }
}

// Alert Manager
export class AlertManager {
  private static alerts: Array<{
    id: string;
    rule: AlertRule;
    triggered: boolean;
    timestamp: string;
    value: number;
  }> = [];

  static checkAlerts(metrics: MonitoringMetrics): void {
    const rules = DashboardManager.getAlertRules();

    rules.forEach(rule => {
      if (!rule.enabled) return;

      const value = this.getMetricValue(metrics, rule.metric);
      if (value === undefined) return;

      const triggered = this.evaluateCondition(value, rule.condition, rule.threshold);

      if (triggered) {
        this.triggerAlert(rule, value);
      }
    });
  }

  private static getMetricValue(metrics: MonitoringMetrics, metric: string): number | undefined {
    const parts = metric.split('.');
    let value: any = metrics;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return typeof value === 'number' ? value : undefined;
  }

  private static evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      default:
        return false;
    }
  }

  private static triggerAlert(rule: AlertRule, value: number): void {
    const alert = {
      id: `alert_${Date.now()}_${Math.random()}`,
      rule,
      triggered: true,
      timestamp: new Date().toISOString(),
      value
    };

    this.alerts.push(alert);

    // Execute alert actions
    rule.actions.forEach(action => {
      this.executeAlertAction(action, alert);
    });
  }

  private static executeAlertAction(action: AlertAction, alert: any): void {
    switch (action.type) {
      case 'email':
        this.sendEmailAlert(action.config, alert);
        break;
      case 'webhook':
        this.sendWebhookAlert(action.config, alert);
        break;
      case 'slack':
        this.sendSlackAlert(action.config, alert);
        break;
      case 'sms':
        this.sendSMSAlert(action.config, alert);
        break;
    }
  }

  private static sendEmailAlert(config: Record<string, unknown>, alert: any): void {
    // Mock email sending
    console.log('Email Alert:', {
      to: config.to,
      subject: `Alert: ${alert.rule.name}`,
      body: `Alert triggered: ${alert.rule.metric} ${alert.rule.condition} ${alert.rule.threshold} (actual: ${alert.value})`
    });
  }

  private static sendWebhookAlert(config: Record<string, unknown>, alert: any): void {
    // Mock webhook sending
    console.log('Webhook Alert:', {
      url: config.url,
      data: {
        alert: alert.rule.name,
        metric: alert.rule.metric,
        value: alert.value,
        threshold: alert.rule.threshold,
        timestamp: alert.timestamp
      }
    });
  }

  private static sendSlackAlert(config: Record<string, unknown>, alert: any): void {
    // Mock Slack sending
    console.log('Slack Alert:', {
      channel: config.channel,
      message: `🚨 Alert: ${alert.rule.name} - ${alert.rule.metric} ${alert.rule.condition} ${alert.rule.threshold} (actual: ${alert.value})`
    });
  }

  private static sendSMSAlert(config: Record<string, unknown>, alert: any): void {
    // Mock SMS sending
    console.log('SMS Alert:', {
      to: config.to,
      message: `Alert: ${alert.rule.name} - ${alert.rule.metric} ${alert.rule.condition} ${alert.rule.threshold} (actual: ${alert.value})`
    });
  }

  static getAlerts(): typeof this.alerts {
    return [...this.alerts];
  }

  static clearAlerts(): void {
    this.alerts = [];
  }
}

// Export all dashboard utilities
export {
    AlertManager, ApiDashboard, DashboardManager, ErrorDashboard, PerformanceDashboard, ReportGenerator, UserAnalyticsDashboard
};

