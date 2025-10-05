/**
 * خدمة توليد المقترحات الذكية - Services v2.0
 *
 * خدمة محسنة لتوليد أقسام مقترح المشروع مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export type ProposalSectionType =
    | 'executive_summary'
    | 'problem_statement'
    | 'objectives'
    | 'scope'
    | 'methodology'
    | 'timeline'
    | 'budget'
    | 'team'
    | 'deliverables'
    | 'risk_assessment'
    | 'success_criteria'
    | 'conclusion'
    | 'appendices';

export type ProposalSectionCategory =
    | 'overview'
    | 'planning'
    | 'execution'
    | 'management'
    | 'evaluation';

export type ProposalComplexity = 'basic' | 'detailed' | 'comprehensive';

export interface ProposalStyle {
    tone: 'formal' | 'professional' | 'academic' | 'business';
    length: 'concise' | 'moderate' | 'detailed' | 'extensive';
    format: 'narrative' | 'structured' | 'bullet_points' | 'mixed';
    language: 'ar' | 'en';
}

export interface ProposalSectionInfo {
    type: ProposalSectionType;
    title: string;
    description: string;
    category: ProposalSectionCategory;
    complexity: ProposalComplexity;
    estimatedLength: number;
    requiredInputs: string[];
    optionalInputs: string[];
    dependencies: ProposalSectionType[];
}

export interface GeneratedProposalSection {
    id: string;
    type: ProposalSectionType;
    title: string;
    content: string;
    metadata: {
        wordCount: number;
        readingTime: number;
        complexity: number;
        confidence: number;
        tokensUsed: number;
        generationTime: number;
    };
    style: ProposalStyle;
    createdAt: string;
}

export interface ProposalContext {
    projectTitle: string;
    projectDescription: string;
    targetAudience: string;
    industry: string;
    budget?: number;
    timeline?: string;
    teamSize?: number;
    previousSections?: Record<string, GeneratedProposalSection>;
    customRequirements?: string[];
}

export class IntelligentProposalServiceV2 extends BaseService {
    constructor() {
        super('IntelligentProposalServiceV2');
    }

    /**
     * توليد قسم مقترح ذكي مع مراقبة الأداء
     */
    async generateProposalSection(
        sectionType: ProposalSectionType,
        context: ProposalContext,
        style: ProposalStyle,
        token: string
    ): Promise<GeneratedProposalSection> {
        const operationId = this.startOperation('generateProposalSection');

        try {
            const response = await fetch('/api/proposals/generate-section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sectionType,
                    context,
                    style
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate proposal section');
            }

            const section = await response.json();
            this.endOperation(operationId, { success: true, sectionType });
            return section;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.generateProposalSection');
            throw error;
        }
    }

    /**
     * توليد مقترح كامل مع مراقبة شاملة
     */
    async generateCompleteProposal(
        context: ProposalContext,
        style: ProposalStyle,
        sections?: ProposalSectionType[],
        token?: string
    ): Promise<{
        sections: GeneratedProposalSection[];
        summary: {
            totalWords: number;
            totalSections: number;
            estimatedReadingTime: number;
            overallComplexity: number;
        };
        metadata: {
            generationTime: number;
            tokensUsed: number;
            model: string;
        };
    }> {
        const operationId = this.startOperation('generateCompleteProposal');

        try {
            const sectionsToGenerate = sections || this.getDefaultProposalSections();

            const response = await fetch('/api/proposals/generate-complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    context,
                    style,
                    sections: sectionsToGenerate
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate complete proposal');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: result.sections?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.generateCompleteProposal');
            throw error;
        }
    }

    /**
     * تحسين قسم مقترح مع مراقبة الأداء
     */
    async improveProposalSection(
        sectionId: string,
        improvements: string[],
        token: string
    ): Promise<GeneratedProposalSection> {
        const operationId = this.startOperation('improveProposalSection');

        try {
            const response = await fetch(`/api/proposals/sections/${sectionId}/improve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ improvements })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to improve proposal section');
            }

            const section = await response.json();
            this.endOperation(operationId, { success: true, improvementCount: improvements.length });
            return section;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.improveProposalSection');
            throw error;
        }
    }

    /**
     * إعادة توليد قسم مقترح مع مراقبة شاملة
     */
    async regenerateProposalSection(
        sectionId: string,
        newContext?: Partial<ProposalContext>,
        newStyle?: Partial<ProposalStyle>,
        token?: string
    ): Promise<GeneratedProposalSection> {
        const operationId = this.startOperation('regenerateProposalSection');

        try {
            const response = await fetch(`/api/proposals/sections/${sectionId}/regenerate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    newContext,
                    newStyle
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to regenerate proposal section');
            }

            const section = await response.json();
            this.endOperation(operationId, { success: true });
            return section;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.regenerateProposalSection');
            throw error;
        }
    }

    /**
     * جلب قائمة أقسام المقترح المدعومة مع مراقبة الأداء
     */
    async getSupportedProposalSections(): Promise<ProposalSectionInfo[]> {
        const operationId = this.startOperation('getSupportedProposalSections');

        try {
            const response = await fetch('/api/proposals/sections', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch supported proposal sections');
            }

            const sections = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: sections.length });
            return sections;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.getSupportedProposalSections');
            throw error;
        }
    }

    /**
     * حفظ مقترح في المكتبة مع مراقبة شاملة
     */
    async saveProposal(
        sections: GeneratedProposalSection[],
        name: string,
        category?: string,
        token?: string
    ): Promise<{
        id: string;
        name: string;
        category: string;
        sectionsCount: number;
        savedAt: string;
    }> {
        const operationId = this.startOperation('saveProposal');

        try {
            const response = await fetch('/api/proposals/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    sections,
                    name,
                    category: category || 'general'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save proposal');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: sections.length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.saveProposal');
            throw error;
        }
    }

    /**
     * جلب المقترحات المحفوظة مع مراقبة الأداء
     */
    async getSavedProposals(token: string, category?: string): Promise<Array<{
        id: string;
        name: string;
        category: string;
        sectionsCount: number;
        totalWords: number;
        createdAt: string;
        updatedAt: string;
    }>> {
        const operationId = this.startOperation('getSavedProposals');

        try {
            const queryParams = category ? `?category=${category}` : '';
            const response = await fetch(`/api/proposals/saved${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch saved proposals');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, proposalCount: result.proposals?.length || 0 });
            return result.proposals || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.getSavedProposals');
            throw error;
        }
    }

    /**
     * حذف مقترح محفوظ مع مراقبة شاملة
     */
    async deleteSavedProposal(proposalId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteSavedProposal');

        try {
            const response = await fetch(`/api/proposals/saved/${proposalId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete saved proposal');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.deleteSavedProposal');
            throw error;
        }
    }

    /**
     * تصدير مقترح إلى تنسيق مختلف مع مراقبة الأداء
     */
    async exportProposal(
        sections: GeneratedProposalSection[],
        format: 'pdf' | 'docx' | 'html' | 'markdown',
        options?: {
            includeMetadata?: boolean;
            customStyling?: Record<string, any>;
        },
        token?: string
    ): Promise<{
        format: string;
        data: string;
        filename: string;
        size: number;
    }> {
        const operationId = this.startOperation('exportProposal');

        try {
            const response = await fetch('/api/proposals/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    sections,
                    format,
                    options
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to export proposal');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, format, sectionCount: sections.length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.exportProposal');
            throw error;
        }
    }

    /**
     * اقتراح هيكل مقترح بناءً على المتطلبات مع مراقبة شاملة
     */
    async suggestProposalStructure(context: ProposalContext): Promise<{
        suggestedSections: ProposalSectionType[];
        rationale: string[];
        estimatedLength: number;
        estimatedTime: number;
    }> {
        const operationId = this.startOperation('suggestProposalStructure');

        try {
            const response = await fetch('/api/proposals/suggest-structure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ context })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to suggest proposal structure');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: result.suggestedSections?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.suggestProposalStructure');
            throw error;
        }
    }

    /**
     * تقييم جودة مقترح مع مراقبة الأداء
     */
    async evaluateProposalQuality(sections: GeneratedProposalSection[]): Promise<{
        overallScore: number;
        sectionScores: Record<string, number>;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    }> {
        const operationId = this.startOperation('evaluateProposalQuality');

        try {
            const response = await fetch('/api/proposals/evaluate-quality', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sections })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to evaluate proposal quality');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: sections.length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentProposalServiceV2.evaluateProposalQuality');
            throw error;
        }
    }

    // طريقة مساعدة للحصول على أقسام المقترح الافتراضية
    private getDefaultProposalSections(): ProposalSectionType[] {
        return [
            'executive_summary',
            'problem_statement',
            'objectives',
            'scope',
            'methodology',
            'timeline',
            'budget',
            'team',
            'deliverables',
            'risk_assessment',
            'success_criteria',
            'conclusion'
        ];
    }
}