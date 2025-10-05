/**
 * خدمة Firestore - Infrastructure v2.0
 *
 * خدمة قاعدة البيانات المحسنة مع دعم متقدم للأداء والمراقبة
 */

import { db } from '@/lib/firebase';
import {
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Unsubscribe,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { z } from 'zod';
import { BaseServiceV2, errorHandler } from '../../core/base-service';

// مخططات التحقق من البيانات
const QuerySchema = z.object({
    collection: z.string().min(1, 'Collection name is required'),
    filters: z.array(z.object({
        field: z.string(),
        operator: z.enum(['==', '!=', '>', '<', '>=', '<=', 'in', 'array-contains', 'array-contains-any']),
        value: z.unknown(),
    })).optional(),
    orderBy: z.object({
        field: z.string(),
        direction: z.enum(['asc', 'desc']),
    }).optional(),
    limit: z.number().min(1).max(1000).optional(),
    startAfter: z.string().optional(),
});

const DocumentSchema = z.object({
    collection: z.string().min(1, 'Collection name is required'),
    id: z.string().min(1, 'Document ID is required'),
    data: z.record(z.unknown()),
});

const BatchOperationSchema = z.object({
    operations: z.array(z.object({
        type: z.enum(['set', 'update', 'delete']),
        collection: z.string(),
        id: z.string(),
        data: z.record(z.unknown()).optional(),
    })),
});

// أنواع البيانات
export interface QueryOptions {
    collection: string;
    filters?: Array<{
        field: string;
        operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'array-contains' | 'array-contains-any';
        value: unknown;
    }>;
    orderBy?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    limit?: number;
    startAfter?: string;
}

export interface DocumentOptions {
    collection: string;
    id: string;
    data: Record<string, unknown>;
}

export interface BatchOperation {
    type: 'set' | 'update' | 'delete';
    collection: string;
    id: string;
    data?: Record<string, unknown>;
}

export interface BatchOptions {
    operations: BatchOperation[];
}

/**
 * خدمة استعلامات Firestore المحسنة
 */
export class FirestoreQueryServiceV2 extends BaseServiceV2 {
    protected endpoint = '/api/database/query';
    protected method: 'POST' = 'POST';
    protected requiresAuth = true;

    constructor() {
        super(
            {
                endpoint: '/api/database/query',
                method: 'POST',
                requiresAuth: true,
                timeout: 15000,
                retries: 2,
                retryDelay: 1000,
            },
            {
                name: 'FirestoreQueryService',
                version: '2.0.0',
                description: 'Enhanced Firestore query service with caching',
                category: 'infrastructure',
                dependencies: ['Firestore', 'Firebase'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<QueryOptions> {
        const result = QuerySchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Query validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }

    /**
     * تنفيذ استعلام معقد مع دعم متقدم
     */
    async executeQuery<T = DocumentData>(options: QueryOptions): Promise<{
        documents: T[];
        totalCount?: number;
        hasMore: boolean;
        nextCursor?: string;
    }> {
        try {
            const startTime = Date.now();

            // بناء الاستعلام
            let q = collection(db, options.collection);

            // إضافة الفلاتر
            if (options.filters) {
                options.filters.forEach(filter => {
                    q = query(q, where(filter.field, filter.operator as any, filter.value));
                });
            }

            // إضافة الترتيب
            if (options.orderBy) {
                q = query(q, orderBy(options.orderBy.field, options.orderBy.direction));
            }

            // إضافة الحد الأقصى
            if (options.limit) {
                q = query(q, limit(options.limit));
            }

            // تنفيذ الاستعلام
            const querySnapshot = await getDocs(q);

            const documents = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as T[];

            // حساب المقاييس
            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);

            return {
                documents,
                totalCount: documents.length,
                hasMore: options.limit ? documents.length === options.limit : false,
                nextCursor: querySnapshot.docs.length > 0 ?
                    querySnapshot.docs[querySnapshot.docs.length - 1].id : undefined,
            };
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'FirestoreQueryService',
                operation: 'executeQuery',
                metadata: { collection: options.collection },
            });
            throw error;
        }
    }
}

/**
 * خدمة إدارة المستندات المحسنة
 */
export class FirestoreDocumentServiceV2 extends BaseServiceV2 {
    protected endpoint = '/api/database/document';
    protected method: 'POST' = 'POST';
    protected requiresAuth = true;

    constructor() {
        super(
            {
                endpoint: '/api/database/document',
                method: 'POST',
                requiresAuth: true,
                timeout: 10000,
                retries: 3,
                retryDelay: 1000,
            },
            {
                name: 'FirestoreDocumentService',
                version: '2.0.0',
                description: 'Enhanced Firestore document management service',
                category: 'infrastructure',
                dependencies: ['Firestore', 'Firebase'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<DocumentOptions> {
        const result = DocumentSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Document validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }

    /**
     * إنشاء أو تحديث مستند
     */
    async setDocument(options: DocumentOptions): Promise<string> {
        try {
            const startTime = Date.now();

            const docRef = doc(db, options.collection, options.id);
            await setDoc(docRef, {
                ...options.data,
                updatedAt: serverTimestamp(),
            });

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);

            return options.id;
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'FirestoreDocumentService',
                operation: 'setDocument',
                metadata: { collection: options.collection, id: options.id },
            });
            throw error;
        }
    }

    /**
     * قراءة مستند
     */
    async getDocument<T = DocumentData>(collection: string, id: string): Promise<T | null> {
        try {
            const startTime = Date.now();

            const docRef = doc(db, collection, id);
            const docSnap = await getDoc(docRef);

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as T;
            }

            return null;
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'FirestoreDocumentService',
                operation: 'getDocument',
                metadata: { collection, id },
            });
            throw error;
        }
    }

    /**
     * تحديث مستند
     */
    async updateDocument(collection: string, id: string, data: Record<string, unknown>): Promise<void> {
        try {
            const startTime = Date.now();

            const docRef = doc(db, collection, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp(),
            });

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'FirestoreDocumentService',
                operation: 'updateDocument',
                metadata: { collection, id },
            });
            throw error;
        }
    }

    /**
     * حذف مستند
     */
    async deleteDocument(collection: string, id: string): Promise<void> {
        try {
            const startTime = Date.now();

            const docRef = doc(db, collection, id);
            await deleteDoc(docRef);

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'FirestoreDocumentService',
                operation: 'deleteDocument',
                metadata: { collection, id },
            });
            throw error;
        }
    }
}

