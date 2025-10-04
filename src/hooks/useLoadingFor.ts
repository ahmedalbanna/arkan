/**
 * مجموعة hooks متخصصة للعمليات المختلفة مع Loading States محسنة
 * يوفر hooks جاهزة للاستخدام مع أفضل الممارسات لتجربة المستخدم
 */

'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks';
import { useLoadingState, LoadingStateData } from '@/context/LoadingContext';

/**
 * Hook للعمليات غير المتزامنة مع معالجة تلقائية للأخطاء
 */
export const useAsyncOperation = <TResult>(
    operationKey: string,
    options: {
        /** رسالة التحميل الافتراضية */
        loadingMessage?: string;
        /** رسالة النجاح */
        successMessage?: string;
        /** رسالة الخطأ */
        errorMessage?: string;
        /** مهلة الزمن (ms) */
        timeout?: number;
        /** هل يجب فحص المهلة الزمنية */
        hasCancelOption?: boolean;
        /** دالة callback للنجاح */
        onSuccess?: (result: TResult) => void;
        /** دالة callback للخطأ */
        onError?: (error: Error) => void;
        /** دالة callback للتقديم */
        onComplete?: () => void;
    } = {}
) => {
    const { start, stop, update, loadingData } = useLoadingState(operationKey);
    const { toast } = useToast();
    const timeoutRef = useRef<NodeJS.Timeout>();

    const {
        loadingMessage = 'جاري المعالجة...',
        successMessage,
        errorMessage,
        timeout = 0,
        hasCancelOption = false,
        onSuccess,
        onError,
        onComplete,
    } = options;

    // إيقاف المؤقت عند تنظيف المكون
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // التعبير عن العملية غير المتزامنة
    const execute = useCallback(async (
        asyncOperation: () => Promise<TResult>,
        customOptions?: Partial<typeof options>
    ): Promise<TResult> => {
        const finalOptions = { ...options, ...customOptions };
        const operationMessage = finalOptions.loadingMessage || loadingMessage;

        try {
            // بدء العملية
            start({
                message: operationMessage,
                cancellable: finalOptions.hasCancelOption || hasCancelOption,
                onCancel: () => {
                    stop();
                    throw new Error('تم إلغاء العملية');
                },
            });

            // مهلة زمنية (إذا تم تحديدها)
            if (finalOptions.timeout || timeout) {
                const operationTimeout = finalOptions.timeout || timeout;

                timeoutRef.current = setTimeout(() => {
                    stop();
                    throw new Error(`انتهت مهلة العملية (${operationTimeout}ms)`);
                }, operationTimeout);
            }

            const result = await asyncOperation();

            // نجح التنفيذ
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            stop();
            finalOptions.onSuccess?.(result);

            if (finalOptions.successMessage || successMessage) {
                toast({
                    title: 'نجح التنفيذ',
                    description: finalOptions.successMessage || successMessage,
                });
            }

            return result;
        } catch (error) {
            // فشل التنفيذ
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            stop();
            const errorInstance = error instanceof Error ? error : new Error('حدث خطأ غير متوقع');

            finalOptions.onError?.(errorInstance);

            if (finalOptions.errorMessage || errorMessage) {
                toast({
                    title: 'فشل التنفيذ',
                    description: finalOptions.errorMessage || errorMessage,
                    variant: 'destructive',
                });
            }

            throw errorInstance;
        } finally {
            finalOptions.onComplete?.();
            onComplete?.();
        }
    }, [start, stop, loadingMessage, successMessage, errorMessage, timeout, hasCancelOption, onSuccess, onError, onComplete, toast]);

    return {
        execute,
        isLoading: loadingData?.loading || false,
        loadingData,
        stop,
    };
};

/**
 * Hook للملفات والتحميلات مع تتبع الطقم
 */
export const useFileOperation = (
    operationKey: string,
    options: {
        /** الحد الأقصى لحجم الملف (bytes) */
        maxFileSize?: number;
        /** أنواع الملفات المقبولة */
        acceptedTypes?: string[];
        /** رسالة التحميل */
        loadingMessage?: string;
        /** دالة callback للنجاح */
        onSuccess?: (file: File, content: string) => void;
        /** دالة callback للخطأ */
        onError?: (error: Error) => void;
    } = {}
) => {
    const uploadOperation = useAsyncOperation(operationKey, {
        loadingMessage: options.loadingMessage || 'جاري تحميل الملف...',
        successMessage: 'تم تحميل الملف بنجاح!',
        errorMessage: 'فشل في تحميل الملف',
        onSuccess: (result: { file: File; content: string }) => {
            options.onSuccess?.(result.file, result.content);
        },
        onError: options.onError,
        as const);

    const uploadFile = useCallback(async (file: File) => {
        // فحص حجم الملف
        if (options.maxFileSize && file.size > options.maxFileSize) {
            throw new Error(`حجم الملف كبير جداً. الحد الأقصى ${Math.round(options.maxFileSize / (1024 * 1024))}MB`);
        }

        // فحص نوع الملف
        if (options.acceptedTypes && !options.acceptedTypes.includes(file.type)) {
            throw new Error(`نوع الملف غير مدعوم. الأنواع المقبولة: ${options.acceptedTypes.join(', ')}`);
        }

        return uploadOperation.execute(async () => {
            // محاكاة قراءة محتوى الملف
            const content = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
                reader.readAsText(file);
            });

            return { file, content };
        });
    }, [uploadOperation, options.maxFileSize, options.acceptedTypes]);

    return {
        uploadFile,
        isLoading: uploadOperation.isLoading,
        loadingData: uploadOperation.loadingData,
        stop: uploadOperation.stop,
    };
};

