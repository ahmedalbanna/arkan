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
});
