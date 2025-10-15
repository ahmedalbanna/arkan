/**
 * خدمة تخطيط المشاريع - Services v2.0
 *
 * خدمة محسنة لتخطيط المشاريع مع مراقبة متقدمة
 */

import { BaseService } from '../../core/base-service';
import { ErrorHandler } from '../../core/error-handler';
import { PerformanceMonitor } from '../../core/performance-monitor';

export interface ProjectPlan {
    id: string;
    projectId: string;
    phases: Array<{
        id: string;
        name: string;
        description: string;
        duration: number; // أيام
        tasks: Array<{
            id: string;
            title: string;
            description: string;
            assignee?: string;
            duration: number;
            dependencies: string[];
            deliverables: string[];
        }>;
        milestones: Array<{
            id: string;
            title: string;
            description: string;
            dueDate: string;
            deliverables: string[];
        }>;
    }>;
    resources: Array<{
        id: string;
        type: 'human' | 'material' | 'financial' | 'equipment';
        name: string;
        quantity: number;
        cost?: number;
        assignedTo?: string[];
    }>;
    risks: Array<{
        id: string;
        title: string;
        description: string;
        probability: 'low' | 'medium' | 'high';
        impact: 'low' | 'medium' | 'high';
        mitigation: string[];
    }>;
    budget: {
        totalBudget: number;
        currency: string;
        breakdown: Record<string, number>;
    };
    timeline: {
        startDate: string;
        endDate: string;
        totalDuration: number;
        criticalPath: string[];
    };
    metadata: {
        generatedAt: string;
        version: string;
        quality: number;
    };
}

export interface GenerateProjectPlanInput {
    projectTitle: string;
    projectDescription: string;
    objectives: string[];
    scope: string;
    constraints?: string[];
    assumptions?: string[];
    stakeholders?: Array<{
        name: string;
        role: string;
        influence: 'low' | 'medium' | 'high';
    }>;
    requirements?: string[];
    deliverables?: string[];
    budget?: number;
    timeline?: number; // أيام
    teamSize?: number;
    complexity?: 'simple' | 'moderate' | 'complex';
}

export interface GeneratePlanVariables extends GenerateProjectPlanInput {
    token: string;
}

export class ProjectPlanServiceV2 extends BaseService {
    constructor() {
        super('ProjectPlanServiceV2');
    }

