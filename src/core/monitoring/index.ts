/**
 * Monitoring and Analytics Index
 * Centralized exports for the monitoring and analytics system
 */

// Monitoring System
export {
    ApiMonitor, CacheMonitor, CustomMetrics, DatabaseMonitor, ErrorMonitor, EventTracker,
    MonitoringManager, PerformanceMonitor, SecurityMonitor, UserAnalytics, type ApiMetrics, type CacheMetrics, type CustomMetrics, type DatabaseMetrics, type ErrorMetrics, type EventData,
    type EventTracker, type MonitoringConfig,
    type MonitoringMetrics,
    type PerformanceMetrics, type SecurityMetrics, type UserMetrics
} from './monitoring-system';

// Analytics Dashboard
export {
    AlertManager, ApiDashboard, DashboardManager, ErrorDashboard, PerformanceDashboard, ReportGenerator, UserAnalyticsDashboard, type AlertAction, type AlertRule, type DashboardConfig,
    type DashboardWidget, type ReportConfig, type WidgetConfig
} from './analytics-dashboard';

// Monitoring Hooks
export {
    useAlerts, useApiMonitoring, useCacheMonitoring, useCustomMetrics, useDashboard, useDatabaseMonitoring, useErrorMonitoring, useEventTracking, useMonitoring,
    usePerformanceMonitoring, useReports, useSecurityMonitoring, useUserAnalytics
} from './monitoring-hooks';

// Monitoring Utilities
export {
    AlertUtils, ApiUtils, CacheUtils, CustomUtils, DashboardUtils, DatabaseUtils, ErrorUtils, EventUtils, MonitoringUtils,
    PerformanceUtils, ReportUtils, SecurityUtils, UserUtils
} from './monitoring-utils';

// Monitoring Configuration
export const DEFAULT_MONITORING_CONFIG = {
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

export const DEFAULT_DASHBOARD_CONFIG = {
  refreshInterval: 30000,
  maxDataPoints: 1000,
  enableRealTime: true,
  enableHistoricalData: true,
  enableExport: true,
  enableAlerts: true,
  theme: 'light',
  layout: 'grid'
};

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  fcp: {
    good: 1000,
    needsImprovement: 1800,
    poor: 3000
  },
  lcp: {
    good: 2500,
    needsImprovement: 4000,
    poor: 6000
  },
  fid: {
    good: 100,
    needsImprovement: 300,
    poor: 500
  },
  cls: {
    good: 0.1,
    needsImprovement: 0.25,
    poor: 0.5
  },
  ttfb: {
    good: 600,
    needsImprovement: 1000,
    poor: 2000
  },
  responseTime: {
    good: 200,
    needsImprovement: 500,
    poor: 1000
  },
  memoryUsage: {
    good: 50,
    needsImprovement: 100,
    poor: 200
  },
  networkLatency: {
    good: 100,
    needsImprovement: 300,
    poor: 500
  },
  frameRate: {
    good: 60,
    needsImprovement: 30,
    poor: 15
  }
};

// Error Levels
export const ERROR_LEVELS = {
  low: {
    color: '#10b981',
    threshold: 1,
    action: 'log'
  },
  medium: {
    color: '#f59e0b',
    threshold: 5,
    action: 'alert'
  },
  high: {
    color: '#ef4444',
    threshold: 10,
    action: 'escalate'
  },
  critical: {
    color: '#dc2626',
    threshold: 20,
    action: 'emergency'
  }
};

// Security Severity Levels
export const SECURITY_SEVERITY = {
  low: {
    color: '#10b981',
    threshold: 1,
    action: 'log'
  },
  medium: {
    color: '#f59e0b',
    threshold: 3,
    action: 'alert'
  },
  high: {
    color: '#ef4444',
    threshold: 5,
    action: 'escalate'
  },
  critical: {
    color: '#dc2626',
    threshold: 10,
    action: 'emergency'
  }
};

// User Engagement Levels
export const USER_ENGAGEMENT_LEVELS = {
  low: {
    color: '#ef4444',
    threshold: 30,
    action: 'improve'
  },
  medium: {
    color: '#f59e0b',
    threshold: 60,
    action: 'maintain'
  },
  high: {
    color: '#10b981',
    threshold: 80,
    action: 'optimize'
  }
};

// API Performance Levels
export const API_PERFORMANCE_LEVELS = {
  excellent: {
    color: '#10b981',
    threshold: 100,
    action: 'maintain'
  },
  good: {
    color: '#3b82f6',
    threshold: 500,
    action: 'optimize'
  },
  needsImprovement: {
    color: '#f59e0b',
    threshold: 1000,
    action: 'improve'
  },
  poor: {
    color: '#ef4444',
    threshold: 2000,
    action: 'urgent'
  }
};

