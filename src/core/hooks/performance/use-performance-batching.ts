/**
 * Performance Batching Hook متقدم
 *
 * يوفر ضم العمليات والمهام لتقليل re-renders وتحسين الأداء
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface BatchOperation<T = any> {
    /** معرف فريد للعملية */
    id: string;
    /** نوع العملية */
    type: string;
    /** بيانات العملية */
    data: T;
    /** أولوية العملية */
    priority: number;
    /** مهلة زمنية */
    deadline: number;
    /** معرف المجموعة */
    groupId?: string;
}

export interface BatchOptions {
    /** انتظار أطول فترة لبدء Batch */
    maxBatchDelay: number;
    /** أقصى عدد عمليات في Batch واحد */
    maxBatchSize: number;
    /** ترقية أولوية العمليات المنتهية الصلاحية */
    boostExpiredPriority: boolean;
    /** تمكين تقطيع العملية */
    enableChunking: boolean;
    /** حجم القطعة للمعالجة */
    chunkSize?: number;
}

export interface BatcherReturn<T = any> {
    /** إضافة عملية جديدة */
    addOperation: (operation: Omit<BatchOperation<T>, 'id' | 'deadline'>) => Promise<any>;
    /** معالجة العمليات */
    process: () => Promise<void>;
    /** تنظيف عمليات منتهية الصلاحية */
    cleanup: () => void;
    /** إحصائيات الأداء */
    stats: {
        pendingOperations: number;
        processedBatches: number;
        totalOperations: number;
        averageBatchSize: number;
        averageProcessingTime: number;
    };
    /** حالات المعالجة */
    processingStates: {
        isProcessing: boolean;
        activeBatches: number;
        queuedOperations: number;
    };
}

/**
 * Hook للمعالجة المجمعة فائقة الأداء
 */
export function usePerformanceBatching<T = any>(
    processor: (operations: BatchOperation<T>[]) => Promise<any[]>,
    options: BatchOptions = {
        maxBatchDelay: 100,
        maxBatchSize: 50,
        boostExpiredPriority: true,
        enableChunking: true,
        chunkSize: 10
    }
): BatcherReturn<T> {
    const [operations, setOperations] = useState<Map<string, BatchOperation<T>>>(new Map());
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeBatches, setActiveBatches] = useState(0);
    const [stats, setStats] = useState({
        pendingOperations: 0,
        processedBatches: 0,
        totalOperations: 0,
        averageBatchSize: 0,
        averageProcessingTime: 0
    });

    const batchTimerRef = useRef<NodeJS.Timeout>();
    const processingStartTime = useRef<number[]>([]);

    // إضافة عملية جديدة
    const addOperation = useCallback(async (
        operation: Omit<BatchOperation<T>, 'id' | 'deadline'>
    ) => {
        const id = `${operation.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const deadline = Date.now() + (operation.priority * 1000); // المهلة حسب الأولوية

        const newOperation: BatchOperation<T> = {
            ...operation,
            id,
            deadline
        };

        setOperations(prev => {
            const newOps = new Map(prev);
            newOps.set(id, newOperation);
            return newOps;
        });

        // بدء معالجة فوري إذا كان لدينا عمليات كثيرة
        if (operations.size >= options.maxBatchSize) {
            await process();
        } else if (!batchTimerRef.current) {
            // تأجيل المعالجة لملء Batch
            batchTimerRef.current = setTimeout(() => {
                process();
            }, options.maxBatchDelay);
        }

        return newOperation.id;
    }, [operations.size, options.maxBatchDelay, options.maxBatchSize]);

    // معالجة العمليات المجمعة
    const process = useCallback(async () => {
        if (isProcessing || operations.size === 0) return;

        // تنظيف العمليات المنتهية الصلاحية
        const now = Date.now();
        const validOperations = Array.from(operations.values())
            .filter(op => {
                if (!options.boostExpiredPriority) return true;

                if (op.deadline <= now) {
                    op.priority += 10; // زيادة الأولوية للعمليات المنتهية
                }
                return true;
            })
            .sort((a, b) => b.priority - a.priority); // ترتيب حسب الأولوية

        if (validOperations.length === 0) return;

        setIsProcessing(true);
        processingStartTime.current.push(Date.now());

        try {
            if (options.enableChunking && validOperations.length > (options.maxBatchSize || 10)) {
                // معالجة مجزأة للعمليات الكثيرة
                const chunks = [];
                for (let i = 0; i < validOperations.length; i += (options.chunkSize || 10)) {
                    chunks.push(validOperations.slice(i, i + (options.chunkSize || 10)));
                }

                setActiveBatches(chunks.length);

                for (const chunk of chunks) {
                    await processor(chunk);
                    setActiveBatches(prev => Math.max(0, prev - 1));
                }
            } else {
                // معالجة دفعة واحدة
                setActiveBatches(1);
                const batchSize = Math.min(validOperations.length, options.maxBatchSize);
                await processor(validOperations.slice(0, batchSize));
            }

            // تحديث الإحصائيات
            setStats(prev => {
                const processingTime = Date.now() - processingStartTime.current[0];
                const batchSize = validOperations.length;

                return {
                    ...prev,
                    processedBatches: prev.processedBatches + 1,
                    totalOperations: prev.totalOperations + batchSize,
                    averageBatchSize: (prev.averageBatchSize * prev.processedBatches + batchSize) / (prev.processedBatches + 1),
                    averageProcessingTime: (prev.averageProcessingTime * prev.processedBatches + processingTime) / (prev.processedBatches + 1)
                };
            });

            // إزالة العمليات المعالجة من القائمة
            const processedIds = validOperations.map(op => op.id);
            setOperations(prev => {
                const newOps = new Map(prev);
                processedIds.forEach(id => newOps.delete(id));
                return newOps;
            });

        } catch (error) {
            console.error('Batch processing error:', error);

            // إعادة العمليات التي فشلت في المعالجة مع أولوية أعلى
            validOperations.forEach(op => {
                op.priority += 5;
                op.deadline = Date.now() + 5000; // 5 ثوان إضافية
            });
        } finally {
            setIsProcessing(false);
            setActiveBatches(0);
            processingStartTime.current = [];

            // إعادة تشغيل timer إذا كان هناك عمليات جديدة
            if (operations.size > 0 && !batchTimerRef.current) {
                batchTimerRef.current = setTimeout(() => {
                    process();
                }, options.maxBatchDelay);
            }
        }
    }, [operations, isProcessing, processor, options]);

    // تنظيف العمليات المنتهية الصلاحية
    const cleanup = useCallback(() => {
        const now = Date.now();
        setOperations(prev => {
            const newOps = new Map();
            for (const [id, op] of prev) {
                if (op.deadline > now) {
                    newOps.set(id, op);
                }
            }
            return newOps;
        });
    }, []);

    // تنظيف دوري
    useEffect(() => {
        const cleanupInterval = setInterval(cleanup, 30000); // كل 30 ثانية
        return () => {
            clearInterval(cleanupInterval);
            if (batchTimerRef.current) {
                clearTimeout(batchTimerRef.current);
            }
        };
    }, [cleanup]);

    // تحديث إحصائيات العمليات المعلقة
    useEffect(() => {
        setStats(prev => ({
            ...prev,
            pendingOperations: operations.size
        }));
    }, [operations.size]);

    return {
        addOperation,
        process,
        cleanup,
        stats,
        processingStates: {
            isProcessing,
            activeBatches,
            queuedOperations: operations.size
        }
    };
}

export default usePerformanceBatching;