/**
 * خدمة العمليات المجمعة المحسنة
 */
export class FirestoreBatchServiceV2 extends BaseServiceV2 {
    protected endpoint = '/api/database/batch';
    protected method: 'POST' = 'POST';
    protected requiresAuth = true;

    constructor() {
        super(
            {
                endpoint: '/api/database/batch',
                method: 'POST',
                requiresAuth: true,
                timeout: 30000,
                retries: 2,
                retryDelay: 2000,
            },
            {
                name: 'FirestoreBatchService',
                version: '2.0.0',
                description: 'Enhanced Firestore batch operations service',
                category: 'infrastructure',
                dependencies: ['Firestore', 'Firebase'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<BatchOptions> {
        const result = BatchOperationSchema.safeParse(data);
        if (!result.success) {
            throw new Error(`Batch operation validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }

    /**
     * تنفيذ عمليات مجمعة
     */
    async executeBatch(operations: BatchOperation[]): Promise<void> {
        try {
            const startTime = Date.now();
            const batch = writeBatch(db);

            operations.forEach(operation => {
                const docRef = doc(db, operation.collection, operation.id);

                switch (operation.type) {
                    case 'set':
                        if (operation.data) {
                            batch.set(docRef, {
                                ...operation.data,
                                createdAt: serverTimestamp(),
                                updatedAt: serverTimestamp(),
                            });
                        }
                        break;
                    case 'update':
                        if (operation.data) {
                            batch.update(docRef, {
                                ...operation.data,
                                updatedAt: serverTimestamp(),
                            });
                        }
                        break;
                    case 'delete':
                        batch.delete(docRef);
                        break;
                }
            });

            await batch.commit();

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'FirestoreBatchService',
                operation: 'executeBatch',
                metadata: { operationCount: operations.length },
            });
            throw error;
        }
    }
}

/**
 * خدمة مراقبة التغييرات في الوقت الفعلي
 */
export class FirestoreRealtimeServiceV2 extends BaseServiceV2 {
    protected endpoint = '/api/database/realtime';
    protected method: 'POST' = 'POST';
    protected requiresAuth = true;

    private listeners: Map<string, Unsubscribe> = new Map();

    constructor() {
        super(
            {
                endpoint: '/api/database/realtime',
                method: 'POST',
                requiresAuth: true,
                timeout: 10000,
                retries: 1,
                retryDelay: 1000,
            },
            {
                name: 'FirestoreRealtimeService',
                version: '2.0.0',
                description: 'Enhanced Firestore realtime updates service',
                category: 'infrastructure',
                dependencies: ['Firestore', 'Firebase'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<{ collection: string, id?: string }> {
        const schema = z.object({
            collection: z.string().min(1),
            id: z.string().optional(),
        });

        const result = schema.safeParse(data);
        if (!result.success) {
            throw new Error(`Realtime validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }

    /**
     * الاشتراك في تحديثات مستند واحد
     */
    subscribeToDocument<T = DocumentData>(
        collection: string,
        id: string,
        callback: (data: T | null) => void
    ): string {
        try {
            const listenerId = `${collection}_${id}_${Date.now()}`;
            const docRef = doc(db, collection, id);

            const unsubscribe = onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    callback({ id: doc.id, ...doc.data() } as T);
                } else {
                    callback(null);
                }
            });

            this.listeners.set(listenerId, unsubscribe);
            return listenerId;
        } catch (error) {
            errorHandler.handle(error, {
                service: 'FirestoreRealtimeService',
                operation: 'subscribeToDocument',
                metadata: { collection, id },
            });
            throw error;
        }
    }

    /**
     * الاشتراك في تحديثات مجموعة
     */
    subscribeToCollection<T = DocumentData>(
        collectionName: string,
        callback: (documents: T[]) => void,
        queryOptions?: QueryOptions
    ): string {
        try {
            const listenerId = `${collectionName}_${Date.now()}`;
            let q = collection(db, collectionName);

            // إضافة الفلاتر إذا كانت موجودة
            if (queryOptions?.filters) {
                queryOptions.filters.forEach(filter => {
                    q = query(q, where(filter.field, filter.operator as any, filter.value));
                });
            }

            // إضافة الترتيب إذا كان موجود
            if (queryOptions?.orderBy) {
                q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction));
            }

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const documents = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as T[];

                callback(documents);
            });

            this.listeners.set(listenerId, unsubscribe);
            return listenerId;
        } catch (error) {
            errorHandler.handle(error, {
                service: 'FirestoreRealtimeService',
                operation: 'subscribeToCollection',
                metadata: { collection: collectionName },
            });
            throw error;
        }
    }

    /**
     * إلغاء الاشتراك
     */
    unsubscribe(listenerId: string): void {
        const unsubscribe = this.listeners.get(listenerId);
        if (unsubscribe) {
            unsubscribe();
            this.listeners.delete(listenerId);
        }
    }

    /**
     * إلغاء جميع الاشتراكات
     */
    unsubscribeAll(): void {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners.clear();
    }
}

