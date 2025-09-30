/**
 * Hook أساسي لإدارة حالة المعالجة - قابل لإعادة الاستخدام
 * يوفر منطق موحد لإدارة حالات التحميل والمعالجة
 */

import { useCallback, useState } from 'react';

export interface ProcessingStateOptions {
    initialLoading?: boolean;
    onStateChange?: (isProcessing: boolean) => void;
}

export interface ProcessingStateResult {
    isProcessing: boolean;
    setIsProcessing: (value: boolean) => void;
    startProcessing: () => void;
    stopProcessing: () => void;
    toggleProcessing: () => void;
    withProcessing: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

/**
 * Hook أساسي لإدارة حالة المعالجة
 * @param options خيارات إدارة الحالة
 * @returns كائن يحتوي على حالة المعالجة ومعالجات الحالة
 */
export function useProcessingState(
    options: ProcessingStateOptions = {}
): ProcessingStateResult {
    const { initialLoading = false, onStateChange } = options;
    const [isProcessing, setIsProcessingState] = useState(initialLoading);

    const setIsProcessing = useCallback((value: boolean) => {
        setIsProcessingState(value);
        onStateChange?.(value);
    }, [onStateChange]);

    const startProcessing = useCallback(() => {
        setIsProcessing(true);
    }, [setIsProcessing]);

    const stopProcessing = useCallback(() => {
        setIsProcessing(false);
    }, [setIsProcessing]);

    const toggleProcessing = useCallback(() => {
        setIsProcessing(!isProcessing);
    }, [isProcessing, setIsProcessing]);

    const withProcessing = useCallback(async <T>(
        asyncFn: () => Promise<T>
    ): Promise<T> => {
        startProcessing();
        try {
            const result = await asyncFn();
            return result;
        } finally {
            stopProcessing();
        }
    }, [startProcessing, stopProcessing]);

    return {
        isProcessing,
        setIsProcessing,
        startProcessing,
        stopProcessing,
        toggleProcessing,
        withProcessing,
    };
}
