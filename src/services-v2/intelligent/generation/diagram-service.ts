/**
 * خدمة توليد المخططات الذكية - Services v2.0
 *
 * خدمة محسنة لتوليد مخططات PlantUML متقدمة مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export type DiagramType =
    | 'class'
    | 'sequence'
    | 'usecase'
    | 'activity'
    | 'component'
    | 'deployment'
    | 'state'
    | 'object'
    | 'package'
    | 'timing'
    | 'network'
    | 'mindmap'
    | 'gantt'
    | 'flowchart'
    | 'er'
    | 'architecture';

export interface DiagramConfig {
    type: DiagramType;
    title?: string;
    description?: string;
    theme?: 'default' | 'cerulean' | 'sketchy' | 'plain' | 'colorful';
    direction?: 'TB' | 'BT' | 'LR' | 'RL';
    skinparam?: Record<string, string>;
    width?: number;
    height?: number;
}

export interface GeneratedDiagram {
    id: string;
    plantUML: string;
    svg?: string;
    png?: string;
    config: DiagramConfig;
    metadata: {
        generationTime: number;
        complexity: number;
        elementsCount: number;
        tokensUsed: number;
    };
    createdAt: string;
}

export interface DiagramValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}

export class IntelligentDiagramServiceV2 extends BaseService {
    constructor() {
        super('IntelligentDiagramServiceV2');
    }

    /**
     * توليد مخطط ذكي مع مراقبة الأداء
     */
    async generateDiagram(config: DiagramConfig, content: string, token: string): Promise<GeneratedDiagram> {
        const operationId = this.startOperation('generateDiagram');

        try {
            const response = await fetch('/api/diagrams/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    config,
                    content
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate diagram');
            }

            const diagram = await response.json();
            this.endOperation(operationId, { success: true, diagramType: config.type });
            return diagram;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.generateDiagram');
            throw error;
        }
    }

    /**
     * توليد مخطط من نص مع مراقبة شاملة
     */
    async generateFromText(text: string, diagramType?: DiagramType, token?: string): Promise<GeneratedDiagram> {
        const operationId = this.startOperation('generateFromText');

        try {
            // تحديد نوع المخطط تلقائياً إذا لم يُحدد
            const type = diagramType || this.detectDiagramType(text);

            const config: DiagramConfig = {
                type,
                theme: 'default',
                direction: 'TB'
            };

            const response = await fetch('/api/diagrams/generate-from-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    text,
                    config
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate diagram from text');
            }

            const diagram = await response.json();
            this.endOperation(operationId, { success: true, diagramType: type });
            return diagram;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.generateFromText');
            throw error;
        }
    }

    /**
     * تحسين مخطط موجود مع مراقبة الأداء
     */
    async optimizeDiagram(diagramId: string, optimizationType: 'layout' | 'style' | 'content' | 'all', token: string): Promise<GeneratedDiagram> {
        const operationId = this.startOperation('optimizeDiagram');

        try {
            const response = await fetch(`/api/diagrams/${diagramId}/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ optimizationType })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to optimize diagram');
            }

            const diagram = await response.json();
            this.endOperation(operationId, { success: true, optimizationType });
            return diagram;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.optimizeDiagram');
            throw error;
        }
    }

    /**
     * تحويل مخطط إلى تنسيق مختلف مع مراقبة شاملة
     */
    async convertDiagram(diagramId: string, targetFormat: 'svg' | 'png' | 'pdf' | 'plantuml', token: string): Promise<{
        format: string;
        data: string;
        url: string;
    }> {
        const operationId = this.startOperation('convertDiagram');

        try {
            const response = await fetch(`/api/diagrams/${diagramId}/convert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetFormat })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to convert diagram');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, targetFormat });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.convertDiagram');
            throw error;
        }
    }

    /**
     * التحقق من صحة مخطط PlantUML مع مراقبة الأداء
     */
    async validateDiagram(plantUML: string): Promise<DiagramValidationResult> {
        const operationId = this.startOperation('validateDiagram');

        try {
            const response = await fetch('/api/diagrams/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plantUML })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to validate diagram');
            }

            const validation = await response.json();
            this.endOperation(operationId, { success: true, isValid: validation.isValid });
            return validation;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.validateDiagram');
            throw error;
        }
    }

    /**
     * اقتراح تحسينات للمخطط مع مراقبة شاملة
     */
    async suggestImprovements(plantUML: string, token?: string): Promise<{
        suggestions: string[];
        improvements: string[];
        warnings: string[];
    }> {
        const operationId = this.startOperation('suggestImprovements');

        try {
            const response = await fetch('/api/diagrams/suggest-improvements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ plantUML })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to suggest improvements');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, suggestionCount: result.suggestions?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.suggestImprovements');
            throw error;
        }
    }

    /**
     * جلب قائمة أنواع المخططات المدعومة مع مراقبة الأداء
     */
    async getSupportedDiagramTypes(): Promise<Array<{
        type: DiagramType;
        title: string;
        description: string;
        category: string;
        complexity: string;
        icon: string;
    }>> {
        const operationId = this.startOperation('getSupportedDiagramTypes');

        try {
            const response = await fetch('/api/diagrams/types', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch diagram types');
            }

            const types = await response.json();
            this.endOperation(operationId, { success: true, typeCount: types.length });
            return types;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.getSupportedDiagramTypes');
            throw error;
        }
    }

    /**
     * حفظ مخطط في المكتبة مع مراقبة شاملة
     */
    async saveDiagram(diagram: GeneratedDiagram, name: string, category?: string, token?: string): Promise<{
        id: string;
        name: string;
        category: string;
        savedAt: string;
    }> {
        const operationId = this.startOperation('saveDiagram');

        try {
            const response = await fetch('/api/diagrams/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    diagram,
                    name,
                    category: category || 'general'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save diagram');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.saveDiagram');
            throw error;
        }
    }

    /**
     * جلب مخططات المستخدم المحفوظة مع مراقبة الأداء
     */
    async getSavedDiagrams(token: string, category?: string): Promise<Array<{
        id: string;
        name: string;
        type: DiagramType;
        thumbnail?: string;
        createdAt: string;
        updatedAt: string;
    }>> {
        const operationId = this.startOperation('getSavedDiagrams');

        try {
            const queryParams = category ? `?category=${category}` : '';
            const response = await fetch(`/api/diagrams/saved${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch saved diagrams');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, diagramCount: result.diagrams?.length || 0 });
            return result.diagrams || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.getSavedDiagrams');
            throw error;
        }
    }

    /**
     * حذف مخطط محفوظ مع مراقبة شاملة
     */
    async deleteSavedDiagram(diagramId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteSavedDiagram');

        try {
            const response = await fetch(`/api/diagrams/saved/${diagramId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete saved diagram');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.deleteSavedDiagram');
            throw error;
        }
    }

    /**
     * مشاركة مخطط مع مراقبة الأداء
     */
    async shareDiagram(diagramId: string, shareWith: string[], permissions: 'view' | 'edit' | 'admin', token: string): Promise<{
        shareId: string;
        shareUrl: string;
        expiresAt?: string;
    }> {
        const operationId = this.startOperation('shareDiagram');

        try {
            const response = await fetch(`/api/diagrams/${diagramId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shareWith,
                    permissions
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to share diagram');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, shareWithCount: shareWith.length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentDiagramServiceV2.shareDiagram');
            throw error;
        }
    }

    // طريقة مساعدة لتحديد نوع المخطط من النص
    private detectDiagramType(text: string): DiagramType {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('class') || lowerText.includes('فئة') || lowerText.includes('فئات')) {
            return 'class';
        }
        if (lowerText.includes('sequence') || lowerText.includes('تسلسل') || lowerText.includes('تفاعل')) {
            return 'sequence';
        }
        if (lowerText.includes('use case') || lowerText.includes('حالة استخدام') || lowerText.includes('مستخدم')) {
            return 'usecase';
        }
        if (lowerText.includes('activity') || lowerText.includes('نشاط') || lowerText.includes('سير عمل')) {
            return 'activity';
        }
        if (lowerText.includes('flowchart') || lowerText.includes('مخطط تدفق') || lowerText.includes('تدفق')) {
            return 'flowchart';
        }
        if (lowerText.includes('architecture') || lowerText.includes('معمارية') || lowerText.includes('نظام')) {
            return 'architecture';
        }

        // الافتراضي
        return 'flowchart';
    }
}