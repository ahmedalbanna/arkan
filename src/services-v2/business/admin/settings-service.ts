/**
 * خدمة الإعدادات - Services v2.0
 *
 * خدمة محسنة لإدارة الإعدادات العامة مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface SystemSettings {
    id: string;
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    maxUsersPerTeam: number;
    aiModel: string;
    defaultLanguage: string;
    timezone: string;
    features: Record<string, boolean>;
    limits: {
        maxProjectsPerUser: number;
        maxFileSize: number;
        maxGenerationsPerDay: number;
    };
    createdAt: string;
    updatedAt: string;
}

export class SettingsServiceV2 extends BaseService {
    constructor() {
        super('SettingsServiceV2');
    }

    /**
     * جلب الإعدادات العامة مع مراقبة الأداء
     */
    async fetchPublicSettings(): Promise<SystemSettings> {
        const operationId = this.startOperation('fetchPublicSettings');

        try {
            const response = await fetch('/api/admin/settings', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }

            const settings = await response.json();
            this.endOperation(operationId, { success: true });
            return settings;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SettingsServiceV2.fetchPublicSettings');
            throw error;
        }
    }

    /**
     * تحديث الإعدادات مع مراقبة شاملة
     */
    async updateSettings(settings: Partial<SystemSettings>, token: string): Promise<SystemSettings> {
        const operationId = this.startOperation('updateSettings');

        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update settings');
            }

            const updatedSettings = await response.json();
            this.endOperation(operationId, { success: true });
            return updatedSettings;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SettingsServiceV2.updateSettings');
            throw error;
        }
    }

    /**
     * جلب إعدادات النظام الداخلية مع مراقبة الأداء
     */
    async fetchSystemSettings(token: string): Promise<SystemSettings> {
        const operationId = this.startOperation('fetchSystemSettings');

        try {
            const response = await fetch('/api/admin/settings/internal', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch system settings');
            }

            const settings = await response.json();
            this.endOperation(operationId, { success: true });
            return settings;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SettingsServiceV2.fetchSystemSettings');
            throw error;
        }
    }

    /**
     * تفعيل وضع الصيانة مع مراقبة شاملة
     */
    async enableMaintenanceMode(token: string): Promise<SystemSettings> {
        const operationId = this.startOperation('enableMaintenanceMode');

        try {
            const response = await fetch('/api/admin/settings/maintenance/enable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to enable maintenance mode');
            }

            const settings = await response.json();
            this.endOperation(operationId, { success: true });
            return settings;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SettingsServiceV2.enableMaintenanceMode');
            throw error;
        }
    }

    /**
     * إلغاء تفعيل وضع الصيانة مع مراقبة الأداء
     */
    async disableMaintenanceMode(token: string): Promise<SystemSettings> {
        const operationId = this.startOperation('disableMaintenanceMode');

        try {
            const response = await fetch('/api/admin/settings/maintenance/disable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to disable maintenance mode');
            }

            const settings = await response.json();
            this.endOperation(operationId, { success: true });
            return settings;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SettingsServiceV2.disableMaintenanceMode');
            throw error;
        }
    }

    /**
     * تحديث حدود النظام مع مراقبة شاملة
     */
    async updateSystemLimits(limits: Partial<SystemSettings['limits']>, token: string): Promise<SystemSettings> {
        const operationId = this.startOperation('updateSystemLimits');

        try {
            const response = await fetch('/api/admin/settings/limits', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ limits })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update system limits');
            }

            const settings = await response.json();
            this.endOperation(operationId, { success: true });
            return settings;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SettingsServiceV2.updateSystemLimits');
            throw error;
        }
    }

    /**
     * جلب إحصائيات الأداء مع مراقبة متقدمة
     */
    async getPerformanceStats(token: string) {
        const operationId = this.startOperation('getPerformanceStats');

        try {
            const response = await fetch('/api/admin/settings/performance', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch performance stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SettingsServiceV2.getPerformanceStats');
            throw error;
        }
    }

    /**
     * تصدير إعدادات النظام مع مراقبة الأداء
     */
    async exportSettings(token: string): Promise<string> {
        const operationId = this.startOperation('exportSettings');

        try {
            const response = await fetch('/api/admin/settings/export', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to export settings');
            }

            const settings = await response.text();
            this.endOperation(operationId, { success: true });
            return settings;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SettingsServiceV2.exportSettings');
            throw error;
        }
    }

    /**
     * استيراد إعدادات النظام مع مراقبة شاملة
     */
    async importSettings(settingsJson: string, token: string): Promise<SystemSettings> {
        const operationId = this.startOperation('importSettings');

        try {
            const response = await fetch('/api/admin/settings/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: settingsJson
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to import settings');
            }

            const settings = await response.json();
            this.endOperation(operationId, { success: true });
            return settings;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SettingsServiceV2.importSettings');
            throw error;
        }
    }
}