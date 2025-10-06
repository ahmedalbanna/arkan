/**
 * خدمة توليد التقارير الذكية - Services v2.0
 *
 * خدمة محسنة للتعامل مع API توليد التقارير مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export type SectionName =
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
    | 'appendices'
    | 'systemDesign'
    | 'systemProgramming'
    | 'designStrategy'
    | 'testingStrategy'
    | 'deploymentStrategy'
    | 'maintenanceStrategy'
    | 'securityConsiderations'
    | 'performanceOptimization'
    | 'scalabilityPlanning'
    | 'userExperience'
    | 'dataManagement'
    | 'integrationStrategy'
    | 'migrationStrategy'
    | 'trainingDocumentation'
    | 'supportStrategy'
    | 'monitoringEvaluation'
    | 'lessonsLearned'
    | 'futureRecommendations'
    | 'costBenefitAnalysis'
    | 'roiAnalysis'
    | 'stakeholderAnalysis'
    | 'communicationPlan'
    | 'changeManagement'
    | 'qualityAssurance'
    | 'riskManagement'
    | 'resourcePlanning'
    | 'procurementStrategy'
    | 'vendorManagement'
    | 'legalCompliance'
    | 'ethicalConsiderations'
    | 'sustainabilityPlanning'
    | 'innovationStrategy'
    | 'knowledgeTransfer'
    | 'projectClosure';

export interface IntelligentReportConfig {
    operationType: 'single-section' | 'complete-report';
    sectionToGenerate?: SectionName;
    sectionsToGenerate?: SectionName[];
    proposal?: any;
    projectPlan?: any;
    guidelines?: string[];
    contextFiles?: Array<{
        fileName: string;
        content: string;
        type: string;
    }>;
    qualityThreshold?: number;
    enableIterativeImprovement?: boolean;
    enablePerformanceMonitoring?: boolean;
    generateInOrder?: boolean;
    useIntelligentDependencies?: boolean;
    maxRetries?: number;
    otherSections?: Record<string, string>;
    instructionText?: string;
    exampleFiles?: Array<{
        fileName: string;
        content: string;
    }>;
}

export interface SingleSectionResult {
    sectionName: string;
    content: string;
    singleSection: true;
    metadata: {
        operationType: 'single-section';
        executionTime: number;
        creditCost: number;
        timestamp: string;
    };
}

export interface CompleteReportResult {
    generatedSections: Record<string, string>;
    sectionMetadata: Record<string, {
        executionTime: number;
        creditCost: number;
        qualityScore?: number;
        iterations?: number;
    }>;
    reportMetadata: {
        operationType: 'complete-report';
        totalExecutionTime: number;
        totalCreditCost: number;
        sectionsGenerated: number;
        averageQualityScore?: number;
        totalIterations?: number;
        timestamp: string;
    };
}

export class IntelligentReportServiceV2 extends BaseService {
    constructor() {
        super('IntelligentReportServiceV2');
    }

    /**
     * توليد قسم تقرير ذكي مع مراقبة الأداء
     */
    async generateSection(config: IntelligentReportConfig, token: string): Promise<SingleSectionResult> {
        const operationId = this.startOperation('generateSection');

        try {
            const response = await fetch('/api/intelligent-report/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate report section');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, sectionType: config.sectionToGenerate });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.generateSection');
            throw error;
        }
    }

    /**
     * توليد تقرير كامل ذكي مع مراقبة شاملة
     */
    async generateCompleteReport(config: IntelligentReportConfig, token?: string): Promise<CompleteReportResult> {
        const operationId = this.startOperation('generateCompleteReport');

        try {
            const response = await fetch('/api/intelligent-report/generate-complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(config)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate complete report');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: Object.keys(result.generatedSections || {}).length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.generateCompleteReport');
            throw error;
        }
    }

    /**
     * تحسين قسم تقرير مع مراقبة الأداء
     */
    async improveSection(
        sectionName: string,
        currentContent: string,
        improvements: string[],
        token: string
    ): Promise<{
        improvedContent: string;
        changes: string[];
        qualityScore: number;
    }> {
        const operationId = this.startOperation('improveSection');

        try {
            const response = await fetch('/api/intelligent-report/improve-section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sectionName,
                    currentContent,
                    improvements
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to improve report section');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, improvementCount: improvements.length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.improveSection');
            throw error;
        }
    }

    /**
     * إعادة توليد قسم تقرير مع مراقبة شاملة
     */
    async regenerateSection(
        sectionName: string,
        config: IntelligentReportConfig,
        token?: string
    ): Promise<SingleSectionResult> {
        const operationId = this.startOperation('regenerateSection');

        try {
            const response = await fetch('/api/intelligent-report/regenerate-section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    sectionName,
                    config
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to regenerate report section');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.regenerateSection');
            throw error;
        }
    }

    /**
     * جلب قائمة الأقسام المدعومة مع مراقبة الأداء
     */
    async getSupportedSections(): Promise<Array<{
        name: SectionName;
        title: string;
        description: string;
        category: string;
        complexity: 'low' | 'medium' | 'high';
        dependencies?: SectionName[];
    }>> {
        const operationId = this.startOperation('getSupportedSections');

        try {
            const response = await fetch('/api/intelligent-report/sections', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch supported sections');
            }

            const sections = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: sections.length });
            return sections;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.getSupportedSections');
            throw error;
        }
    }

    /**
     * اقتراح هيكل تقرير بناءً على المتطلبات مع مراقبة شاملة
     */
    async suggestReportStructure(context: {
        reportType: string;
        targetAudience: string;
        industry?: string;
        complexity?: 'basic' | 'detailed' | 'comprehensive';
    }): Promise<{
        suggestedSections: SectionName[];
        rationale: string[];
        estimatedLength: number;
        estimatedTime: number;
    }> {
        const operationId = this.startOperation('suggestReportStructure');

        try {
            const response = await fetch('/api/intelligent-report/suggest-structure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(context)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to suggest report structure');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: result.suggestedSections?.length || 0 });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.suggestReportStructure');
            throw error;
        }
    }

    /**
     * تقييم جودة تقرير مع مراقبة الأداء
     */
    async evaluateReportQuality(sections: Record<string, string>): Promise<{
        overallScore: number;
        sectionScores: Record<string, number>;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        metadata: {
            totalWords: number;
            sectionsAnalyzed: number;
            analysisTime: number;
        };
    }> {
        const operationId = this.startOperation('evaluateReportQuality');

        try {
            const response = await fetch('/api/intelligent-report/evaluate-quality', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sections })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to evaluate report quality');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: Object.keys(sections).length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.evaluateReportQuality');
            throw error;
        }
    }

    /**
     * حفظ تقرير في المكتبة مع مراقبة شاملة
     */
    async saveReport(
        sections: Record<string, string>,
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
        const operationId = this.startOperation('saveReport');

        try {
            const response = await fetch('/api/intelligent-report/save', {
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
                throw new Error(error.message || 'Failed to save report');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, sectionCount: Object.keys(sections).length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.saveReport');
            throw error;
        }
    }

    /**
     * جلب التقارير المحفوظة مع مراقبة الأداء
     */
    async getSavedReports(token: string, category?: string): Promise<Array<{
        id: string;
        name: string;
        category: string;
        sectionsCount: number;
        totalWords: number;
        createdAt: string;
        updatedAt: string;
    }>> {
        const operationId = this.startOperation('getSavedReports');

        try {
            const queryParams = category ? `?category=${category}` : '';
            const response = await fetch(`/api/intelligent-report/saved${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch saved reports');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, reportCount: result.reports?.length || 0 });
            return result.reports || [];

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.getSavedReports');
            throw error;
        }
    }

    /**
     * حذف تقرير محفوظ مع مراقبة شاملة
     */
    async deleteSavedReport(reportId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteSavedReport');

        try {
            const response = await fetch(`/api/intelligent-report/saved/${reportId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete saved report');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.deleteSavedReport');
            throw error;
        }
    }

    /**
     * تصدير تقرير إلى تنسيق مختلف مع مراقبة الأداء
     */
    async exportReport(
        sections: Record<string, string>,
        format: 'pdf' | 'docx' | 'html' | 'markdown',
        options?: {
            includeMetadata?: boolean;
            customStyling?: Record<string, any>;
            template?: string;
        },
        token?: string
    ): Promise<{
        format: string;
        data: string;
        filename: string;
        size: number;
    }> {
        const operationId = this.startOperation('exportReport');

        try {
            const response = await fetch('/api/intelligent-report/export', {
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
                throw new Error(error.message || 'Failed to export report');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, format, sectionCount: Object.keys(sections).length });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.exportReport');
            throw error;
        }
    }

    /**
     * جلب إحصائيات توليد التقارير مع مراقبة شاملة
     */
    async getGenerationStats(token?: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
        totalGenerations: number;
        totalSections: number;
        averageQualityScore: number;
        averageGenerationTime: number;
        topSections: Array<{
            sectionName: string;
            generationCount: number;
        }>;
        usageByTime: Array<{
            date: string;
            count: number;
        }>;
    }> {
        const operationId = this.startOperation('getGenerationStats');

        try {
            const response = await fetch(`/api/intelligent-report/stats?range=${timeRange}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
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
            ErrorHandler.handle(error, 'IntelligentReportServiceV2.getGenerationStats');
            throw error;
        }
    }
}