/**
 * خدمة إدارة المعاملات المحسنة
 */
export class FirestoreTransactionServiceV2 extends BaseServiceV2 {
    protected endpoint = '/api/database/transaction';
    protected method: 'POST' = 'POST';
    protected requiresAuth = true;

    constructor() {
        super(
            {
                endpoint: '/api/database/transaction',
                method: 'POST',
                requiresAuth: true,
                timeout: 30000,
                retries: 1,
                retryDelay: 1000,
            },
            {
                name: 'FirestoreTransactionService',
                version: '2.0.0',
                description: 'Enhanced Firestore transaction service',
                category: 'infrastructure',
                dependencies: ['Firestore', 'Firebase'],
                performance: {
                    averageResponseTime: 0,
                    successRate: 0,
                    lastHealthCheck: new Date(),
                },
            }
        );
    }

    protected async validateInput(data: unknown): Promise<{
        operations: Array<{
            type: 'read' | 'write';
            collection: string;
            id: string;
            data?: Record<string, unknown>;
        }>;
    }> {
        const schema = z.object({
            operations: z.array(z.object({
                type: z.enum(['read', 'write']),
                collection: z.string(),
                id: z.string(),
                data: z.record(z.unknown()).optional(),
            })),
        });

        const result = schema.safeParse(data);
        if (!result.success) {
            throw new Error(`Transaction validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
        }
        return result.data;
    }

    /**
     * تنفيذ معاملة معقدة
     */
    async executeTransaction<T>(
        operations: Array<{
            type: 'read' | 'write';
            collection: string;
            id: string;
            data?: Record<string, unknown>;
        }>
    ): Promise<T> {
        try {
            const startTime = Date.now();

            const result = await db.runTransaction(async (transaction) => {
                const results: any[] = [];

                for (const operation of operations) {
                    const docRef = doc(db, operation.collection, operation.id);

                    if (operation.type === 'read') {
                        const docSnap = await transaction.get(docRef);
                        results.push(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
                    } else if (operation.type === 'write' && operation.data) {
                        transaction.set(docRef, {
                            ...operation.data,
                            updatedAt: serverTimestamp(),
                        });
                        results.push({ id: operation.id, success: true });
                    }
                }

                return results as T;
            });

            const responseTime = Date.now() - startTime;
            this.updatePerformanceMetrics(responseTime, true);

            return result;
        } catch (error) {
            this.updatePerformanceMetrics(0, false);
            errorHandler.handle(error, {
                service: 'FirestoreTransactionService',
                operation: 'executeTransaction',
                metadata: { operationCount: operations.length },
            });
            throw error;
        }
    }
}

// نسخ من الخدمات الأصلية للحفاظ على التوافق
export class FirestoreQueryService extends FirestoreQueryServiceV2 { }
export class FirestoreDocumentService extends FirestoreDocumentServiceV2 { }
export class FirestoreBatchService extends FirestoreBatchServiceV2 { }
export class FirestoreRealtimeService extends FirestoreRealtimeServiceV2 { }
export class FirestoreTransactionService extends FirestoreTransactionServiceV2 { }
