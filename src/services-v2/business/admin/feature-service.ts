/**
 * خدمة إدارة الميزات - Services v2.0
 *
 * خدمة محسنة لإدارة الميزات والعلامات المميزة مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface Feature {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
    category: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateFeatureVariables {
    featureId: string;
    payload: Partial<Feature>;
}

export class FeatureServiceV2 extends BaseService {
    constructor() {
        super('FeatureServiceV2');
    }

    /**
     * جلب قائمة جميع علامات الميزات مع مراقبة الأداء
     */
    async fetchFeatures(): Promise<Feature[]> {
        const operationId = this.startOperation('fetchFeatures');

        try {
            const response = await fetch('/api/features', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch features');
            }

            const result = await response.json();
            const features = result.data || result;

            this.endOperation(operationId, { success: true, recordCount: features.length });
            return features;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'FeatureServiceV2.fetchFeatures');
            throw error;
        }
    }

    /**
     * تحديث ميزة محددة مع مراقبة شاملة
     */
    async updateFeature(variables: UpdateFeatureVariables, token: string): Promise<Feature> {
        const operationId = this.startOperation('updateFeature');

        try {
            const { featureId, payload } = variables;
            const response = await fetch(`/api/admin/features/${featureId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update feature.');
            }

            const result = await response.json();
            const feature = result.data || result;

            this.endOperation(operationId, { success: true });
            return feature;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'FeatureServiceV2.updateFeature');
            throw error;
        }
    }

    /**
     * تفعيل ميزة مع مراقبة الأداء
     */
    async enableFeature(featureId: string, token: string): Promise<Feature> {
        const operationId = this.startOperation('enableFeature');

        try {
            const response = await fetch(`/api/admin/features/${featureId}/enable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to enable feature');
            }

            const result = await response.json();
            const feature = result.data || result;

            this.endOperation(operationId, { success: true });
            return feature;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'FeatureServiceV2.enableFeature');
            throw error;
        }
    }

    /**
     * إلغاء تفعيل ميزة مع مراقبة شاملة
     */
    async disableFeature(featureId: string, token: string): Promise<Feature> {
        const operationId = this.startOperation('disableFeature');

        try {
            const response = await fetch(`/api/admin/features/${featureId}/disable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to disable feature');
            }

            const result = await response.json();
            const feature = result.data || result;

            this.endOperation(operationId, { success: true });
            return feature;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'FeatureServiceV2.disableFeature');
            throw error;
        }
    }

    /**
     * إنشاء ميزة جديدة مع مراقبة متقدمة
     */
    async createFeature(feature: Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Feature> {
        const operationId = this.startOperation('createFeature');

        try {
            const response = await fetch('/api/admin/features', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(feature)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create feature');
            }

            const result = await response.json();
            const newFeature = result.data || result;

            this.endOperation(operationId, { success: true });
            return newFeature;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'FeatureServiceV2.createFeature');
            throw error;
        }
    }

    /**
     * حذف ميزة مع مراقبة شاملة
     */
    async deleteFeature(featureId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteFeature');

        try {
            const response = await fetch(`/api/admin/features/${featureId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete feature');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'FeatureServiceV2.deleteFeature');
            throw error;
        }
    }
}