    /**
     * توليد خطة مشروع مع مراقبة الأداء
     */
    async generateProjectPlan(variables: GeneratePlanVariables): Promise<ProjectPlan> {
        const operationId = this.startOperation('generateProjectPlan');

        try {
            const { token, ...body } = variables;
            const response = await fetch('/api/generate/project-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate project plan');
            }

            const plan = await response.json();
            this.endOperation(operationId, { success: true });
            return plan;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.generateProjectPlan');
            throw error;
        }
    }

    /**
     * تلخيص مقترح لخطة مع مراقبة شاملة
     */
    async summarizeProposalForPlan(proposal: any, token: string): Promise<any> {
        const operationId = this.startOperation('summarizeProposalForPlan');

        try {
            const response = await fetch('/api/summarize-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    proposal: proposal,
                    reportMarkdown: '' // نرسل تقرير فارغ لأننا نحتاج المقترح فقط
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get suggestion from AI');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.summarizeProposalForPlan');
            throw error;
        }
    }

    /**
     * توليد خطة مشروع متقدمة مع مراقبة الأداء
     */
    async generateAdvancedProjectPlan(
        input: GenerateProjectPlanInput & {
            includeRiskAnalysis?: boolean;
            includeResourcePlanning?: boolean;
            includeQualityPlan?: boolean;
            includeCommunicationPlan?: boolean;
        },
        token: string
    ): Promise<ProjectPlan> {
        const operationId = this.startOperation('generateAdvancedProjectPlan');

        try {
            const response = await fetch('/api/generate/project-plan/advanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate advanced project plan');
            }

            const plan = await response.json();
            this.endOperation(operationId, { success: true });
            return plan;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.generateAdvancedProjectPlan');
            throw error;
        }
    }

    /**
     * تحسين خطة مشروع موجودة مع مراقبة شاملة
     */
    async optimizeProjectPlan(
        planId: string,
        optimizations: string[],
        token: string
    ): Promise<ProjectPlan> {
        const operationId = this.startOperation('optimizeProjectPlan');

        try {
            const response = await fetch(`/api/project-plans/${planId}/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ optimizations }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to optimize project plan');
            }

            const plan = await response.json();
            this.endOperation(operationId, { success: true, optimizationCount: optimizations.length });
            return plan;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.optimizeProjectPlan');
            throw error;
        }
    }

    /**
     * حفظ خطة مشروع مع مراقبة الأداء
     */
    async saveProjectPlan(plan: ProjectPlan, name?: string, token?: string): Promise<{
        id: string;
        name: string;
        savedAt: string;
    }> {
        const operationId = this.startOperation('saveProjectPlan');

        try {
            const response = await fetch('/api/project-plans/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    plan,
                    name: name || `خطة ${plan.phases[0]?.name || 'مشروع'}`
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save project plan');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.saveProjectPlan');
            throw error;
        }
    }

    /**
     * جلب خطط المشاريع المحفوظة مع مراقبة شاملة
     */
    async getSavedProjectPlans(token: string): Promise<Array<{
        id: string;
        name: string;
        phaseCount: number;
        savedAt: string;
        totalDuration: number;
    }>> {
        const operationId = this.startOperation('getSavedProjectPlans');

        try {
            const response = await fetch('/api/project-plans/saved', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch saved project plans');
            }

            const plans = await response.json();
            this.endOperation(operationId, { success: true, planCount: plans.length });
            return plans;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.getSavedProjectPlans');
            throw error;
        }
    }

    /**
     * حذف خطة مشروع محفوظة مع مراقبة الأداء
     */
    async deleteSavedProjectPlan(planId: string, token: string): Promise<void> {
        const operationId = this.startOperation('deleteSavedProjectPlan');

        try {
            const response = await fetch(`/api/project-plans/saved/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete saved project plan');
            }

            this.endOperation(operationId, { success: true });

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.deleteSavedProjectPlan');
            throw error;
        }
    }

    /**
     * تصدير خطة مشروع مع مراقبة شاملة
     */
    async exportProjectPlan(
        plan: ProjectPlan,
        format: 'pdf' | 'docx' | 'excel' | 'json',
        options?: {
            includeCharts?: boolean;
            includeGantt?: boolean;
            language?: 'ar' | 'en';
        },
        token?: string
    ): Promise<{
        format: string;
        data: string;
        filename: string;
        size: number;
    }> {
        const operationId = this.startOperation('exportProjectPlan');

        try {
            const response = await fetch('/api/project-plans/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ plan, format, options })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to export project plan');
            }

            const result = await response.json();
            this.endOperation(operationId, { success: true, format });
            return result;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.exportProjectPlan');
            throw error;
        }
    }

    /**
     * تحليل خطة مشروع مع مراقبة الأداء
     */
    async analyzeProjectPlan(plan: ProjectPlan): Promise<{
        feasibility: number;
        riskLevel: 'low' | 'medium' | 'high';
        resourceUtilization: number;
        timelineRealism: number;
        recommendations: string[];
        issues: string[];
    }> {
        const operationId = this.startOperation('analyzeProjectPlan');

        try {
            const response = await fetch('/api/project-plans/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze project plan');
            }

            const analysis = await response.json();
            this.endOperation(operationId, { success: true });
            return analysis;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.analyzeProjectPlan');
            throw error;
        }
    }

    /**
     * مقارنة خطط مشاريع متعددة مع مراقبة شاملة
     */
    async compareProjectPlans(plans: ProjectPlan[]): Promise<{
        comparison: Array<{
            planId: string;
            duration: number;
            budget: number;
            riskLevel: string;
            resourceCount: number;
        }>;
        recommendations: string[];
        bestPlan: string;
    }> {
        const operationId = this.startOperation('compareProjectPlans');

        try {
            const response = await fetch('/api/project-plans/compare', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plans })
            });

            if (!response.ok) {
                throw new Error('Failed to compare project plans');
            }

            const comparison = await response.json();
            this.endOperation(operationId, { success: true, planCount: plans.length });
            return comparison;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.compareProjectPlans');
            throw error;
        }
    }

    /**
     * جلب إحصائيات تخطيط المشاريع مع مراقبة الأداء
     */
    async getProjectPlanningStats(token?: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
        totalPlans: number;
        averageDuration: number;
        averageBudget: number;
        riskDistribution: Record<string, number>;
        phaseDistribution: Record<string, number>;
        resourceUtilization: number;
    }> {
        const operationId = this.startOperation('getProjectPlanningStats');

        try {
            const response = await fetch(`/api/project-plans/stats?range=${timeRange}`, {
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch project planning stats');
            }

            const stats = await response.json();
            this.endOperation(operationId, { success: true });
            return stats;

        } catch (error) {
            this.endOperation(operationId, { success: false, error: error.message });
            ErrorHandler.handle(error, 'ProjectPlanServiceV2.getProjectPlanningStats');
            throw error;
        }
    }
}