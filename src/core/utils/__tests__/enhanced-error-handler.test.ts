/**
 * اختبارات شاملة لمعالج الأخطاء المحسن (EnhancedErrorHandler)
 * يغطي جميع وظائف معالجة الأخطاء مع إعادة المحاولة الذكية
 */

import { ErrorCategory, ErrorSeverity } from '../../types/error-types';
import { EnhancedErrorHandler } from '../enhanced-error-handler';

// Mock للـ toast
jest.mock('@/hooks/use-toast', () => ({
    toast: jest.fn()
}));

describe('EnhancedErrorHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('handleWithRetry', () => {
        it('should successfully execute operation without errors', async () => {
            const successOperation = jest.fn().mockResolvedValue('success');

            const result = await EnhancedErrorHandler.handleWithRetry(
                successOperation,
                {
                    operationId: 'test-op-1',
                    category: 'ai_generation'
                }
            );

            expect(result.success).toBe(true);
            expect(successOperation).toHaveBeenCalledTimes(1);
        });

        it('should handle network timeout errors', async () => {
            const failedOperation = jest.fn().mockRejectedValue(new Error('Request timed out'));

            const result = await EnhancedErrorHandler.handleWithRetry(
                failedOperation,
                {
                    operationId: 'test-op-2',
                    category: 'network',
                    severity: 'medium'
                }
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error?.category).toBe('network');
        });

        it('should handle rate limit errors correctly', async () => {
            const failedOperation = jest.fn().mockRejectedValue(new Error('Rate limit exceeded'));

            const result = await EnhancedErrorHandler.handleWithRetry(
                failedOperation,
                {
                    operationId: 'test-op-3',
                    category: 'rate_limit',
                    severity: 'high'
                }
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED');
        });

        it('should handle authentication errors', async () => {
            const failedOperation = jest.fn().mockRejectedValue(new Error('Unauthorized access'));

            const result = await EnhancedErrorHandler.handleWithRetry(
                failedOperation,
                {
                    operationId: 'test-op-4',
                    category: 'authentication',
                    severity: 'high'
                }
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error?.category).toBe('authentication');
        });

        it('should handle validation errors', async () => {
            const failedOperation = jest.fn().mockRejectedValue(new Error('Invalid input data'));

            const result = await EnhancedErrorHandler.handleWithRetry(
                failedOperation,
                {
                    operationId: 'test-op-5',
                    category: 'validation',
                    severity: 'low'
                }
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error?.category).toBe('validation');
            expect(result.error?.isRetryable).toBe(false);
        });
    });

    describe('Error Classification', () => {
        it('should classify timeout errors correctly', async () => {
            const timeoutErrors = [
                'Connection timed out',
                'Request timeout after 30 seconds',
                'Operation timed out',
                'TIMEOUT ERROR'
            ];

            for (const errorMsg of timeoutErrors) {
                const operation = jest.fn().mockRejectedValue(new Error(errorMsg));

                const result = await EnhancedErrorHandler.handleWithRetry(
                    operation,
                    {
                        operationId: `timeout-test-${errorMsg}`,
                        category: 'network'
                    }
                );

                expect(result.error?.code).toBe('NETWORK_TIMEOUT');
            }
        });

        it('should classify validation errors correctly', async () => {
            const validationErrors = [
                'Validation failed',
                'Invalid format',
                'Malformed request',
                'Invalid input data'
            ];

            for (const errorMsg of validationErrors) {
                const operation = jest.fn().mockRejectedValue(new Error(errorMsg));

                const result = await EnhancedErrorHandler.handleWithRetry(
                    operation,
                    {
                        operationId: `validation-test-${errorMsg}`,
                        category: 'validation'
                    }
                );

                expect(result.error?.category).toBe('validation');
            }
        });
    });

    describe('Retry Context Management', () => {
        it('should track retry attempts', async () => {
            let attempts = 0;
            const operation = jest.fn().mockImplementation(() => {
                attempts++;
                if (attempts < 3) {
                    return Promise.reject(new Error('Temporary failure'));
                }
                return Promise.resolve('success');
            });

            // First call - should fail
            const result1 = await EnhancedErrorHandler.handleWithRetry(
                operation,
                {
                    operationId: 'retry-test-1',
                    category: 'network'
                }
            );

            expect(result1.success).toBe(false);
            expect(result1.retryContext).toBeDefined();
        });

        it('should clear retry context on success', async () => {
            const successOperation = jest.fn().mockResolvedValue('success');

            await EnhancedErrorHandler.handleWithRetry(
                successOperation,
                {
                    operationId: 'clear-context-test',
                    category: 'ai_generation'
                }
            );

            // Second call should not have previous context
            const result = await EnhancedErrorHandler.handleWithRetry(
                successOperation,
                {
                    operationId: 'clear-context-test',
                    category: 'ai_generation'
                }
            );

            expect(result.success).toBe(true);
        });
    });

    describe('Error History and Stats', () => {
        it('should record error history', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Test error'));

            await EnhancedErrorHandler.handleWithRetry(
                operation,
                {
                    operationId: 'history-test',
                    category: 'system'
                }
            );

            const history = EnhancedErrorHandler.getErrorHistory('history-test');
            expect(history.length).toBeGreaterThan(0);
        });

        it('should generate error statistics', async () => {
            // Generate multiple errors
            const operations = [
                { category: 'network' as ErrorCategory, error: 'Network error 1' },
                { category: 'network' as ErrorCategory, error: 'Network error 2' },
                { category: 'ai_generation' as ErrorCategory, error: 'AI error 1' },
                { category: 'validation' as ErrorCategory, error: 'Validation error 1' }
            ];

            for (const { category, error } of operations) {
                const op = jest.fn().mockRejectedValue(new Error(error));
                await EnhancedErrorHandler.handleWithRetry(
                    op,
                    {
                        operationId: `stats-test-${error}`,
                        category
                    }
                );
            }

            const stats = EnhancedErrorHandler.getErrorStats();

            expect(stats.totalErrors).toBeGreaterThan(0);
            expect(stats.errorsByCategory).toBeDefined();
            expect(stats.errorsBySeverity).toBeDefined();
        });

        it('should clear error history', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Test error'));

            await EnhancedErrorHandler.handleWithRetry(
                operation,
                {
                    operationId: 'clear-history-test',
                    category: 'system'
                }
            );

            EnhancedErrorHandler.clearErrorHistory('clear-history-test');

            const history = EnhancedErrorHandler.getErrorHistory('clear-history-test');
            expect(history.length).toBe(0);
        });
    });

    describe('Enhanced Error Creation', () => {
        it('should create enhanced error with all required fields', () => {
            const error = new Error('Test error');
            const enhancedError = EnhancedErrorHandler.createEnhancedError(
                error,
                'system',
                'medium'
            );

            expect(enhancedError.code).toBeDefined();
            expect(enhancedError.message).toBeDefined();
            expect(enhancedError.category).toBe('system');
            expect(enhancedError.severity).toBe('medium');
            expect(enhancedError.userMessage).toBeDefined();
            expect(enhancedError.userGuidance).toBeDefined();
            expect(enhancedError.suggestedActions).toBeDefined();
            expect(enhancedError.isRetryable).toBeDefined();
            expect(enhancedError.timestamp).toBeDefined();
        });

        it('should include context in enhanced error', () => {
            const error = new Error('Test error');
            const context = {
                userId: 'user-123',
                sessionId: 'session-456',
                operationId: 'op-789'
            };

            const enhancedError = EnhancedErrorHandler.createEnhancedError(
                error,
                'ai_generation',
                'high',
                context
            );

            expect(enhancedError.context).toEqual(context);
        });

        it('should handle different error types', () => {
            const errors = [
                new Error('Standard error'),
                'String error',
                { message: 'Object error' },
                null,
                undefined
            ];

            for (const error of errors) {
                const enhanced = EnhancedErrorHandler.createEnhancedError(
                    error,
                    'system',
                    'low'
                );

                expect(enhanced).toBeDefined();
                expect(enhanced.userMessage).toBeDefined();
                expect(enhanced.userGuidance).toBeDefined();
            }
        });
    });

    describe('Edge Cases', () => {
        it('should handle null operation', async () => {
            const result = await EnhancedErrorHandler.handleWithRetry(
                null as any,
                {
                    operationId: 'null-op-test',
                    category: 'system'
                }
            );

            expect(result.success).toBe(false);
        });

        it('should handle undefined error', async () => {
            const operation = jest.fn().mockRejectedValue(undefined);

            const result = await EnhancedErrorHandler.handleWithRetry(
                operation,
                {
                    operationId: 'undefined-error-test',
                    category: 'system'
                }
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should handle very long error messages', async () => {
            const longMessage = 'Error: '.repeat(1000);
            const operation = jest.fn().mockRejectedValue(new Error(longMessage));

            const result = await EnhancedErrorHandler.handleWithRetry(
                operation,
                {
                    operationId: 'long-error-test',
                    category: 'system'
                }
            );

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should handle empty operation ID', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Test'));

            const result = await EnhancedErrorHandler.handleWithRetry(
                operation,
                {
                    operationId: '',
                    category: 'system'
                }
            );

            expect(result.success).toBe(false);
        });

        it('should handle all error categories', async () => {
            const categories: ErrorCategory[] = [
                'network',
                'authentication',
                'validation',
                'ai_generation',
                'file_upload',
                'export',
                'database',
                'permission',
                'rate_limit',
                'system',
                'user_input',
                'external_service'
            ];

            for (const category of categories) {
                const operation = jest.fn().mockRejectedValue(new Error(`${category} error`));

                const result = await EnhancedErrorHandler.handleWithRetry(
                    operation,
                    {
                        operationId: `category-test-${category}`,
                        category
                    }
                );

                expect(result.error?.category).toBe(category);
            }
        });

        it('should handle all error severities', async () => {
            const severities: ErrorSeverity[] = ['low', 'medium', 'high', 'critical'];

            for (const severity of severities) {
                const operation = jest.fn().mockRejectedValue(new Error('Test'));

                const result = await EnhancedErrorHandler.handleWithRetry(
                    operation,
                    {
                        operationId: `severity-test-${severity}`,
                        category: 'system',
                        severity
                    }
                );

                expect(result.error?.severity).toBe(severity);
            }
        });
    });

    describe('User Messages and Guidance', () => {
        it('should provide Arabic user messages', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('Network error'));

            const result = await EnhancedErrorHandler.handleWithRetry(
                operation,
                {
                    operationId: 'arabic-message-test',
                    category: 'network'
                }
            );

            expect(result.error?.userMessage).toBeDefined();
            expect(result.error?.userMessage.length).toBeGreaterThan(0);
        });

        it('should provide suggested actions', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('AI generation failed'));

            const result = await EnhancedErrorHandler.handleWithRetry(
                operation,
                {
                    operationId: 'suggestions-test',
                    category: 'ai_generation'
                }
            );

            expect(result.error?.suggestedActions).toBeDefined();
            expect(result.error?.suggestedActions.length).toBeGreaterThan(0);
        });

        it('should indicate retry availability', async () => {
            const retryableOp = jest.fn().mockRejectedValue(new Error('Network error'));
            const nonRetryableOp = jest.fn().mockRejectedValue(new Error('Permission denied'));

            const retryableResult = await EnhancedErrorHandler.handleWithRetry(
                retryableOp,
                {
                    operationId: 'retryable-test',
                    category: 'network'
                }
            );

            const nonRetryableResult = await EnhancedErrorHandler.handleWithRetry(
                nonRetryableOp,
                {
                    operationId: 'non-retryable-test',
                    category: 'permission'
                }
            );

            expect(retryableResult.error?.isRetryable).toBe(true);
            expect(nonRetryableResult.error?.isRetryable).toBe(false);
        });
    });

    describe('Fallback Strategy', () => {
        it('should indicate fallback availability', async () => {
            const categories: ErrorCategory[] = [
                'ai_generation',
                'export',
                'database',
                'system',
                'external_service'
            ];

            for (const category of categories) {
                const operation = jest.fn().mockRejectedValue(new Error('Test'));

                const result = await EnhancedErrorHandler.handleWithRetry(
                    operation,
                    {
                        operationId: `fallback-test-${category}`,
                        category
                    }
                );

                expect(result.error?.fallbackAvailable).toBe(true);
            }
        });

        it('should not indicate fallback for non-recoverable errors', async () => {
            const categories: ErrorCategory[] = [
                'authentication',
                'validation',
                'permission'
            ];

            for (const category of categories) {
                const operation = jest.fn().mockRejectedValue(new Error('Test'));

                const result = await EnhancedErrorHandler.handleWithRetry(
                    operation,
                    {
                        operationId: `no-fallback-test-${category}`,
                        category
                    }
                );

                expect(result.error?.fallbackAvailable).toBe(false);
            }
        });
    });
});

