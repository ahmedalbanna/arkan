import { AIErrorHandler } from '../ai-error-handler';

describe('AIErrorHandler', () => {
    describe('handleAIError', () => {
        it('should handle API timeout error correctly', async () => {
            const error = new Error('API timeout after 30 seconds');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
            expect(result.error?.code).toBeDefined();
            expect(result.error?.severity).toBeDefined();
            expect(result.error?.isRetryable).toBeDefined();
        });

        it('should handle rate limit error correctly', async () => {
            const error = new Error('Rate limit exceeded: 100 requests per minute');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
            expect(result.error?.code).toBeDefined();
            expect(result.error?.severity).toBeDefined();
            expect(result.error?.isRetryable).toBeDefined();
        });

        it('should handle authentication error correctly', async () => {
            const error = new Error('Authentication failed: Invalid API key');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
            expect(result.error?.code).toBeDefined();
            expect(result.error?.severity).toBeDefined();
            expect(result.error?.isRetryable).toBeDefined();
        });

        it('should handle model not found error correctly', async () => {
            const error = new Error('Model not found: gemini-invalid');
            const context = {
                model: 'gemini-invalid',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
            expect(result.error?.code).toBeDefined();
            expect(result.error?.severity).toBeDefined();
            expect(result.error?.isRetryable).toBeDefined();
        });

        it('should handle content policy violation error correctly', async () => {
            const error = new Error('Content policy violation: Inappropriate content detected');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'نص غير مناسب',
                input: 'نص غير مناسب',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
            expect(result.error?.code).toBeDefined();
            expect(result.error?.severity).toBeDefined();
            expect(result.error?.isRetryable).toBeDefined();
        });

        it('should handle network error correctly', async () => {
            const error = new Error('Network error: Connection refused');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
            expect(result.error?.code).toBeDefined();
            expect(result.error?.severity).toBeDefined();
            expect(result.error?.isRetryable).toBeDefined();
        });

        it('should handle unknown error correctly', async () => {
            const error = new Error('Unknown error occurred');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
            expect(result.error?.code).toBeDefined();
            expect(result.error?.severity).toBeDefined();
            expect(result.error?.isRetryable).toBeDefined();
        });

        it('should handle different attempt numbers', async () => {
            const error = new Error('Test error');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 3,
                maxAttempts: 5
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
            expect(result.error?.code).toBeDefined();
            expect(result.error?.severity).toBeDefined();
            expect(result.error?.isRetryable).toBeDefined();
        });

        it('should handle fallback model context', async () => {
            const error = new Error('Model unavailable');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3,
                fallbackModel: 'googleai/gemini-2.0-flash'
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
            expect(result.error?.code).toBeDefined();
            expect(result.error?.severity).toBeDefined();
            expect(result.error?.isRetryable).toBeDefined();
        });
    });

    describe('getFallbackModel', () => {
        it('should return fallback model for gemini-1.5-pro', () => {
            const fallback = AIErrorHandler.getFallbackModel('googleai/gemini-1.5-pro');
            expect(fallback).toBe('googleai/gemini-2.0-flash');
        });

        it('should return fallback model for gemini-2.0-flash', () => {
            const fallback = AIErrorHandler.getFallbackModel('googleai/gemini-2.0-flash');
            expect(fallback).toBe('googleai/gemini-1.5-flash');
        });

        it('should return fallback model for gemini-1.5-flash', () => {
            const fallback = AIErrorHandler.getFallbackModel('googleai/gemini-1.5-flash');
            expect(fallback).toBe('googleai/gemini-2.0-flash');
        });

        it('should return null for unknown model', () => {
            const fallback = AIErrorHandler.getFallbackModel('unknown-model');
            expect(fallback).toBeNull();
        });
    });

    describe('simplifyPrompt', () => {
        it('should simplify complex prompt', () => {
            const complexPrompt = `
### Instructions:
**Instructions:**
Provide a detailed analysis of the following data with specific examples and constraints.

### Examples:
Here are some examples of how to structure your response:
1. First example
2. Second example

### Constraints:
- Must be under 1000 words
- Must include specific metrics
- Must follow exact format

### Additional Requirements:
More complex requirements here.
            `;

            const simplified = AIErrorHandler.simplifyPrompt(complexPrompt);

            expect(simplified).toBeDefined();
            expect(simplified).not.toContain('### Examples');
            expect(simplified).not.toContain('### Constraints');
            expect(simplified).toContain('Provide a clear and concise response');
        });

        it('should handle simple prompt', () => {
            const simplePrompt = 'Write a short summary';
            const simplified = AIErrorHandler.simplifyPrompt(simplePrompt);

            expect(simplified).toBe(simplePrompt);
        });

        it('should handle empty prompt', () => {
            const simplified = AIErrorHandler.simplifyPrompt('');
            expect(simplified).toBe('');
        });
    });

    describe('reduceContextSize', () => {
        it('should reduce string context size', () => {
            const longString = 'A'.repeat(2000);
            const reduced = AIErrorHandler.reduceContextSize(longString, 1000);

            expect(reduced).toBeDefined();
            expect(reduced.length).toBeLessThanOrEqual(1003); // 1000 + '...'
            expect(reduced).toContain('...');
        });

        it('should reduce array context size', () => {
            const longArray = Array(100).fill('item');
            const reduced = AIErrorHandler.reduceContextSize(longArray, 1000);

            expect(reduced).toBeDefined();
            expect(Array.isArray(reduced)).toBe(true);
            expect(reduced.length).toBeLessThanOrEqual(10); // 1000 / 100
        });

        it('should reduce object context size', () => {
            const largeObject = {
                key1: 'A'.repeat(500),
                key2: 'B'.repeat(500),
                key3: 'C'.repeat(500)
            };
            const reduced = AIErrorHandler.reduceContextSize(largeObject, 1000);

            expect(reduced).toBeDefined();
            expect(typeof reduced).toBe('object');
            expect(Object.keys(reduced).length).toBeLessThanOrEqual(2);
        });

        it('should handle small context', () => {
            const smallString = 'Short text';
            const reduced = AIErrorHandler.reduceContextSize(smallString, 1000);

            expect(reduced).toBe(smallString);
        });

        it('should handle null context', () => {
            const reduced = AIErrorHandler.reduceContextSize(null, 1000);
            expect(reduced).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('should handle empty error message', async () => {
            const error = new Error('');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
        });

        it('should handle null error', async () => {
            const error = null as any;
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
        });

        it('should handle undefined error', async () => {
            const error = undefined as any;
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
        });

        it('should handle very long error messages', async () => {
            const longMessage = 'A'.repeat(1000);
            const error = new Error(longMessage);
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
        });

        it('should handle special characters in error messages', async () => {
            const error = new Error('Error with special chars: @#$%^&*()');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
        });

        it('should handle high attempt numbers', async () => {
            const error = new Error('Test error');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 10,
                maxAttempts: 5
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
        });

        it('should handle zero attempt number', async () => {
            const error = new Error('Test error');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'اكتب تقرير شامل',
                input: 'اكتب تقرير شامل',
                attempt: 0,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
        });
    });

    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle null error object', async () => {
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'test',
                input: 'test',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(null, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should handle undefined error object', async () => {
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'test',
                input: 'test',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(undefined, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should handle error with no message', async () => {
            const error = new Error();
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'test',
                input: 'test',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.error).toBeDefined();
            expect(result.error?.message).toBeDefined();
        });

        it('should handle non-Error objects', async () => {
            const error = { message: 'Custom error object', code: 'CUSTOM_ERROR' };
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'test',
                input: 'test',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should handle string errors', async () => {
            const error = 'Simple string error';
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'test',
                input: 'test',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.error).toBeDefined();
            expect(result.error?.technicalDetails).toBe('Simple string error');
        });

        it('should handle very long error messages', async () => {
            const longMessage = 'Error: '.repeat(1000);
            const error = new Error(longMessage);
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'test',
                input: 'test',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.error).toBeDefined();
            expect(result.error?.technicalDetails).toBeDefined();
        });

        it('should handle mixed case error patterns', async () => {
            const errors = [
                new Error('TIMEOUT'),
                new Error('Timeout'),
                new Error('timeout'),
                new Error('TiMeOuT')
            ];

            for (const error of errors) {
                const context = {
                    model: 'googleai/gemini-1.5-pro',
                    prompt: 'test',
                    input: 'test',
                    attempt: 1,
                    maxAttempts: 3
                };

                const result = await AIErrorHandler.handleAIError(error, context);

                expect(result).toBeDefined();
                expect(result.error).toBeDefined();
            }
        });

        it('should handle empty context fields', async () => {
            const error = new Error('Test error');
            const context = {
                model: '',
                prompt: '',
                input: '',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.error).toBeDefined();
        });

        it('should handle invalid model names', async () => {
            const error = new Error('Model not found');
            const context = {
                model: 'invalid-model-123',
                prompt: 'test',
                input: 'test',
                attempt: 1,
                maxAttempts: 3
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result).toBeDefined();
            expect(result.error).toBeDefined();
            expect(result.strategies).toBeDefined();
        });

        it('should provide retry strategies when retryable', async () => {
            const error = new Error('Timeout');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'test',
                input: 'test',
                attempt: 1,
                maxAttempts: 5
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result.strategies).toBeDefined();
            expect(result.strategies!.length).toBeGreaterThan(0);

            const retryStrategy = result.strategies!.find(s => s.type === 'retry');
            expect(retryStrategy).toBeDefined();
        });

        it('should provide fallback strategies when available', async () => {
            const error = new Error('Rate limit exceeded');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'test',
                input: 'test',
                attempt: 1,
                maxAttempts: 3,
                fallbackModel: 'googleai/gemini-2.0-flash'
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result.strategies).toBeDefined();

            const fallbackStrategy = result.strategies!.find(s => s.type === 'fallback_model');
            expect(fallbackStrategy).toBeDefined();
        });

        it('should order strategies by confidence', async () => {
            const error = new Error('Timeout');
            const context = {
                model: 'googleai/gemini-1.5-pro',
                prompt: 'test',
                input: 'test',
                attempt: 1,
                maxAttempts: 3,
                fallbackModel: 'googleai/gemini-2.0-flash'
            };

            const result = await AIErrorHandler.handleAIError(error, context);

            expect(result.strategies).toBeDefined();

            if (result.strategies && result.strategies.length > 1) {
                for (let i = 0; i < result.strategies.length - 1; i++) {
                    expect(result.strategies[i].confidence).toBeGreaterThanOrEqual(
                        result.strategies[i + 1].confidence
                    );
                }
            }
        });

        it('should include user guidance in all errors', async () => {
            const errors = [
                new Error('Timeout'),
                new Error('Rate limit'),
                new Error('Invalid request'),
                new Error('Network error')
            ];

            for (const error of errors) {
                const context = {
                    model: 'googleai/gemini-1.5-pro',
                    prompt: 'test',
                    input: 'test',
                    attempt: 1,
                    maxAttempts: 3
                };

                const result = await AIErrorHandler.handleAIError(error, context);

                expect(result.error).toBeDefined();
                expect(result.error?.userMessage).toBeDefined();
                expect(result.error?.userGuidance).toBeDefined();
                expect(result.error?.suggestedActions).toBeDefined();
                expect(result.error?.suggestedActions.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Helper Methods', () => {
        it('getFallbackModel should return correct fallback', () => {
            const fallbacks = [
                { input: 'googleai/gemini-1.5-pro', expected: 'googleai/gemini-2.0-flash' },
                { input: 'googleai/gemini-2.0-flash', expected: 'googleai/gemini-1.5-flash' },
                { input: 'googleai/gemini-1.5-flash', expected: 'googleai/gemini-2.0-flash' }
            ];

            for (const { input, expected } of fallbacks) {
                const fallback = AIErrorHandler.getFallbackModel(input);
                expect(fallback).toBe(expected);
            }
        });

        it('getFallbackModel should return null for unknown models', () => {
            const fallback = AIErrorHandler.getFallbackModel('unknown-model');
            expect(fallback).toBeNull();
        });

        it('simplifyPrompt should remove complex sections', () => {
            const complexPrompt = `
### Instructions
Do something complex

### Examples
Example 1: Complex example
Example 2: Another example

### Constraints
Must follow rules
            `;

            const simplified = AIErrorHandler.simplifyPrompt(complexPrompt);

            expect(simplified).toBeDefined();
            expect(simplified).not.toContain('### Examples');
            expect(simplified).not.toContain('### Constraints');
        });

        it('reduceContextSize should limit string length', () => {
            const largeContext = 'x'.repeat(5000);
            const reduced = AIErrorHandler.reduceContextSize(largeContext, 1000);

            expect(reduced.length).toBeLessThanOrEqual(1003); // 1000 + '...'
        });

        it('reduceContextSize should limit array length', () => {
            const largeArray = Array(1000).fill('item');
            const reduced = AIErrorHandler.reduceContextSize(largeArray, 500);

            expect(Array.isArray(reduced)).toBe(true);
            expect(reduced.length).toBeLessThanOrEqual(5);
        });

        it('reduceContextSize should limit object size', () => {
            const largeObject: Record<string, string> = {};
            for (let i = 0; i < 1000; i++) {
                largeObject[`key${i}`] = 'value'.repeat(100);
            }

            const reduced = AIErrorHandler.reduceContextSize(largeObject, 1000);

            expect(typeof reduced).toBe('object');
            const reducedKeys = Object.keys(reduced);
            expect(reducedKeys.length).toBeLessThan(1000);
        });
    });
});
