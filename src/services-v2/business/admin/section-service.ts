/**
 * خدمة إدارة الأقسام - Services v2.0
 *
 * خدمة محسنة لإدارة أقسام التقارير والمخططات والعروض مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface SectionProperties {
    id: string;
    name: string;
    description: string;
    type: string;
    category: string;
    template: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export class SectionServiceV2 extends BaseService {
    constructor() {
        super('SectionServiceV2');
    }

    /**
     * جلب قائمة الأقسام مع مراقبة الأداء
     */
    async fetchSections(token: string): Promise<SectionProperties[]> {
        const operationId = this.startOperation('fetchSections');

        try {
            const response = await fetch('/api/admin/sections', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sections');
            }

            const sections = await response.json();
            this.endOperation(operationId, { success: true, recordCount: sections.length });
            return sections;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SectionServiceV2.fetchSections');
            throw error;
        }
    }

    /**
     * إنشاء قسم جديد مع مراقبة شاملة
     */
    async createSection(data: Omit<SectionProperties, 'id'> & { id: string }, token: string): Promise<SectionProperties> {
        const operationId = this.startOperation('createSection');

        try {
            const response = await fetch('/api/admin/sections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create section');
            }

            const section = await response.json();
            this.endOperation(operationId, { success: true });
            return section;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SectionServiceV2.createSection');
            throw error;
        }
    }

    /**
     * تحديث قسم مع مراقبة الأداء
     */
    async updateSection(sectionId: string, data: Partial<SectionProperties>, token: string): Promise<SectionProperties> {
        const operationId = this.startOperation('updateSection');

        try {
            const response = await fetch(`/api/admin/sections/${sectionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update section');
            }

            const section = await response.json();
            this.endOperation(operationId, { success: true });
            return section;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SectionServiceV2.updateSection');
            throw error;
        }
    }

    /**
     * حذف قسم مع مراقبة شاملة
     */
    async deleteSection(sectionId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteSection');

        try {
            const response = await fetch(`/api/admin/sections/${sectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete section');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SectionServiceV2.deleteSection');
            throw error;
        }
    }

    /**
     * جلب قسم محدد مع مراقبة الأداء
     */
    async fetchSection(sectionId: string, token: string): Promise<SectionProperties | null> {
        const operationId = this.startOperation('fetchSection');

        try {
            const response = await fetch(`/api/admin/sections/${sectionId}`, {
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
                throw new Error('Failed to fetch section');
            }

            const section = await response.json();
            this.endOperation(operationId, { success: true });
            return section;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SectionServiceV2.fetchSection');
            throw error;
        }
    }

    /**
     * تفعيل قسم مع مراقبة شاملة
     */
    async activateSection(sectionId: string, token: string): Promise<SectionProperties> {
        const operationId = this.startOperation('activateSection');

        try {
            const response = await fetch(`/api/admin/sections/${sectionId}/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to activate section');
            }

            const section = await response.json();
            this.endOperation(operationId, { success: true });
            return section;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SectionServiceV2.activateSection');
            throw error;
        }
    }

    /**
     * إلغاء تفعيل قسم مع مراقبة الأداء
     */
    async deactivateSection(sectionId: string, token: string): Promise<SectionProperties> {
        const operationId = this.startOperation('deactivateSection');

        try {
            const response = await fetch(`/api/admin/sections/${sectionId}/deactivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to deactivate section');
            }

            const section = await response.json();
            this.endOperation(operationId, { success: true });
            return section;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'SectionServiceV2.deactivateSection');
            throw error;
        }
    }
}