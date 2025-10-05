/**
 * خدمة سجلات التوليد - Services v2.0
 *
 * خدمة محسنة لإدارة سجلات التوليد والمراقبة مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface GenerationLog {
    id: string;
    agentId: string;
    userId: string;
    userName: string;
    input: any;
    output: any;
    createdAt: string;
    duration?: number;
    success: boolean;
    error?: string;
}

export interface FetchLogsParams {
    token: string;
    limit: number;
    agentId?: string;
    userId?: string;
    lastVisibleId?: string;
    startDate?: string;
    endDate?: string;
    success?: boolean;
}

export interface LogsResponse {
    logs: GenerationLog[];
    hasNextPage: boolean;
    lastVisibleId: string | null;
    totalCount: number;
}

export class GenerationLogServiceV2 extends BaseService {
    constructor() {
        super('GenerationLogServiceV2');
    }

    /**
     * جلب سجلات التوليد مع مراقبة الأداء
     */
    async fetchGenerationLogs(params: FetchLogsParams): Promise<LogsResponse> {
        const operationId = this.startOperation('fetchGenerationLogs');

        try {
            const { token, limit, agentId, userId, lastVisibleId, startDate, endDate, success } = params;

            if (!token) {
                throw new Error("Authentication token is required.");
            }

            const queryParams = new URLSearchParams({
                limit: limit.toString(),
            });

            if (agentId) queryParams.append('agentId', agentId);
            if (userId) queryParams.append('userId', userId);
            if (lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            if (success !== undefined) queryParams.append('success', success.toString());

            const response = await fetch(`/api/admin/generations?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch generation logs');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, recordCount: result.logs?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GenerationLogServiceV2.fetchGenerationLogs');
            throw error;
        }
    }

    /**
     * جلب سجل توليد محدد مع مراقبة شاملة
     */
    async fetchGenerationLog(logId: string, token: string): Promise<GenerationLog | null> {
        const operationId = this.startOperation('fetchGenerationLog');

        try {
            const response = await fetch(`/api/admin/generations/${logId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    this.endOperation(operationId, { success: true, result: 'not-found' });
                    return null;
                }
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch generation log');
            }

            const log = await response.json();
            this.endOperation(operationId, { success: true });
            return log;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GenerationLogServiceV2.fetchGenerationLog');
            throw error;
        }
    }

    /**
     * حذف سجل توليد مع مراقبة الأداء
     */
    async deleteGenerationLog(logId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteGenerationLog');

        try {
            const response = await fetch(`/api/admin/generations/${logId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete generation log');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GenerationLogServiceV2.deleteGenerationLog');
            throw error;
        }
    }

    /**
     * حذف سجلات التوليد بالجملة مع مراقبة شاملة
     */
    async deleteGenerationLogs(logIds: string[], token: string): Promise<{ deletedCount: number }> {
        const operationId = this.startOperation('deleteGenerationLogs');

        try {
            const response = await fetch('/api/admin/generations/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ logIds })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete generation logs');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, deletedCount: logIds.length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GenerationLogServiceV2.deleteGenerationLogs');
            throw error;
        }
    }

    /**
     * جلب إحصائيات التوليد مع مراقبة متقدمة
     */
    async getGenerationStats(token: string, timeRange: 'day' | 'week' | 'month' = 'day') {
        const operationId = this.startOperation('getGenerationStats');

        try {
            const response = await fetch(`/api/admin/generations/stats?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch generation stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GenerationLogServiceV2.getGenerationStats');
            throw error;
        }
    }

    /**
     * تصدير سجلات التوليد مع مراقبة الأداء
     */
    async exportGenerationLogs(params: FetchLogsParams): Promise<string> {
        const operationId = this.startOperation('exportGenerationLogs');

        try {
            const { token, limit, agentId, userId, lastVisibleId, startDate, endDate, success } = params;

            if (!token) {
                throw new Error("Authentication token is required.");
            }

            const queryParams = new URLSearchParams({
                limit: limit.toString(),
                export: 'true'
            });

            if (agentId) queryParams.append('agentId', agentId);
            if (userId) queryParams.append('userId', userId);
            if (lastVisibleId) queryParams.append('lastVisibleId', lastVisibleId);
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            if (success !== undefined) queryParams.append('success', success.toString());

            const response = await fetch(`/api/admin/generations?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to export generation logs');
            }

            const csvData = await response.text();
            this.endOperation(operationId, { success: true });
            return csvData;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GenerationLogServiceV2.exportGenerationLogs');
            throw error;
        }
    }

    /**
     * تنظيف السجلات القديمة مع مراقبة شاملة
     */
    async cleanupOldLogs(olderThanDays: number, token: string): Promise<{ deletedCount: number }> {
        const operationId = this.startOperation('cleanupOldLogs');

        try {
            const response = await fetch('/api/admin/generations/cleanup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ olderThanDays })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to cleanup old logs');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, deletedCount: result.deletedCount });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'GenerationLogServiceV2.cleanupOldLogs');
            throw error;
        }
    }
}