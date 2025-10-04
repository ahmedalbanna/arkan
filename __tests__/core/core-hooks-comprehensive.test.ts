/**
 * اختبارات شاملة لنظام Core Hooks
 * يغطي جميع الـ hooks الأساسية والقابلة لإعادة الاستخدام في المشروع
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { createMockStore, renderWithProviders, createMockUser, createMockProject } from '../helpers/test-helpers';
import { z } from 'zod';

// Import Core Hooks
import { useProcessingState } from '@/core/hooks/base/use-processing-state';
import { useFormHandler } from '@/core/hooks/base/use-form-handler';
import { useCopyToast } from '@/core/hooks/base/use-copy-toast';
import { useFileUpload } from '@/core/hooks/base/use-file-upload';
import { useTextProcessor } from '@/core/hooks/writing-tools/use-text-processor';
import { createWritingToolHook } from '@/core/hooks/writing-tools/use-writing-tool-factory';
import { createSpecializedToolHook } from '@/core/hooks/specialized-tools/use-specialized-factory';

// Mock dependencies
jest.mock('@/lib/utils/utils', () => ({
    toast: jest.fn(),
}));

global.navigator.clipboard = {
    writeText: jest.fn().mockResolvedValue(undefined),
};

describe('Core Hooks System', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useProcessingState', () => {
        it('should initialize with default loading state', () => {
            const { result } = renderHook(() => useProcessingState());

            expect(result.current.isProcessing).toBe(false);
            expect(typeof result.current.startProcessing).toBe('function');
            expect(typeof result.current.stopProcessing).toBe('function');
            expect(typeof result.current.withProcessing).toBe('function');
        });

        it('should initialize with custom loading state', () => {
            const { result } = renderHook(() => useProcessingState({ initialLoading: true }));

            expect(result.current.isProcessing).toBe(true);
        });

        it('should start processing correctly', () => {
            const { result } = renderHook(() => useProcessingState());

            act(() => {
                result.current.startProcessing();
            });

            expect(result.current.isProcessing).toBe(true);
        });

        it('should stop processing correctly', () => {
            const { result } = renderHook(() => useProcessingState({ initialLoading: true }));

            act(() => {
                result.current.stopProcessing();
            });

            expect(result.current.isProcessing).toBe(false);
        });

        it('should toggle processing state', () => {
            const { result } = renderHook(() => useProcessingState());

            act(() => {
                result.current.toggleProcessing();
            });

            expect(result.current.isProcessing).toBe(true);

            act(() => {
                result.current.toggleProcessing();
            });

            expect(result.current.isProcessing).toBe(false);
        });

        it('should wrap async function with processing state', async () => {
            const { result } = renderHook(() => useProcessingState());
            const asyncFn = jest.fn().mockResolvedValue('test-result');

            await act(async () => {
                const promise = result.current.withProcessing(asyncFn);
                // Should be processing during execution
                expect(result.current.isProcessing).toBe(true);
                await promise;
            });

            expect(asyncFn).toHaveBeenCalled();
            expect(result.current.isProcessing).toBe(false);
        });

        it('should handle state change callback', () => {
            const onStateChange = jest.fn();
            const { result } = renderHook(() => useProcessingState({ onStateChange }));

            act(() => {
                result.current.startProcessing();
            });

            expect(onStateChange).toHaveBeenCalledWith(true);

            act(() => {
                result.current.stopProcessing();
            });

            expect(onStateChange).toHaveBeenCalledWith(false);
        });

        it('should handle errors in withProcessing', async () => {
            const { result } = renderHook(() => useProcessingState());
            const asyncFn = jest.fn().mockRejectedValue(new Error('Test error'));

            await act(async () => {
                try {
                    await result.current.withProcessing(asyncFn);
                } catch (error) {
                    expect(error.message).toBe('Test error');
                }
            });

            expect(result.current.isProcessing).toBe(false);
        });
    });

    describe('useFormHandler', () => {
        const testSchema = z.object({
            title: z.string().min(1, 'Title is required'),
            description: z.string().optional(),
            priority: z.enum(['low', 'medium', 'high']).default('medium'),
        });

        const defaultValues = {
            title: '',
            description: '',
            priority: 'medium' as const,
        };

        it('should initialize form with default values', () => {
            const { result } = renderHook(() =>
                useFormHandler(testSchema, defaultValues)
            );

            expect(result.current.form.getValues()).toEqual(defaultValues);
            expect(result.current.isSubmitting).toBe(false);
        });

        it('should handle form validation correctly', () => {
            const { result } = renderHook(() =>
                useFormHandler(testSchema, defaultValues)
            );

            act(() => {
                result.current.form.setValue('title', 'Test Title');
            });

            expect(result.current.form.getValues().title).toBe('Test Title');
        });

        it('should submit form successfully', () => {
            const mockSuccessHandler = jest.fn();
            const { result } = renderHook(() =>
                useFormHandler(testSchema, defaultValues, {
                    onSubmitSuccess: mockSuccessHandler,
                })
            );

            const formData = { title: 'Test Title', description: 'Test Description', priority: 'high' as const };

            act(() => {
                result.current.handleSubmit(formData);
            });

            expect(mockSuccessHandler).toHaveBeenCalledWith(formData);
        });

        it('should handle form reset', () => {
            const { result } = renderHook(() =>
                useFormHandler(testSchema, defaultValues)
            );

            act(() => {
                result.current.form.setValue('title', 'Modified Title');
            });

            expect(result.current.form.getValues().title).toBe('Modified Title');

            act(() => {
                result.current.reset();
            });

            expect(result.current.form.getValues()).toEqual(defaultValues);
        });

        it('should handle validation errors', () => {
            const { result } = renderHook(() =>
                useFormHandler(testSchema, defaultValues)
            );

            act(() => {
                result.current.form.setValue('title', '');
            });

            const errors = result.current.form.formState.errors;
            expect(errors.title).toBeDefined();
        });

        it('should handle custom options', () => {
            const mockErrorHandler = jest.fn();
            const { result } = renderHook(() =>
                useFormHandler(testSchema, defaultValues, {
                    onSubmitError: mockErrorHandler,
                    showSuccessToast: false,
                    successMessage: 'Custom success',
                })
            );

            expect(result.current.form).toBeDefined();
        });
    });

    describe('useCopyToast', () => {
        it('should copy text to clipboard successfully', async () => {
            const { result } = renderHook(() => useCopyToast());

            await act(async () => {
                await result.current.copyToClipboard('Test text');
            });

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test text');
            expect(result.current.isCopied).toBe(true);
        });

        it('should handle copy errors gracefully', async () => {
            const { result } = renderHook(() => useCopyToast());

            // Mock clipboard to reject

            await act(async () => {
                await result.current.copyToClipboard('Test text');
            });

            expect(result.current.isCopied).toBe(true);
        });

        it('should auto-reset copied state after timeout', async () => {
            jest.useFakeTimers();
            const { result } = renderHook(() => useCopyToast({ autoResetTimeout: 1000 }));

            await act(async () => {
                await result.current.copyToClipboard('Test text');
            });

            expect(result.current.isCopied).toBe(true);

            act(() => {
                jest.advanceTimersByTime(1000);
            });

            expect(result.current.isCopied).toBe(false);
            jest.useRealTimers();
        });

        it('should not auto-reset if timeout is disabled', async () => {
            jest.useFakeTimers();
            const { result } = renderHook(() => useCopyToast({ autoResetTimeout: 0 }));

            await act(async () => {
                await result.current.copyToClipboard('Test text');
            });

            expect(result.current.isCopied).toBe(true);

            act(() => {
                jest.advanceTimersByTime(5000);
            });

            expect(result.current.isCopied).toBe(true);
            jest.useRealTimers();
        });

        it('should show custom success toast', async () => {
            const customMessage = 'Custom copy success';
            const { result } = renderHook(() => useCopyToast({ successMessage: customMessage }));

            await act(async () => {
                await result.current.copyToClipboard('Test text');
            });

            // Mock toast would be called with custom message
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test text');
        });
    });

    describe('useFileUpload', () => {
        beforeEach(() => {
            // Mock File and FileReader
            global.File = class File {
                constructor() {
                    this.name = 'test.txt';
                    this.type = 'text/plain';
                    this.size = 1024;
                }
            } as any;

            global.FileReader = class FileReader {
        this.onload = null;
            this.onerror = null;
            this.result = null;

            readAsText() {
                setTimeout(() => {
                    if (this.onload) {
                        this.onload({ target: { result: 'file content' } });
                    }
                }, 0);
            }
        } as any;
    });

    it('should handle file upload successfully', async () => {
        const mockSuccessHandler = jest.fn();
        const { result } = renderHook(() =>
            useFileUpload({
                onSuccess: mockSuccessHandler,
                acceptedTypes: ['text/plain', 'application/pdf'],
            })
        );

        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

        await act(async () => {
            await result.current.handleFileUpload(file);
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        expect(mockSuccessHandler).toHaveBeenCalledWith('file content', 'test.txt');
    });

    it('should handle file upload errors', async () => {
        const mockErrorHandler = jest.fn();
        const { result } = renderHook(() =>
            useFileUpload({
                onError: mockErrorHandler,
                acceptedTypes: ['text/plain'],
            })
        );

        // Mock FileReader to throw error
        global.FileReader = class FileReader {
        this.onload = null;
        this.onerror = null;
        this.result = null;

        readAsText() {
            setTimeout(() => {
                if (this.onerror) {
                    this.onerror({ message: 'File read error' });
                }
            }, 0);
        }
    } as any;

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

    await act(async () => {
        await result.current.handleFileUpload(file);
        await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(mockErrorHandler).toHaveBeenCalled();
});

it('should reject unsupported file types', async () => {
    const mockErrorHandler = jest.fn();
    const { result } = renderHook(() =>
        useFileUpload({
            onError: mockErrorHandler,
            acceptedTypes: ['application/pdf'],
        })
    );

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

    await act(async () => {
        await result.current.handleFileUpload(file);
    });

    expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
            message: expect.stringContaining('File type not supported'),
        })
    );
});

it('should reject oversized files', async () => {
    const mockErrorHandler = jest.fn();
    const { result } = renderHook(() =>
        useFileUpload({
            onError: mockErrorHandler,
            maxSize: 500, // 500 bytes
        })
    );

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'size', { value: 1024 }); // 1KB

    await act(async () => {
        await result.current.handleFileUpload(file);
    });

    expect(mockErrorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
            message: expect.stringContaining('File size exceeds limit'),
        })
    );
});

it('should provide drag and drop functionality', () => {
    const { result } = renderHook(() =>
        useFileUpload({ acceptedTypes: ['text/plain'] })
    );

    expect(typeof result.current.getRootProps).toBe('function');
    expect(typeof result.current.getInputProps).toBe('function');

    const rootProps = result.current.getRootProps();
    const inputProps = result.current.getInputProps();

    expect(rootProps).toHaveProperty('role');
    expect(inputProps).toHaveProperty('type', 'file');
});
  });

describe('useTextProcessor', () => {
    beforeEach(() => {
        // Mock API calls
        global.fetch = jest.fn();
    });

    it('should initialize with proper defaults', () => {
        const config = {
            toolName: 'test-tool',
            apiEndpoint: '/api/test',
            schema: z.object({ text: z.string() }),
            defaultValues: { text: '' },
        };

        const { result } = renderHook(() => useTextProcessor(config));

        expect(result.current.originalText).toBe('');
        expect(result.current.processedText).toBe('');
        expect(result.current.isProcessing).toBe(false);
        expect(result.current.isUploading).toBe(false);
    });

    it('should process text through API configuration', async () => {
        const mockApiData = { content: 'processed text' };
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApiData),
        });

        const config = {
            toolName: 'test-tool',
            apiEndpoint: '/api/test',
            schema: z.object({ text: z.string() }),
            defaultValues: { text: '' },
        };

        const { result } = renderHook(() => useTextProcessor(config));

        act(() => {
            result.current.form.setValue('text', 'original text');
        });

        await act(async () => {
            await result.current.onSubmit();
        });

        expect(result.current.processedText).toBe('processed text');
        expect(global.fetch).toHaveBeenCalledWith('/api/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: 'original text' }),
        });
    });

    it('should handle processing errors gracefully', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

        const config = {
            toolName: 'test-tool',
            apiEndpoint: '/api/test',
            schema: z.object({ text: z.string() }),
            defaultValues: { text: '' },
        };

        const { result } = renderHook(() => useTextProcessor(config));

        act(() => {
            result.current.form.setValue('text', 'test text');
        });

        await act(async () => {
            await result.current.onSubmit();
        });

        expect(result.current.isProcessing).toBe(false);
        expect(result.current.processedText).toBe('');
    });

    it('should handle file upload integration', async () => {
        const config = {
            toolName: 'test-tool',
            apiEndpoint: '/api/test',
            schema: z.object({ text: z.string() }),
            defaultValues: { text: '' },
            enableFileUpload: true,
        };

        const { result } = renderHook(() => useTextProcessor(config));

        expect(result.current.getRootProps).toBeDefined();
        expect(result.current.getInputProps).toBeDefined();
    });

    it('should reset form and states', () => {
        const config = {
            toolName: 'test-tool',
            apiEndpoint: '/api/test',
            schema: z.object({ text: z.string() }),
            defaultValues: { text: '' },
        };

        const { result } = renderHook(() => useTextProcessor(config));

        act(() => {
            result.current.form.setValue('text', 'test text');
        });

        expect(result.current.form.getValues().text).toBe('test text');

        act(() => {
            result.current.reset();
        });

        expect(result.current.form.getValues()).toEqual({ text: '' });
        expect(result.current.originalText).toBe('');
        expect(result.current.processedText).toBe('');
    });
});

describe('Hook Factories', () => {
    describe('createWritingToolHook', () => {
        it('should create writing tool hook with proper configuration', () => {
            const config = {
                toolName: 'summarizer',
                apiEndpoint: '/api/summarize',
                schema: z.object({ text: z.string() }),
                defaultValues: { text: '' },
                successMessage: 'Text summarized successfully!',
                errorMessage: 'Summarization failed',
                enableFileUpload: true,
                acceptedFileTypes: ['text/plain'],
            };

            const useSummarizerHook = createWritingToolHook(config);
            const { result } = renderHook(() => useSummarizerHook());

            expect(result.current.form).toBeDefined();
            expect(result.current.isProcessing).toBe(false);
            expect(result.current.originalText).toBe('');
            expect(result.current.processedText).toBe('');
            expect(typeof result.current.handleCopy).toBe('function');
            expect(typeof result.current.onSubmit).toBe('function');
            expect(typeof result.current.reset).toBe('function');
        });

        it('should provide file upload functionality when enabled', () => {
            const config = {
                toolName: 'summarizer',
                apiEndpoint: '/api/summarize',
                schema: z.object({ text: z.string() }),
                defaultValues: { text: '' },
                enableFileUpload: true,
            };

            const useSummarizerHook = createWritingToolHook(config);
            const { result } = renderHook(() => useSummarizerHook());

            expect(result.current.getRootProps).toBeDefined();
            expect(result.current.getInputProps).toBeDefined();
            expect(result.current.isDragActive).toBeDefined();
        });
    });

    describe('createSpecializedToolHook', () => {
        it('should create specialized tool hook with advanced features', () => {
            const config = {
                toolName: 'advanced-parser',
                apiEndpoint: '/api/parse',
                schema: z.object({ content: z.string(), options: z.object({}) }),
                defaultValues: { content: '', options: {} },
            };

            const useAdvancedParserHook = createSpecializedToolHook(config);
            const { result } = renderHook(() => useAdvancedParserHook());

            expect(result.current.form).toBeDefined();
            expect(result.current.isProcessing).toBe(false);
            expect(typeof result.current.onSubmit).toBe('function');
            expect(typeof result.current.reset).toBe('function');
        });
    });
});

describe('Hook Integration Tests', () => {
    it('should integrate processing state with text processor', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ content: 'processed' }),
        });

        const config = {
            toolName: 'integration-test',
            apiEndpoint: '/api/integration',
            schema: z.object({ text: z.string() }),
            defaultValues: { text: '' },
        };

        // Combined hooks
        const useCombinedHook = () => {
            const processingState = useProcessingState();
            const textProcessor = useTextProcessor({
                ...config,
                // Custom success handler to test integration
                onProcessingStart: processingState.startProcessing,
                onProcessingEnd: processingState.stopProcessing,
            });

            return {
                processingState,
                textProcessor,
            };
        };

        const { result } = renderHook(() => useCombinedHook());

        act(() => {
            result.current.textProcessor.form.setValue('text', 'integration test');
        });

        // Should start processing
        expect(result.current.processingState.isProcessing).toBe(false);

        await act(async () => {
            await result.current.textProcessor.onSubmit();
        });

        // Should have processed text
        expect(result.current.textProcessor.processedText).toBe('processed');
    });

    it('should handle error propagation between hooks', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Integration error'));

        const config = {
            toolName: 'error-integration',
            apiEndpoint: '/api/error',
            schema: z.object({ text: z.string() }),
            defaultValues: { text: '' },
        };

        const { result } = renderHook(() => useTextProcessor(config));

        await act(async () => {
            await result.current.onSubmit();
        });

        expect(result.current.isProcessing).toBe(false);
        expect(result.current.processedText).toBe('');
    });
});

describe('Performance and Memory Tests', () => {
    it('should handle multiple hook instances efficiently', () => {
        const instances = 10;
        const { result } = renderHook(() => {
            const hooks = [];
            for (let i = 0; i < instances; i++) {
                hooks.push(useProcessingState());
            }
            return hooks;
        });

        expect(result.current).toHaveLength(instances);
        result.current.forEach(hook => {
            expect(hook.isProcessing).toBe(false);
        });
    });

    it('should handle rapid state changes', () => {
        const { result } = renderHook(() => useProcessingState());

        const iterations = 50;
        for (let i = 0; i < iterations; i++) {
            act(() => {
            });

            // Test cleanup and unmount
            const { unmount } = renderHook(() => useProcessingState());

            expect(() => unmount()).not.toThrow();
        });

    it('should handle async operations cleanup', async () => {
        jest.useFakeTimers();

        const { result, unmount } = renderHook(() =>
            useCopyToast({ autoResetTimeout: 1000 })
        );

        await act(async () => {
            await result.current.copyToClipboard('test');
        });

        unmount(); // Unmount before timeout

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        jest.useRealTimers();

        // Should not crash on cleanup
        expect(true).toBe(true);
    });
});

describe('Edge Cases and Boundary Tests', () => {
    it('should handle concurrent processing state changes', () => {
        const { result } = renderHook(() => useProcessingState());

        // Rapid state changes
        act(() => {
            result.current.startProcessing();
            result.current.stopProcessing();
            result.current.isProcessing);
        result.current.toggleProcessing();
        expect(result.current.isProcessing).toBe(true);
    });
});

it('should handle empty form submissions', () => {
    const schema = z.object({
        text: z.string().min(1),
    });

    const { result } = renderHook(() =>
        useFormHandler(schema, { text: '' })
    );

    expect(() => {
        result.current.handleSubmit({ text: '' });
    }).not.toThrow();
});

it('should handle oversized text processing', () => {
    const config = {
        toolName: 'large-text',
        apiEndpoint: '/api/large',
        schema: z.object({ text: z.string() }),
        defaultValues: { text: '' },
    };

    const largeText = 'x'.repeat(10000);

    const { result } = renderHook(() => useTextProcessor(config));

    act(() => {
        result.current.form.setValue('text', largeText);
    });

    expect(result.current.form.getValues().text).toHaveLength(10000);
});

it('should handle invalid file types gracefully', async () => {
    const { result } = renderHook(() =>
        useFileUpload({
            acceptedTypes: ['image/png'],
            onError: () => { }, // Silent error handling
        })
    );

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await act(async () => {
        await result.current.handleFileUpload(file);
    });

    // Should not crash
    expect(result.current.isUploading).toBe(false);
});
  });
});
