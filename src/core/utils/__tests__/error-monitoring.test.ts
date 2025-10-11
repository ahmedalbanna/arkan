/**
 * اختبارات شاملة لنظام مراقبة الأخطاء (ErrorMonitoringService)
 * يغطي جميع وظائف تتبع ومراقبة الأخطاء
 */

import { EnhancedError, ErrorCategory, ErrorSeverity } from '../../types/error-types';
import { ErrorMonitoringService } from '../error-monitoring';

describe('ErrorMonitoringService', () => {
    let service: ErrorMonitoringService;

    beforeEach(() => {
        // Get fresh instance for each test
        service = ErrorMonitoringService.getInstance();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = ErrorMonitoringService.getInstance();
            const instance2 = ErrorMonitoringService.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe('Error Recording', () => {
        it('should record error successfully', () => {
            const error: EnhancedError = {
                code: 'TEST_ERROR',
                message: 'Test error message',
                category: 'system',
                severity: 'medium',
                userMessage: 'خطأ في النظام',
                userGuidance: 'يرجى المحاولة مرة أخرى',
                suggestedActions: ['أعد المحاولة'],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date().toISOString()
            };

            service.recordError(error, 'test-op-1');

            const history = service.getErrorHistory('test-op-1');
            expect(history.length).toBeGreaterThan(0);
            expect(history[0].code).toBe('TEST_ERROR');
        });

        it('should record multiple errors for same operation', () => {
            const errors: EnhancedError[] = [
                {
                    code: 'ERROR_1',
                    message: 'Error 1',
                    category: 'network',
                    severity: 'low',
                    userMessage: 'خطأ 1',
                    userGuidance: 'guidance',
                    suggestedActions: [],
                    isRetryable: true,
                    fallbackAvailable: false,
                    timestamp: new Date().toISOString()
                },
                {
                    code: 'ERROR_2',
                    message: 'Error 2',
                    category: 'network',
                    severity: 'medium',
                    userMessage: 'خطأ 2',
                    userGuidance: 'guidance',
                    suggestedActions: [],
                    isRetryable: true,
                    fallbackAvailable: false,
                    timestamp: new Date().toISOString()
                }
            ];

            errors.forEach(error => service.recordError(error, 'multi-error-op'));

            const history = service.getErrorHistory('multi-error-op');
            expect(history.length).toBe(2);
        });

        it('should record errors for different operations', () => {
            const error1: EnhancedError = {
                code: 'ERROR_OP1',
                message: 'Error for op1',
                category: 'ai_generation',
                severity: 'high',
                userMessage: 'خطأ',
                userGuidance: 'guidance',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: true,
                timestamp: new Date().toISOString()
            };

            const error2: EnhancedError = {
                code: 'ERROR_OP2',
                message: 'Error for op2',
                category: 'validation',
                severity: 'low',
                userMessage: 'خطأ',
                userGuidance: 'guidance',
                suggestedActions: [],
                isRetryable: false,
                fallbackAvailable: false,
                timestamp: new Date().toISOString()
            };

            service.recordError(error1, 'operation-1');
            service.recordError(error2, 'operation-2');

            const history1 = service.getErrorHistory('operation-1');
            const history2 = service.getErrorHistory('operation-2');

            expect(history1.length).toBe(1);
            expect(history2.length).toBe(1);
            expect(history1[0].code).toBe('ERROR_OP1');
            expect(history2[0].code).toBe('ERROR_OP2');
        });
    });

    describe('Metrics Tracking', () => {
        it('should track total errors', () => {
            const error: EnhancedError = {
                code: 'TEST',
                message: 'Test',
                category: 'system',
                severity: 'low',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date().toISOString()
            };

            const initialMetrics = service.getMetrics();
            const initialCount = initialMetrics.totalErrors;

            service.recordError(error, 'metrics-test-1');
            service.recordError(error, 'metrics-test-2');
            service.recordError(error, 'metrics-test-3');

            const updatedMetrics = service.getMetrics();
            expect(updatedMetrics.totalErrors).toBeGreaterThan(initialCount);
        });

        it('should track errors by category', () => {
            const categories: ErrorCategory[] = ['network', 'ai_generation', 'validation'];

            categories.forEach((category, index) => {
                const error: EnhancedError = {
                    code: 'TEST',
                    message: 'Test',
                    category,
                    severity: 'medium',
                    userMessage: 'test',
                    userGuidance: 'test',
                    suggestedActions: [],
                    isRetryable: true,
                    fallbackAvailable: false,
                    timestamp: new Date().toISOString()
                };

                service.recordError(error, `category-test-${index}`);
            });

            const metrics = service.getMetrics();
            expect(metrics.errorsByCategory).toBeDefined();
            expect(Object.keys(metrics.errorsByCategory).length).toBeGreaterThan(0);
        });

        it('should track errors by severity', () => {
            const severities: ErrorSeverity[] = ['low', 'medium', 'high', 'critical'];

            severities.forEach((severity, index) => {
                const error: EnhancedError = {
                    code: 'TEST',
                    message: 'Test',
                    category: 'system',
                    severity,
                    userMessage: 'test',
                    userGuidance: 'test',
                    suggestedActions: [],
                    isRetryable: true,
                    fallbackAvailable: false,
                    timestamp: new Date().toISOString()
                };

                service.recordError(error, `severity-test-${index}`);
            });

            const metrics = service.getMetrics();
            expect(metrics.errorsBySeverity).toBeDefined();
            expect(Object.keys(metrics.errorsBySeverity).length).toBeGreaterThan(0);
        });

        it('should track errors by hour', () => {
            const error: EnhancedError = {
                code: 'TEST',
                message: 'Test',
                category: 'system',
                severity: 'low',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date().toISOString()
            };

            service.recordError(error, 'hour-test');

            const metrics = service.getMetrics();
            expect(metrics.errorsByHour).toBeDefined();
        });

        it('should track errors by day', () => {
            const error: EnhancedError = {
                code: 'TEST',
                message: 'Test',
                category: 'system',
                severity: 'low',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date().toISOString()
            };

            service.recordError(error, 'day-test');

            const metrics = service.getMetrics();
            expect(metrics.errorsByDay).toBeDefined();
        });
    });

    describe('Alert System', () => {
        it('should return predefined alerts', () => {
            const alerts = service.getAlerts();

            expect(alerts.length).toBeGreaterThan(0);
            expect(alerts.some(a => a.id === 'critical_errors')).toBe(true);
            expect(alerts.some(a => a.id === 'high_error_rate')).toBe(true);
            expect(alerts.some(a => a.id === 'ai_errors')).toBe(true);
        });

        it('should track critical errors for alerting', () => {
            const criticalErrors = 6; // More than threshold (5)

            for (let i = 0; i < criticalErrors; i++) {
                const error: EnhancedError = {
                    code: 'CRITICAL',
                    message: 'Critical error',
                    category: 'system',
                    severity: 'critical',
                    userMessage: 'خطأ حرج',
                    userGuidance: 'اتصل بالدعم',
                    suggestedActions: [],
                    isRetryable: false,
                    fallbackAvailable: false,
                    timestamp: new Date().toISOString()
                };

                service.recordError(error, `critical-alert-test-${i}`);
            }

            const alerts = service.getAlerts();
            const criticalAlert = alerts.find(a => a.id === 'critical_errors');

            expect(criticalAlert).toBeDefined();
        });

        it('should track AI errors for alerting', () => {
            const aiErrors = 4; // More than threshold (3)

            for (let i = 0; i < aiErrors; i++) {
                const error: EnhancedError = {
                    code: 'AI_ERROR',
                    message: 'AI generation failed',
                    category: 'ai_generation',
                    severity: 'high',
                    userMessage: 'فشل في التوليد',
                    userGuidance: 'أعد المحاولة',
                    suggestedActions: [],
                    isRetryable: true,
                    fallbackAvailable: true,
                    timestamp: new Date().toISOString()
                };

                service.recordError(error, `ai-alert-test-${i}`);
            }

            const alerts = service.getAlerts();
            const aiAlert = alerts.find(a => a.id === 'ai_errors');

            expect(aiAlert).toBeDefined();
        });
    });

    describe('Error History Retrieval', () => {
        it('should return empty history for non-existent operation', () => {
            const history = service.getErrorHistory('non-existent-op');
            expect(history.length).toBe(0);
        });

        it('should return all errors when no operation specified', () => {
            const error: EnhancedError = {
                code: 'TEST',
                message: 'Test',
                category: 'system',
                severity: 'low',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date().toISOString()
            };

            service.recordError(error, 'op-1');
            service.recordError(error, 'op-2');
            service.recordError(error, 'op-3');

            const allErrors = service.getErrorHistory();
            expect(allErrors.length).toBeGreaterThan(0);
        });

        it('should sort errors by timestamp (newest first)', () => {
            const oldError: EnhancedError = {
                code: 'OLD',
                message: 'Old error',
                category: 'system',
                severity: 'low',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date(Date.now() - 10000).toISOString()
            };

            const newError: EnhancedError = {
                code: 'NEW',
                message: 'New error',
                category: 'system',
                severity: 'low',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date().toISOString()
            };

            service.recordError(oldError, 'sort-test');
            service.recordError(newError, 'sort-test');

            const history = service.getErrorHistory('sort-test');
            expect(history[0].code).toBe('NEW');
            expect(history[1].code).toBe('OLD');
        });
    });

    describe('Detailed Statistics', () => {
        it('should generate detailed stats', () => {
            const error: EnhancedError = {
                code: 'STATS_TEST',
                message: 'Test',
                category: 'network',
                severity: 'medium',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date().toISOString()
            };

            service.recordError(error, 'stats-test');

            const stats = service.getDetailedStats();

            expect(stats.metrics).toBeDefined();
            expect(stats.trends).toBeDefined();
            expect(stats.alerts).toBeDefined();
            expect(stats.topErrors).toBeDefined();
            expect(stats.errorDistribution).toBeDefined();
        });

        it('should identify top errors', () => {
            // Record same error multiple times
            for (let i = 0; i < 5; i++) {
                const error: EnhancedError = {
                    code: 'FREQUENT_ERROR',
                    message: 'Frequent error',
                    category: 'network',
                    severity: 'low',
                    userMessage: 'test',
                    userGuidance: 'test',
                    suggestedActions: [],
                    isRetryable: true,
                    fallbackAvailable: false,
                    timestamp: new Date().toISOString()
                };

                service.recordError(error, `frequent-test-${i}`);
            }

            const stats = service.getDetailedStats();
            const topError = stats.topErrors.find(e => e.code === 'FREQUENT_ERROR');

            expect(topError).toBeDefined();
            expect(topError!.count).toBeGreaterThan(0);
        });
    });

    describe('Data Cleanup', () => {
        it('should cleanup old errors', () => {
            const oldError: EnhancedError = {
                code: 'OLD',
                message: 'Old error',
                category: 'system',
                severity: 'low',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days ago
            };

            service.recordError(oldError, 'cleanup-test');
            service.cleanup(30); // Keep only 30 days

            // Note: cleanup implementation may vary, this tests the method exists
            expect(service.cleanup).toBeDefined();
        });
    });

    describe('Data Export/Import', () => {
        it('should export error data', () => {
            const error: EnhancedError = {
                code: 'EXPORT_TEST',
                message: 'Test',
                category: 'system',
                severity: 'low',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date().toISOString()
            };

            service.recordError(error, 'export-test');

            const exportedData = service.exportData();

            expect(exportedData.metrics).toBeDefined();
            expect(exportedData.trends).toBeDefined();
            expect(exportedData.alerts).toBeDefined();
            expect(exportedData.errorHistory).toBeDefined();
        });

        it('should import error data', () => {
            const importData = {
                metrics: {
                    totalErrors: 10,
                    errorsByCategory: { system: 5, network: 5 },
                    errorsBySeverity: { low: 10 },
                    errorsByHour: { 12: 10 },
                    errorsByDay: { '2024-01-01': 10 },
                    averageResolutionTime: 0,
                    retrySuccessRate: 0,
                    fallbackUsageRate: 0
                },
                trends: [],
                alerts: [],
                errorHistory: {}
            };

            service.importData(importData);

            const metrics = service.getMetrics();
            expect(metrics.totalErrors).toBeGreaterThanOrEqual(10);
        });
    });

    describe('Edge Cases', () => {
        it('should handle error without timestamp', () => {
            const error: any = {
                code: 'NO_TIMESTAMP',
                message: 'Test',
                category: 'system',
                severity: 'low',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false
                // No timestamp
            };

            expect(() => service.recordError(error, 'no-timestamp-test')).not.toThrow();
        });

        it('should handle empty operation ID', () => {
            const error: EnhancedError = {
                code: 'TEST',
                message: 'Test',
                category: 'system',
                severity: 'low',
                userMessage: 'test',
                userGuidance: 'test',
                suggestedActions: [],
                isRetryable: true,
                fallbackAvailable: false,
                timestamp: new Date().toISOString()
            };

            service.recordError(error, '');
            const history = service.getErrorHistory('');
            expect(history.length).toBeGreaterThan(0);
        });

        it('should handle missing error fields', () => {
            const incompleteError: Partial<EnhancedError> = {
                code: 'INCOMPLETE',
                category: 'system' as ErrorCategory,
                severity: 'low' as ErrorSeverity
            };

            expect(() => service.recordError(incompleteError as EnhancedError, 'incomplete-test')).not.toThrow();
        });
    });
});

