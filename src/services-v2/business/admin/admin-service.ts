/**
 * خدمة الإدارة العامة - Services v2.0
 *
 * خدمة محسنة لإدارة لوحة التحكم وإحصائيات النظام مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface DashboardStats {
    totalUsers: number;
    totalGenerations: number;
    pendingPayments: number;
    agentUsageChartData: { name: string; count: number }[];
    recentActivity: {
        id: string;
        userId: string;
        userName: string;
        agentId: string;
        createdAt: string;
        input: any;
        output: any;
    }[];
}

export class AdminServiceV2 extends BaseService {
    constructor() {
        super('AdminServiceV2');
    }

    /**
     * جلب إحصائيات لوحة التحكم مع مراقبة الأداء
     */
    async fetchDashboardStats(token: string): Promise<DashboardStats> {
        const operationId = this.startOperation('fetchDashboardStats');

        try {
            const response = await fetch('/api/admin/dashboard-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch dashboard stats');
            }

            const result = await response.json();
            const data = result.data || result;

            this.endOperation(operationId, { success: true, recordCount: data.recentActivity?.length || 0 });
            return data;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AdminServiceV2.fetchDashboardStats');
            throw error;
        }
    }

    /**
     * جلب إحصائيات الأداء مع مراقبة متقدمة
     */
    async getPerformanceStats(timeRange: 'day' | 'week' | 'month' = 'day') {
        const operationId = this.startOperation('getPerformanceStats');

        try {
            const response = await fetch(`/api/admin/performance-stats?range=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch performance stats');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result.data;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AdminServiceV2.getPerformanceStats');
            throw error;
        }
    }

    /**
     * إدارة المستخدمين مع مراقبة شاملة
     */
    async manageUsers(action: 'suspend' | 'activate' | 'delete', userIds: string[]) {
        const operationId = this.startOperation('manageUsers');

        try {
            const response = await fetch('/api/admin/manage-users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, userIds })
            });

            if (!response.ok) {
                throw new Error('Failed to manage users');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, affectedCount: userIds.length });
            return result.data;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AdminServiceV2.manageUsers');
            throw error;
        }
    }

    /**
     * مراقبة صحة النظام
     */
    async getSystemHealth() {
        const operationId = this.startOperation('getSystemHealth');

        try {
            const response = await fetch('/api/admin/system-health', {
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch system health');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result.data;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'AdminServiceV2.getSystemHealth');
            throw error;
        }
    }
}