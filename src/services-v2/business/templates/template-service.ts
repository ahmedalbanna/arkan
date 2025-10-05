/**
 * خدمة القوالب - Services v2.0
 *
 * خدمة محسنة لإدارة القوالب المختلفة مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface DocxTemplateProperties {
    id: string;
    name: string;
    description: string;
    category: string;
    styles: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PptxTemplateProperties {
    id: string;
    name: string;
    description: string;
    category: string;
    styles: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ReportTemplateProperties {
    id: string;
    name: string;
    description: string;
    category: string;
    structure: any;
    styles: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProposalTemplateProperties {
    id: string;
    name: string;
    description: string;
    category: string;
    sections: any[];
    styles: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PresentationTemplateProperties {
    id: string;
    name: string;
    description: string;
    category: string;
    slides: any[];
    styles: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export class TemplateServiceV2 extends BaseService {
    constructor() {
        super('TemplateServiceV2');
    }

    // === DOCX Templates ===

    /**
     * جلب قوالب DOCX مع مراقبة الأداء
     */
    async fetchDocxTemplates(): Promise<Record<string, DocxTemplateProperties>> {
        const operationId = this.startOperation('fetchDocxTemplates');

        try {
            const response = await fetch('/api/admin/templates/docx', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch DOCX templates');
            }

            const templates = await response.json();
            this.endOperation(operationId, { success: true, recordCount: Object.keys(templates).length });
            return templates;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.fetchDocxTemplates');
            throw error;
        }
    }

    /**
     * تحديث قالب DOCX مع مراقبة شاملة
     */
    async updateDocxTemplate(variables: { key: string; styles: any }, token: string): Promise<DocxTemplateProperties> {
        const operationId = this.startOperation('updateDocxTemplate');

        try {
            const response = await fetch(`/api/admin/templates/docx/${variables.key}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ styles: variables.styles }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update DOCX template');
            }

            const template = await response.json();
            this.endOperation(operationId, { success: true });
            return template;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.updateDocxTemplate');
            throw error;
        }
    }

    // === PPTX Templates ===

    /**
     * جلب قوالب PPTX مع مراقبة الأداء
     */
    async fetchPptxTemplates(): Promise<Record<string, PptxTemplateProperties>> {
        const operationId = this.startOperation('fetchPptxTemplates');

        try {
            const response = await fetch('/api/admin/templates/pptx', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch PPTX templates');
            }

            const templates = await response.json();
            this.endOperation(operationId, { success: true, recordCount: Object.keys(templates).length });
            return templates;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.fetchPptxTemplates');
            throw error;
        }
    }

    /**
     * تحديث قالب PPTX مع مراقبة شاملة
     */
    async updatePptxTemplate(variables: { key: string; styles: any }, token: string): Promise<PptxTemplateProperties> {
        const operationId = this.startOperation('updatePptxTemplate');

        try {
            const response = await fetch(`/api/admin/templates/pptx/${variables.key}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ styles: variables.styles }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update PPTX template');
            }

            const template = await response.json();
            this.endOperation(operationId, { success: true });
            return template;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.updatePptxTemplate');
            throw error;
        }
    }

    /**
     * حذف قالب PPTX مع مراقبة الأداء
     */
    async deletePptxTemplate(templateId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deletePptxTemplate');

        try {
            const response = await fetch(`/api/admin/templates/pptx/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete PPTX template');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.deletePptxTemplate');
            throw error;
        }
    }

    /**
     * رفع ملف قالب PPTX مع مراقبة شاملة
     */
    async uploadPptxTemplateFile(templateId: string, file: File, token: string): Promise<PptxTemplateProperties> {
        const operationId = this.startOperation('uploadPptxTemplateFile');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`/api/admin/templates/pptx/${templateId}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to upload PPTX template file');
            }

            const template = await response.json();
            this.endOperation(operationId, { success: true });
            return template;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.uploadPptxTemplateFile');
            throw error;
        }
    }

    // === Proposal Templates ===

    /**
     * جلب قوالب المقترحات مع مراقبة الأداء
     */
    async fetchProposalTemplates(): Promise<ProposalTemplateProperties[]> {
        const operationId = this.startOperation('fetchProposalTemplates');

        try {
            const response = await fetch('/api/templates/proposal', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch proposal templates');
            }

            const templates = await response.json();
            this.endOperation(operationId, { success: true, recordCount: templates.length });
            return templates;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.fetchProposalTemplates');
            throw error;
        }
    }

    /**
     * تحديث قالب مقترح مع مراقبة شاملة
     */
    async updateProposalTemplate(templateId: string, data: Partial<ProposalTemplateProperties>, token: string): Promise<ProposalTemplateProperties> {
        const operationId = this.startOperation('updateProposalTemplate');

        try {
            const response = await fetch(`/api/admin/templates/proposal/${templateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update proposal template');
            }

            const template = await response.json();
            this.endOperation(operationId, { success: true });
            return template;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.updateProposalTemplate');
            throw error;
        }
    }

    // === Report Templates ===

    /**
     * جلب قوالب التقارير مع مراقبة الأداء
     */
    async fetchReportTemplates(): Promise<ReportTemplateProperties[]> {
        const operationId = this.startOperation('fetchReportTemplates');

        try {
            const response = await fetch('/api/templates/report', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch report templates');
            }

            const templates = await response.json();
            this.endOperation(operationId, { success: true, recordCount: templates.length });
            return templates;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.fetchReportTemplates');
            throw error;
        }
    }

    /**
     * تحديث قالب تقرير مع مراقبة شاملة
     */
    async updateReportTemplate(templateId: string, data: Partial<ReportTemplateProperties>, token: string): Promise<ReportTemplateProperties> {
        const operationId = this.startOperation('updateReportTemplate');

        try {
            const response = await fetch(`/api/admin/templates/report/${templateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update report template');
            }

            const template = await response.json();
            this.endOperation(operationId, { success: true });
            return template;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.updateReportTemplate');
            throw error;
        }
    }

    // === Presentation Templates ===

    /**
     * جلب قوالب العروض التقديمية مع مراقبة الأداء
     */
    async fetchPresentationTemplates(): Promise<PresentationTemplateProperties[]> {
        const operationId = this.startOperation('fetchPresentationTemplates');

        try {
            const response = await fetch('/api/templates/presentation', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch presentation templates');
            }

            const templates = await response.json();
            this.endOperation(operationId, { success: true, recordCount: templates.length });
            return templates;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.fetchPresentationTemplates');
            throw error;
        }
    }

    /**
     * تحديث قالب عرض تقديمي مع مراقبة شاملة
     */
    async updatePresentationTemplate(templateId: string, data: Partial<PresentationTemplateProperties>, token: string): Promise<PresentationTemplateProperties> {
        const operationId = this.startOperation('updatePresentationTemplate');

        try {
            const response = await fetch(`/api/admin/templates/presentation/${templateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update presentation template');
            }

            const template = await response.json();
            this.endOperation(operationId, { success: true });
            return template;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.updatePresentationTemplate');
            throw error;
        }
    }

    /**
     * إنشاء قالب جديد مع مراقبة الأداء
     */
    async createGenerativeTemplate(templateType: string, id: string, data: any, token: string): Promise<any> {
        const operationId = this.startOperation('createGenerativeTemplate');

        try {
            const response = await fetch(`/api/admin/templates/${templateType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id, ...data }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to create ${templateType} template`);
            }

            const template = await response.json();
            this.endOperation(operationId, { success: true });
            return template;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.createGenerativeTemplate');
            throw error;
        }
    }

    /**
     * تحديث صورة قالب مع مراقبة شاملة
     */
    async refreshTemplateImage(variables: { templateType: string; templateId: string; prompt: string }, token: string): Promise<any> {
        const operationId = this.startOperation('refreshTemplateImage');

        try {
            const response = await fetch('/api/admin/templates/refresh-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(variables),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to refresh template image');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.refreshTemplateImage');
            throw error;
        }
    }

    /**
     * جلب قالب محدد مع مراقبة الأداء
     */
    async getTemplate(templateType: string, templateId: string, token?: string): Promise<any> {
        const operationId = this.startOperation('getTemplate');

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/templates/${templateType}/${templateId}`, {
                headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    this.endOperation(operationId, { success: true, result: 'not-found' });
                    return null;
                }
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch template');
            }

            const template = await response.json();
            this.endOperation(operationId, { success: true });
            return template;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.getTemplate');
            throw error;
        }
    }

    /**
     * حذف قالب مع مراقبة شاملة
     */
    async deleteTemplate(templateType: string, templateId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteTemplate');

        try {
            const response = await fetch(`/api/admin/templates/${templateType}/${templateId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete template');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.deleteTemplate');
            throw error;
        }
    }

    /**
     * نسخ قالب مع مراقبة الأداء
     */
    async duplicateTemplate(templateType: string, templateId: string, newName: string, token: string): Promise<any> {
        const operationId = this.startOperation('duplicateTemplate');

        try {
            const response = await fetch(`/api/admin/templates/${templateType}/${templateId}/duplicate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to duplicate template');
            }

            const template = await response.json();
            this.endOperation(operationId, { success: true });
            return template;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.duplicateTemplate');
            throw error;
        }
    }

    /**
     * جلب إحصائيات القوالب مع مراقبة شاملة
     */
    async getTemplateStats(token: string): Promise<{
        totalTemplates: number;
        templatesByType: Record<string, number>;
        activeTemplates: number;
        recentUpdates: number;
    }> {
        const operationId = this.startOperation('getTemplateStats');

        try {
            const response = await fetch('/api/admin/templates/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch template stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'TemplateServiceV2.getTemplateStats');
            throw error;
        }
    }
}