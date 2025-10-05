/**
 * خدمة معالجة المستندات - Services v2.0
 *
 * خدمة محسنة لمعالجة المستندات وتحويلها إلى Markdown مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface ProcessedDocument {
    id: string;
    originalName: string;
    fileType: string;
    markdown: string;
    metadata: {
        pageCount?: number;
        wordCount: number;
        characterCount: number;
        language?: string;
        processingTime: number;
        quality: number;
    };
    extractedElements: {
        images?: Array<{
            url: string;
            description: string;
            pageNumber?: number;
        }>;
        tables?: Array<{
            data: Array<Array<string | number>>;
            headers: string[];
            caption?: string;
        }>;
        charts?: Array<{
            type: string;
            data: any;
            description: string;
        }>;
    };
    createdAt: string;
}

export interface ProcessingOptions {
    extractImages?: boolean;
    extractTables?: boolean;
    extractCharts?: boolean;
    ocrEnabled?: boolean;
    language?: string;
    quality?: 'draft' | 'standard' | 'high';
}

export class DocumentProcessingServiceV2 extends BaseService {
    constructor() {
        super('DocumentProcessingServiceV2');
    }

    /**
     * معالجة ملف وتحويله إلى Markdown مع مراقبة الأداء
     */
    async processFile(formData: FormData, token: string): Promise<ProcessedDocument> {
        const operationId = this.startOperation('processFile');

        try {
            const response = await fetch('/api/document-processing/process-file', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to process file.');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.processFile');
            throw error;
        }
    }

    /**
     * معالجة ملف مع خيارات متقدمة مع مراقبة شاملة
     */
    async processFileWithOptions(
        formData: FormData,
        options: ProcessingOptions,
        token: string
    ): Promise<ProcessedDocument> {
        const operationId = this.startOperation('processFileWithOptions');

        try {
            const response = await fetch('/api/document-processing/process-file', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    formData,
                    options
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to process file with options.');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, options });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.processFileWithOptions');
            throw error;
        }
    }

    /**
     * استخراج جداول من مستند مع مراقبة الأداء
     */
    async extractTables(file: File, token: string): Promise<Array<{
        data: Array<Array<string | number>>;
        headers: string[];
        caption?: string;
        pageNumber?: number;
    }>> {
        const operationId = this.startOperation('extractTables');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/document-processing/extract-tables', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to extract tables.');
            }

            const tables = await response.json();
            this.endOperation(operationId, { success: true, tableCount: tables.length });
            return tables;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.extractTables');
            throw error;
        }
    }

    /**
     * استخراج صور من مستند مع مراقبة شاملة
     */
    async extractImages(file: File, token: string): Promise<Array<{
        url: string;
        description: string;
        pageNumber?: number;
        width?: number;
        height?: number;
    }>> {
        const operationId = this.startOperation('extractImages');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/document-processing/extract-images', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to extract images.');
            }

            const images = await response.json();
            this.endOperation(operationId, { success: true, imageCount: images.length });
            return images;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.extractImages');
            throw error;
        }
    }

    /**
     * تحليل جودة معالجة المستند مع مراقبة الأداء
     */
    async analyzeProcessingQuality(documentId: string, token: string): Promise<{
        overallQuality: number;
        issues: string[];
        recommendations: string[];
        confidence: number;
    }> {
        const operationId = this.startOperation('analyzeProcessingQuality');

        try {
            const response = await fetch(`/api/document-processing/${documentId}/quality`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to analyze processing quality');
            }

            const quality = await response.json();
            this.endOperation(operationId, { success: true, quality: quality.overallQuality });
            return quality;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.analyzeProcessingQuality');
            throw error;
        }
    }

    /**
     * إعادة معالجة مستند مع تحسينات مع مراقبة شاملة
     */
    async reprocessDocument(
        documentId: string,
        improvements: string[],
        token: string
    ): Promise<ProcessedDocument> {
        const operationId = this.startOperation('reprocessDocument');

        try {
            const response = await fetch(`/api/document-processing/${documentId}/reprocess`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ improvements })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to reprocess document');
            }

            const document = await response.json();
            this.endOperation(operationId, { success: true, improvementCount: improvements.length });
            return document;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.reprocessDocument');
            throw error;
        }
    }

    /**
     * جلب تاريخ معالجة المستندات مع مراقبة الأداء
     */
    async getProcessingHistory(token: string, limit: number = 20): Promise<Array<{
        id: string;
        originalName: string;
        fileType: string;
        processedAt: string;
        quality: number;
        wordCount: number;
    }>> {
        const operationId = this.startOperation('getProcessingHistory');

        try {
            const response = await fetch(`/api/document-processing/history?limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch processing history');
            }

            const history = await response.json();
            this.endOperation(operationId, { success: true, recordCount: history.length });
            return history;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.getProcessingHistory');
            throw error;
        }
    }

    /**
     * حذف مستند معالج مع مراقبة شاملة
     */
    async deleteProcessedDocument(documentId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteProcessedDocument');

        try {
            const response = await fetch(`/api/document-processing/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete processed document');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.deleteProcessedDocument');
            throw error;
        }
    }

    /**
     * تحسين جودة النص المستخرج مع مراقبة الأداء
     */
    async improveExtractedText(text: string, improvements: string[]): Promise<{
        improvedText: string;
        changes: string[];
        qualityScore: number;
    }> {
        const operationId = this.startOperation('improveExtractedText');

        try {
            const response = await fetch('/api/document-processing/improve-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, improvements })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to improve extracted text');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, improvementCount: improvements.length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.improveExtractedText');
            throw error;
        }
    }

    /**
     * استخراج البيانات الهيكلية من مستند مع مراقبة شاملة
     */
    async extractStructuredData(file: File, schema: any, token: string): Promise<{
        extractedData: Record<string, any>;
        confidence: number;
        validationErrors: string[];
    }> {
        const operationId = this.startOperation('extractStructuredData');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('schema', JSON.stringify(schema));

            const response = await fetch('/api/document-processing/extract-structured', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to extract structured data');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, confidence: result.confidence });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.extractStructuredData');
            throw error;
        }
    }

    /**
     * جلب إحصائيات معالجة المستندات مع مراقبة الأداء
     */
    async getProcessingStats(token?: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
        totalProcessed: number;
        averageQuality: number;
        averageProcessingTime: number;
        fileTypes: Record<string, number>;
        topIssues: string[];
        successRate: number;
    }> {
        const operationId = this.startOperation('getProcessingStats');

        try {
            const response = await fetch(`/api/document-processing/stats?range=${timeRange}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch processing stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'DocumentProcessingServiceV2.getProcessingStats');
            throw error;
        }
    }
}