// Database Performance Levels
export const DATABASE_PERFORMANCE_LEVELS = {
  excellent: {
    color: '#10b981',
    threshold: 10,
    action: 'maintain'
  },
  good: {
    color: '#3b82f6',
    threshold: 50,
    action: 'optimize'
  },
  needsImprovement: {
    color: '#f59e0b',
    threshold: 100,
    action: 'improve'
  },
  poor: {
    color: '#ef4444',
    threshold: 500,
    action: 'urgent'
  }
};

// Cache Performance Levels
export const CACHE_PERFORMANCE_LEVELS = {
  excellent: {
    color: '#10b981',
    threshold: 90,
    action: 'maintain'
  },
  good: {
    color: '#3b82f6',
    threshold: 80,
    action: 'optimize'
  },
  needsImprovement: {
    color: '#f59e0b',
    threshold: 70,
    action: 'improve'
  },
  poor: {
    color: '#ef4444',
    threshold: 60,
    action: 'urgent'
  }
};

// Monitoring Constants
export const MONITORING_CONSTANTS = {
  // Performance
  PERFORMANCE_SAMPLE_RATE: 1.0,
  PERFORMANCE_BATCH_SIZE: 100,
  PERFORMANCE_FLUSH_INTERVAL: 30000,

  // Errors
  ERROR_SAMPLE_RATE: 1.0,
  ERROR_BATCH_SIZE: 100,
  ERROR_FLUSH_INTERVAL: 30000,

  // Users
  USER_SAMPLE_RATE: 1.0,
  USER_BATCH_SIZE: 100,
  USER_FLUSH_INTERVAL: 30000,

  // API
  API_SAMPLE_RATE: 1.0,
  API_BATCH_SIZE: 100,
  API_FLUSH_INTERVAL: 30000,

  // Database
  DATABASE_SAMPLE_RATE: 1.0,
  DATABASE_BATCH_SIZE: 100,
  DATABASE_FLUSH_INTERVAL: 30000,

  // Cache
  CACHE_SAMPLE_RATE: 1.0,
  CACHE_BATCH_SIZE: 100,
  CACHE_FLUSH_INTERVAL: 30000,

  // Security
  SECURITY_SAMPLE_RATE: 1.0,
  SECURITY_BATCH_SIZE: 100,
  SECURITY_FLUSH_INTERVAL: 30000,

  // Custom
  CUSTOM_SAMPLE_RATE: 1.0,
  CUSTOM_BATCH_SIZE: 100,
  CUSTOM_FLUSH_INTERVAL: 30000
};

// Dashboard Constants
export const DASHBOARD_CONSTANTS = {
  // Refresh Intervals
  REFRESH_INTERVAL_PERFORMANCE: 5000,
  REFRESH_INTERVAL_ERRORS: 10000,
  REFRESH_INTERVAL_USERS: 30000,
  REFRESH_INTERVAL_API: 5000,
  REFRESH_INTERVAL_DATABASE: 10000,
  REFRESH_INTERVAL_CACHE: 10000,
  REFRESH_INTERVAL_SECURITY: 10000,
  REFRESH_INTERVAL_CUSTOM: 10000,

  // Data Points
  MAX_DATA_POINTS_PERFORMANCE: 1000,
  MAX_DATA_POINTS_ERRORS: 1000,
  MAX_DATA_POINTS_USERS: 1000,
  MAX_DATA_POINTS_API: 1000,
  MAX_DATA_POINTS_DATABASE: 1000,
  MAX_DATA_POINTS_CACHE: 1000,
  MAX_DATA_POINTS_SECURITY: 1000,
  MAX_DATA_POINTS_CUSTOM: 1000,

  // Widget Sizes
  WIDGET_MIN_WIDTH: 2,
  WIDGET_MIN_HEIGHT: 2,
  WIDGET_MAX_WIDTH: 12,
  WIDGET_MAX_HEIGHT: 8,

  // Grid
  GRID_COLUMNS: 12,
  GRID_ROWS: 8,
  GRID_GAP: 16
};

// Alert Constants
export const ALERT_CONSTANTS = {
  // Alert Types
  ALERT_TYPES: ['email', 'webhook', 'slack', 'sms'],

  // Alert Conditions
  ALERT_CONDITIONS: ['gt', 'lt', 'eq', 'gte', 'lte'],

  // Alert Severities
  ALERT_SEVERITIES: ['low', 'medium', 'high', 'critical'],

  // Alert Actions
  ALERT_ACTIONS: ['log', 'alert', 'escalate', 'emergency'],

  // Alert Thresholds
  ALERT_THRESHOLDS: {
    low: 1,
    medium: 5,
    high: 10,
    critical: 20
  }
};

// Report Constants
export const REPORT_CONSTANTS = {
  // Report Formats
  REPORT_FORMATS: ['pdf', 'excel', 'csv', 'json'],

  // Report Schedules
  REPORT_SCHEDULES: ['daily', 'weekly', 'monthly'],

  // Report Time Ranges
  REPORT_TIME_RANGES: {
    lastHour: 3600000,
    lastDay: 86400000,
    lastWeek: 604800000,
    lastMonth: 2592000000,
    lastYear: 31536000000
  }
};