/**
 * Hook للعمليات ذات التقدم مع تحديثات في الوقت الفعلي
 */
export const useProgressOperation = (
    operationKey: string,
    options: {
        /** دالة التحديث */
        onProgress?: (progress: number, message?: string) => void;
        /** مهلة زمنية لكل مرحلة */
        stageTimeout?: number;
        /** دالة callback للنجاح */
        onSuccess?: (result: any) => void;
        /** دالة callback للخطأ */
        onError?: (error: Error) => void;
    } = {}
) => {
    const { start, stop, update, loadingData } = useLoadingState(operationKey);
    const progressRef = useRef(0);

    const executeWithProgress = useCallback(async <TResult>(
        progressiveOperation: (progress: (value: number, message?: string) => void) => Promise<TResult>
    ): Promise<TResult> => {
        progressRef.current = 0;

        try {
            start({
                message: 'جاري العملية...',
                progress: 0,
                cancellable: true,
                onCancel: () => {
                    stop();
                    throw new Error('تم إلغاء العملية');
                },
            });

            const result = await progressiveOperation((value: number, message?: string) => {
                progressRef.current = value;
                update({
                    progress: value,
                    message: message || `جاري العمل... ${value}%`,
                });
                options.onProgress?.(value, message);
            });

            stop();
            options.onSuccess?.(result);
            return result;
        } catch (error) {
            stop();
            const errorInstance = error instanceof Error ? error : new Error('حدث خطأ غير متوقع');
            options.onError?.(errorInstance);
            throw errorInstance;
        }
    }, [start, stop, update, options]);

    return {
        executeWithProgress,
        currentProgress: progressRef.current,
        isLoading: loadingData?.loading || false,
        loadingData,
        stop,
    };
};

/**
 * Hook للعمليات المتعددة (Batch Operations)
 */
export const useBatchOperation = (
    operationKey: string,
    options: {
        /** عدد العمليات المتوازية */
        concurrency?: number;
        /** مهلة زمنية لكل عملية */
        timeout?: number;
        /** دالة callback للتقدم الإجمالي */
        onBatchProgress?: (completed: number, total: number) => void;
    } = {}
) => {
    const { start, stop, update, loadingData } = useLoadingState(operationKey);
    const completedRef = useRef(0);

    const executeBatch = useCallback(async <TItem, TResult>(
        items: TItem[],
        operation: (item: TItem, index: number) => Promise<TResult>
    ): Promise<TResult[]> => {
        const { concurrency = 3, timeout: operationTimeout = 0 } = options;
        completedRef.current = 0;

        try {
            start({
                message: 'جاري معالجة البيانات...',
                progress: 0,
                cancellable: true,
                onCancel: () => {
                    stop();
                    throw new Error('تم إلغاء العملية');
                },
            });

            const results: TResult[] = [];
            const promises: Promise<void>[] = [];

            for (let i = 0; i < items.length; i += concurrency) {
                const batch = items.slice(i, i + concurrency);

                const batchPromises = batch.map(async (item, batchIndex) => {
                    const globalIndex = i + batchIndex;

                    try {
                        const result = await operation(item, globalIndex);
                        results[globalIndex] = result;

                        completedRef.current++;
                        const progress = (completedRef.current / items.length) * 100;

                        update({
                            progress,
                            message: `تم معالجة ${completedRef.current} من ${items.length}`,
                        });

                        options.onBatchProgress?.(completedRef.current, items.length);
                    } catch (error) {
                        console.error(`فشل في العملية ${globalIndex}:`, error);
                        throw error;
                    }
                });

                promises.push(...batchPromises);

                if (promises.length >= concurrency) {
                    await Promise.all(promises.splice(0, concurrency));
                }
            }

            await Promise.all(promises);

            stop();

            const finalResults = new Array(items.length).fill(null) as TResult[];
            completedRef.current = 0;

            return items.map((_, i) => results[i]);
        } catch (error) {
            stop();
            throw error instanceof Error ? error : new Error('فشل في العملية المجمعة');
        }
    }, [start, stop, update, options]);

    return {
        executeBatch,
        completed: completedRef.current,
        isLoading: loadingData?.loading || false,
        loadingData,
        stop,
    };
};

/**
 * Hook للدمج في العمليات الأخرى مع التوافق
 */
export const useLoadingCompatible = (
    operationKey: string,
    compatibleOperations: {
        /** Hook للعملية غير المتزامنة */
        asyncOp?: ReturnType<typeof useAsyncOperation>;
        /** Hook لعمليات التقدم */
        progressOp?: ReturnType<typeof useProgressOperation>;
        /** Hook للعمليات المجمعة */
        batchOp?: ReturnType<typeof useBatchOperation>;
    }
) => {
    const { isLoading, loadingData } = useLoadingState(operationKey);

    // دمج المعلومات من العمليات المختلفة
    const combinedLoadingData = {
        ...loadingData,
        ...compatibleOperations.asyncOp?.loadingData,
        ...compatibleOperations.progressOp?.loadingData,
        ...compatibleOperations.batchOp?.loadingData,
    };

    const stopAll = useCallback(() => {
        compatibleOperations.asyncOp?.stop();
        compatibleOperations.progressOp?.stop();
        compatibleOperations.batchOp?.stop();
    }, [compatibleOperations]);

    return {
        isLoading: isLoading ||
            compatibleOperations.asyncOp?.isLoading ||
            compatibleOperations.progressOp?.isLoading ||
            compatibleOperations.batchOp?.isLoading,
        loadingData: combinedLoadingData,
        stopAll,
    };
};

export default {
    useAsyncOperation,
    useFileOperation,
    useProgressOperation,
    useBatchOperation,
    useLoadingCompatible,
};