// Monitoring Utilities
export const createMonitoringConfig = (overrides: Partial<any> = {}) => ({
  ...DEFAULT_MONITORING_CONFIG,
  ...overrides
});

export const createDashboardConfig = (overrides: Partial<any> = {}) => ({
  ...DEFAULT_DASHBOARD_CONFIG,
  ...overrides
});

export const createAlertRule = (overrides: Partial<any> = {}) => ({
  id: `rule_${Date.now()}_${Math.random()}`,
  name: 'New Alert Rule',
  metric: 'performance.responseTime',
  condition: 'gt',
  threshold: 1000,
  severity: 'medium',
  enabled: true,
  actions: [],
  ...overrides
});

export const createReportConfig = (overrides: Partial<any> = {}) => ({
  name: 'New Report',
  description: 'Automatically generated report',
  metrics: ['performance', 'errors', 'users', 'api'],
  timeRange: {
    start: new Date(Date.now() - 86400000), // Last 24 hours
    end: new Date()
  },
  format: 'pdf',
  schedule: {
    frequency: 'daily',
    time: '09:00'
  },
  recipients: [],
  ...overrides
});

// Monitoring Helpers
export const isPerformanceGood = (metric: string, value: number): boolean => {
  const thresholds = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
  return thresholds ? value <= thresholds.good : true;
};

export const isPerformanceNeedsImprovement = (metric: string, value: number): boolean => {
  const thresholds = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
  return thresholds ? value > thresholds.good && value <= thresholds.needsImprovement : false;
};

export const isPerformancePoor = (metric: string, value: number): boolean => {
  const thresholds = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
  return thresholds ? value > thresholds.needsImprovement : false;
};

export const getPerformanceGrade = (score: number): string => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

export const getPerformanceColor = (score: number): string => {
  if (score >= 90) return '#10b981';
  if (score >= 80) return '#3b82f6';
  if (score >= 70) return '#f59e0b';
  if (score >= 60) return '#ef4444';
  return '#dc2626';
};

export const getErrorLevel = (errorRate: number): string => {
  if (errorRate <= 1) return 'low';
  if (errorRate <= 5) return 'medium';
  if (errorRate <= 10) return 'high';
  return 'critical';
};

export const getErrorColor = (errorRate: number): string => {
  const level = getErrorLevel(errorRate);
  return ERROR_LEVELS[level as keyof typeof ERROR_LEVELS].color;
};

export const getSecuritySeverity = (eventCount: number): string => {
  if (eventCount <= 1) return 'low';
  if (eventCount <= 3) return 'medium';
  if (eventCount <= 5) return 'high';
  return 'critical';
};

export const getSecurityColor = (eventCount: number): string => {
  const severity = getSecuritySeverity(eventCount);
  return SECURITY_SEVERITY[severity as keyof typeof SECURITY_SEVERITY].color;
};

export const getUserEngagementLevel = (engagement: number): string => {
  if (engagement >= 80) return 'high';
  if (engagement >= 60) return 'medium';
  return 'low';
};

export const getUserEngagementColor = (engagement: number): string => {
  const level = getUserEngagementLevel(engagement);
  return USER_ENGAGEMENT_LEVELS[level as keyof typeof USER_ENGAGEMENT_LEVELS].color;
};

export const getApiPerformanceLevel = (responseTime: number): string => {
  if (responseTime <= 100) return 'excellent';
  if (responseTime <= 500) return 'good';
  if (responseTime <= 1000) return 'needsImprovement';
  return 'poor';
};

export const getApiPerformanceColor = (responseTime: number): string => {
  const level = getApiPerformanceLevel(responseTime);
  return API_PERFORMANCE_LEVELS[level as keyof typeof API_PERFORMANCE_LEVELS].color;
};

export const getDatabasePerformanceLevel = (queryTime: number): string => {
  if (queryTime <= 10) return 'excellent';
  if (queryTime <= 50) return 'good';
  if (queryTime <= 100) return 'needsImprovement';
  return 'poor';
};

export const getDatabasePerformanceColor = (queryTime: number): string => {
  const level = getDatabasePerformanceLevel(queryTime);
  return DATABASE_PERFORMANCE_LEVELS[level as keyof typeof DATABASE_PERFORMANCE_LEVELS].color;
};

export const getCachePerformanceLevel = (hitRate: number): string => {
  if (hitRate >= 90) return 'excellent';
  if (hitRate >= 80) return 'good';
  if (hitRate >= 70) return 'needsImprovement';
  return 'poor';
};

export const getCachePerformanceColor = (hitRate: number): string => {
  const level = getCachePerformanceLevel(hitRate);
  return CACHE_PERFORMANCE_LEVELS[level as keyof typeof CACHE_PERFORMANCE_LEVELS].color;
};

// Export everything as a namespace for easier access
export * as Monitoring from './index';
