/**
 * نظام التحقق من جودة المقترحات المتخصص
 * يتحقق من جودة المقترحات بناءً على معايير خاصة
 */

import { OutputQualityValidator, QualityMetrics, QualityIssue, ValidationResult } from './output-quality-validator';
import { ProposalContextAnalysis } from './proposal-context-analyzer';

export interface ProposalQualityMetrics extends QualityMetrics {
    // مقاييس خاصة بالمقترحات
    businessValue: number; // 0-100
    marketAnalysis: number; // 0-100
    financialFeasibility: number; // 0-100
    technicalFeasibility: number; // 0-100
    riskAssessment: number; // 0-100
    competitiveAdvantage: number; // 0-100
    stakeholderAlignment: number; // 0-100
    implementationPlan: number; // 0-100
    compliance: number; // 0-100
    innovation: number; // 0-100
}

export interface ProposalQualityIssue extends QualityIssue {
    proposalSpecific: boolean;
    sectionAffected?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProposalValidationResult extends ValidationResult {
    proposalMetrics: ProposalQualityMetrics;
    proposalIssues: ProposalQualityIssue[];
    businessReadiness: number; // 0-100
    technicalReadiness: number; // 0-100
    marketReadiness: number; // 0-100;
    overallProposalScore: number; // 0-100
}

export class ProposalQualityValidator {
    /**
     * التحقق من جودة المقترح المتخصص
     */
    static async validateProposal(
        proposal: any,
        originalInput: string,
        contextAnalysis: ProposalContextAnalysis
    ): Promise<ProposalValidationResult> {

        // التحقق الأساسي
        const baseValidation = await OutputQualityValidator.validateOutput(
            JSON.stringify(proposal),
            originalInput,
            contextAnalysis
        );

        // التحقق المتخصص للمقترحات
        const proposalMetrics = await this.calculateProposalMetrics(proposal, contextAnalysis);
        const proposalIssues = await this.identifyProposalIssues(proposal, contextAnalysis);

        // حساب الجاهزية
        const businessReadiness = this.calculateBusinessReadiness(proposal, proposalMetrics);
        const technicalReadiness = this.calculateTechnicalReadiness(proposal, proposalMetrics);
        const marketReadiness = this.calculateMarketReadiness(proposal, proposalMetrics);

        // حساب النقاط الإجمالية للمقترح
        const overallProposalScore = this.calculateOverallProposalScore(proposalMetrics);

        return {
            ...baseValidation,
            proposalMetrics,
            proposalIssues,
            businessReadiness,
            technicalReadiness,
            marketReadiness,
            overallProposalScore
        };
    }

    /**
     * حساب المقاييس المتخصصة للمقترحات
     */
    private static async calculateProposalMetrics(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis
    ): Promise<ProposalQualityMetrics> {

        const baseMetrics = await this.calculateBaseMetrics(proposal, contextAnalysis);

        return {
            ...baseMetrics,
            businessValue: this.assessBusinessValue(proposal, contextAnalysis),
            marketAnalysis: this.assessMarketAnalysis(proposal, contextAnalysis),
            financialFeasibility: this.assessFinancialFeasibility(proposal, contextAnalysis),
            technicalFeasibility: this.assessTechnicalFeasibility(proposal, contextAnalysis),
            riskAssessment: this.assessRiskAssessment(proposal, contextAnalysis),
            competitiveAdvantage: this.assessCompetitiveAdvantage(proposal, contextAnalysis),
            stakeholderAlignment: this.assessStakeholderAlignment(proposal, contextAnalysis),
            implementationPlan: this.assessImplementationPlan(proposal, contextAnalysis),
            compliance: this.assessCompliance(proposal, contextAnalysis),
            innovation: this.assessInnovation(proposal, contextAnalysis)
        };
    }

    /**
     * حساب المقاييس الأساسية
     */
    private static async calculateBaseMetrics(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis
    ): Promise<QualityMetrics> {
        const proposalText = JSON.stringify(proposal);

        return {
            completeness: this.assessProposalCompleteness(proposal, contextAnalysis),
            accuracy: this.assessProposalAccuracy(proposal, contextAnalysis),
            relevance: this.assessProposalRelevance(proposal, contextAnalysis),
            clarity: this.assessProposalClarity(proposal, contextAnalysis),
            structure: this.assessProposalStructure(proposal, contextAnalysis),
            overall: 0 // سيتم حسابه لاحقاً
        };
    }

    /**
     * تقييم القيمة التجارية
     */
    private static assessBusinessValue(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود القيمة المقترحة
        if (proposal.valueProposition || proposal.businessValue) {
            score += 20;
        }

        // فحص وجود تحليل السوق
        if (proposal.marketAnalysis || proposal.targetMarket) {
            score += 15;
        }

        // فحص وجود خطة مالية
        if (proposal.budget || proposal.financialPlan || proposal.revenueProjection) {
            score += 15;
        }

        // فحص وجود تحليل المنافسة
        if (proposal.competitiveAnalysis || proposal.competitors) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم تحليل السوق
     */
    private static assessMarketAnalysis(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود تحليل السوق
        if (proposal.marketAnalysis) {
            score += 20;
        }

        // فحص وجود حجم السوق
        if (proposal.marketSize || proposal.targetMarketSize) {
            score += 15;
        }

        // فحص وجود تحليل العملاء
        if (proposal.customerAnalysis || proposal.targetCustomers) {
            score += 15;
        }

        // فحص وجود تحليل الاتجاهات
        if (proposal.marketTrends || proposal.industryTrends) {
            score += 10;
        }

        // فحص وجود تحليل المنافسة
        if (proposal.competitiveAnalysis) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم الجدوى المالية
     */
    private static assessFinancialFeasibility(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود الميزانية
        if (proposal.budget || proposal.financialPlan) {
            score += 20;
        }

        // فحص وجود توقعات الإيرادات
        if (proposal.revenueProjection || proposal.expectedRevenue) {
            score += 20;
        }

        // فحص وجود تحليل التكلفة
        if (proposal.costAnalysis || proposal.breakEvenAnalysis) {
            score += 15;
        }

        // فحص وجود تحليل المخاطر المالية
        if (proposal.financialRisks || proposal.riskMitigation) {
            score += 15;
        }

        // فحص وجود خطة التمويل
        if (proposal.fundingPlan || proposal.investmentPlan) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم الجدوى التقنية
     */
    private static assessTechnicalFeasibility(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود المتطلبات التقنية
        if (proposal.technicalRequirements || proposal.requirements) {
            score += 20;
        }

        // فحص وجود خطة التطوير
        if (proposal.developmentPlan || proposal.technicalPlan) {
            score += 20;
        }

        // فحص وجود التكنولوجيا المستخدمة
        if (proposal.technologyStack || proposal.technologies) {
            score += 15;
        }

        // فحص وجود خطة الاختبار
        if (proposal.testingPlan || proposal.qualityAssurance) {
            score += 15;
        }

        // فحص وجود خطة النشر
        if (proposal.deploymentPlan || proposal.implementationPlan) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم تقييم المخاطر
     */
    private static assessRiskAssessment(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود تحليل المخاطر
        if (proposal.riskAnalysis || proposal.risks) {
            score += 25;
        }

        // فحص وجود خطة إدارة المخاطر
        if (proposal.riskManagement || proposal.riskMitigation) {
            score += 25;
        }

        // فحص وجود خطة الطوارئ
        if (proposal.contingencyPlan || proposal.backupPlan) {
            score += 15;
        }

        // فحص وجود تحليل التأثير
        if (proposal.impactAnalysis || proposal.riskImpact) {
            score += 15;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم الميزة التنافسية
     */
    private static assessCompetitiveAdvantage(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود تحليل المنافسة
        if (proposal.competitiveAnalysis || proposal.competitors) {
            score += 20;
        }

        // فحص وجود الميزة التنافسية
        if (proposal.competitiveAdvantage || proposal.uniqueValue) {
            score += 25;
        }

        // فحص وجود التحليل المقارن
        if (proposal.comparativeAnalysis || proposal.benchmarking) {
            score += 15;
        }

        // فحص وجود استراتيجية التمييز
        if (proposal.differentiationStrategy || proposal.positioning) {
            score += 15;
        }

        // فحص وجود خطة الحماية
        if (proposal.protectionPlan || proposal.intellectualProperty) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم محاذاة أصحاب المصلحة
     */
    private static assessStakeholderAlignment(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود تحليل أصحاب المصلحة
        if (proposal.stakeholderAnalysis || proposal.stakeholders) {
            score += 20;
        }

        // فحص وجود خطة التواصل
        if (proposal.communicationPlan || proposal.stakeholderCommunication) {
            score += 20;
        }

        // فحص وجود خطة إدارة التغيير
        if (proposal.changeManagement || proposal.changePlan) {
            score += 15;
        }

        // فحص وجود خطة التدريب
        if (proposal.trainingPlan || proposal.stakeholderTraining) {
            score += 15;
        }

        // فحص وجود خطة المشاركة
        if (proposal.engagementPlan || proposal.stakeholderEngagement) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم خطة التنفيذ
     */
    private static assessImplementationPlan(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود خطة التنفيذ
        if (proposal.implementationPlan || proposal.executionPlan) {
            score += 25;
        }

        // فحص وجود الجدول الزمني
        if (proposal.timeline || proposal.schedule || proposal.milestones) {
            score += 20;
        }

        // فحص وجود خطة الموارد
        if (proposal.resourcePlan || proposal.resources) {
            score += 15;
        }

        // فحص وجود خطة الجودة
        if (proposal.qualityPlan || proposal.qualityAssurance) {
            score += 15;
        }

        // فحص وجود خطة المراقبة
        if (proposal.monitoringPlan || proposal.trackingPlan) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم الامتثال
     */
    private static assessCompliance(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود متطلبات الامتثال
        if (proposal.complianceRequirements || proposal.regulatoryRequirements) {
            score += 25;
        }

        // فحص وجود خطة الامتثال
        if (proposal.compliancePlan || proposal.regulatoryPlan) {
            score += 25;
        }

        // فحص وجود تحليل المخاطر التنظيمية
        if (proposal.regulatoryRisks || proposal.complianceRisks) {
            score += 15;
        }

        // فحص وجود خطة التدقيق
        if (proposal.auditPlan || proposal.complianceAudit) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم الابتكار
     */
    private static assessInnovation(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود الابتكار
        if (proposal.innovation || proposal.innovativeApproach) {
            score += 25;
        }

        // فحص وجود التكنولوجيا الجديدة
        if (proposal.newTechnology || proposal.emergingTechnology) {
            score += 20;
        }

        // فحص وجود المنهجية الجديدة
        if (proposal.newMethodology || proposal.innovativeMethod) {
            score += 20;
        }

        // فحص وجود الحلول الإبداعية
        if (proposal.creativeSolutions || proposal.innovativeSolutions) {
            score += 15;
        }

        // فحص وجود خطة الابتكار
        if (proposal.innovationPlan || proposal.innovationStrategy) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم اكتمال المقترح
     */
    private static assessProposalCompleteness(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 50;

        // فحص وجود الأقسام الأساسية
        const requiredSections = [
            'executiveSummary', 'problemStatement', 'solution', 'marketAnalysis',
            'businessModel', 'financialPlan', 'implementationPlan', 'riskAnalysis'
        ];

        const presentSections = requiredSections.filter(section =>
            proposal[section] || proposal[section.toLowerCase()]
        );

        score += (presentSections.length / requiredSections.length) * 30;

        // فحص وجود المعلومات الأساسية
        if (proposal.title || proposal.projectName) score += 5;
        if (proposal.description || proposal.projectDescription) score += 5;
        if (proposal.objectives || proposal.goals) score += 5;
        if (proposal.budget || proposal.financialPlan) score += 5;

        return Math.min(score, 100);
    }

    /**
     * تقييم دقة المقترح
     */
    private static assessProposalAccuracy(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 80;

        // فحص التناقضات الداخلية
        if (this.hasInternalContradictions(proposal)) {
            score -= 20;
        }

        // فحص دقة المعلومات المالية
        if (proposal.budget && typeof proposal.budget === 'number' && proposal.budget < 0) {
            score -= 15;
        }

        // فحص دقة الجدول الزمني
        if (proposal.timeline && this.hasInvalidTimeline(proposal.timeline)) {
            score -= 10;
        }

        return Math.min(Math.max(score, 0), 100);
    }

    /**
     * تقييم صلة المقترح
     */
    private static assessProposalRelevance(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 70;

        // فحص صلة المقترح بالصناعة
        if (proposal.industry && proposal.industry === contextAnalysis.industry) {
            score += 15;
        }

        // فحص صلة المقترح بالجمهور المستهدف
        if (proposal.targetAudience && contextAnalysis.stakeholderTypes.includes(proposal.targetAudience)) {
            score += 15;
        }

        // فحص صلة المقترح بنوع المشروع
        if (proposal.projectType && proposal.projectType === contextAnalysis.proposalType) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم وضوح المقترح
     */
    private static assessProposalClarity(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 75;

        // فحص وضوح العنوان
        if (proposal.title && proposal.title.length > 10 && proposal.title.length < 100) {
            score += 10;
        }

        // فحص وضوح الوصف
        if (proposal.description && proposal.description.length > 100) {
            score += 10;
        }

        // فحص وضوح الأهداف
        if (proposal.objectives && Array.isArray(proposal.objectives) && proposal.objectives.length > 0) {
            score += 10;
        }

        // فحص وضوح الخطة
        if (proposal.implementationPlan && proposal.implementationPlan.length > 50) {
            score += 5;
        }

        return Math.min(score, 100);
    }

    /**
     * تقييم هيكل المقترح
     */
    private static assessProposalStructure(proposal: any, contextAnalysis: ProposalContextAnalysis): number {
        let score = 60;

        // فحص وجود الأقسام الأساسية
        const sections = Object.keys(proposal);
        if (sections.length >= 5) {
            score += 20;
        }

        // فحص وجود التنسيق المناسب
        if (proposal.executiveSummary && proposal.conclusion) {
            score += 10;
        }

        // فحص وجود القوائم
        if (proposal.objectives && Array.isArray(proposal.objectives)) {
            score += 10;
        }

        // فحص وجود الجداول
        if (proposal.budget && typeof proposal.budget === 'object') {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * تحديد مشاكل المقترح المتخصصة
     */
    private static async identifyProposalIssues(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis
    ): Promise<ProposalQualityIssue[]> {
        const issues: ProposalQualityIssue[] = [];

        // فحص المشاكل الأساسية
        issues.push(...this.findBasicProposalIssues(proposal));

        // فحص المشاكل المتخصصة
        issues.push(...this.findSpecializedProposalIssues(proposal, contextAnalysis));

        // فحص المشاكل حسب نوع المقترح
        issues.push(...this.findProposalTypeIssues(proposal, contextAnalysis));

        return issues;
    }

    /**
     * العثور على المشاكل الأساسية
     */
    private static findBasicProposalIssues(proposal: any): ProposalQualityIssue[] {
        const issues: ProposalQualityIssue[] = [];

        // فحص وجود العنوان
        if (!proposal.title && !proposal.projectName) {
            issues.push({
                type: 'missing_content',
                severity: 'high',
                description: 'المقترح يفتقر للعنوان',
                suggestion: 'أضف عنوان واضح ومختصر للمقترح',
                proposalSpecific: true,
                sectionAffected: 'title',
                impact: 'high'
            });
        }

        // فحص وجود الوصف
        if (!proposal.description && !proposal.projectDescription) {
            issues.push({
                type: 'missing_content',
                severity: 'high',
                description: 'المقترح يفتقر للوصف',
                suggestion: 'أضف وصف شامل للمشروع',
                proposalSpecific: true,
                sectionAffected: 'description',
                impact: 'high'
            });
        }

        // فحص وجود الأهداف
        if (!proposal.objectives && !proposal.goals) {
            issues.push({
                type: 'missing_content',
                severity: 'high',
                description: 'المقترح يفتقر للأهداف',
                suggestion: 'أضف أهداف واضحة وقابلة للقياس',
                proposalSpecific: true,
                sectionAffected: 'objectives',
                impact: 'high'
            });
        }

        // فحص وجود الميزانية
        if (!proposal.budget && !proposal.financialPlan) {
            issues.push({
                type: 'missing_content',
                severity: 'high',
                description: 'المقترح يفتقر للميزانية',
                suggestion: 'أضف ميزانية مفصلة للمشروع',
                proposalSpecific: true,
                sectionAffected: 'budget',
                impact: 'high'
            });
        }

        return issues;
    }

    /**
     * العثور على المشاكل المتخصصة
     */
    private static findSpecializedProposalIssues(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis
    ): ProposalQualityIssue[] {
        const issues: ProposalQualityIssue[] = [];

        // فحص تحليل السوق
        if (!proposal.marketAnalysis && !proposal.targetMarket) {
            issues.push({
                type: 'missing_content',
                severity: 'medium',
                description: 'المقترح يفتقر لتحليل السوق',
                suggestion: 'أضف تحليل شامل للسوق المستهدف',
                proposalSpecific: true,
                sectionAffected: 'marketAnalysis',
                impact: 'medium'
            });
        }

        // فحص تحليل المنافسة
        if (!proposal.competitiveAnalysis && !proposal.competitors) {
            issues.push({
                type: 'missing_content',
                severity: 'medium',
                description: 'المقترح يفتقر لتحليل المنافسة',
                suggestion: 'أضف تحليل للمنافسين والمنافسة',
                proposalSpecific: true,
                sectionAffected: 'competitiveAnalysis',
                impact: 'medium'
            });
        }

        // فحص خطة التنفيذ
        if (!proposal.implementationPlan && !proposal.executionPlan) {
            issues.push({
                type: 'missing_content',
                severity: 'high',
                description: 'المقترح يفتقر لخطة التنفيذ',
                suggestion: 'أضف خطة تنفيذ مفصلة للمشروع',
                proposalSpecific: true,
                sectionAffected: 'implementationPlan',
                impact: 'high'
            });
        }

        // فحص تحليل المخاطر
        if (!proposal.riskAnalysis && !proposal.risks) {
            issues.push({
                type: 'missing_content',
                severity: 'medium',
                description: 'المقترح يفتقر لتحليل المخاطر',
                suggestion: 'أضف تحليل شامل للمخاطر المحتملة',
                proposalSpecific: true,
                sectionAffected: 'riskAnalysis',
                impact: 'medium'
            });
        }

        return issues;
    }

    /**
     * العثور على المشاكل حسب نوع المقترح
     */
    private static findProposalTypeIssues(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis
    ): ProposalQualityIssue[] {
        const issues: ProposalQualityIssue[] = [];

        switch (contextAnalysis.proposalType) {
            case 'business':
                if (!proposal.businessModel) {
                    issues.push({
                        type: 'missing_content',
                        severity: 'high',
                        description: 'المقترح التجاري يفتقر لنموذج العمل',
                        suggestion: 'أضف نموذج عمل واضح للمشروع',
                        proposalSpecific: true,
                        sectionAffected: 'businessModel',
                        impact: 'high'
                    });
                }
                break;

            case 'technical':
                if (!proposal.technicalRequirements) {
                    issues.push({
                        type: 'missing_content',
                        severity: 'high',
                        description: 'المقترح التقني يفتقر للمتطلبات التقنية',
                        suggestion: 'أضف متطلبات تقنية مفصلة',
                        proposalSpecific: true,
                        sectionAffected: 'technicalRequirements',
                        impact: 'high'
                    });
                }
                break;

            case 'funding':
                if (!proposal.fundingRequest) {
                    issues.push({
                        type: 'missing_content',
                        severity: 'high',
                        description: 'مقترح التمويل يفتقر لمبلغ التمويل المطلوب',
                        suggestion: 'أضف مبلغ التمويل المطلوب بوضوح',
                        proposalSpecific: true,
                        sectionAffected: 'fundingRequest',
                        impact: 'high'
                    });
                }
                break;
        }

        return issues;
    }

    /**
     * حساب جاهزية الأعمال
     */
    private static calculateBusinessReadiness(proposal: any, metrics: ProposalQualityMetrics): number {
        const weights = {
            businessValue: 0.3,
            marketAnalysis: 0.25,
            financialFeasibility: 0.25,
            competitiveAdvantage: 0.2
        };

        return Math.round(
            metrics.businessValue * weights.businessValue +
            metrics.marketAnalysis * weights.marketAnalysis +
            metrics.financialFeasibility * weights.financialFeasibility +
            metrics.competitiveAdvantage * weights.competitiveAdvantage
        );
    }

    /**
     * حساب جاهزية التقنية
     */
    private static calculateTechnicalReadiness(proposal: any, metrics: ProposalQualityMetrics): number {
        const weights = {
            technicalFeasibility: 0.4,
            implementationPlan: 0.3,
            innovation: 0.2,
            compliance: 0.1
        };

        return Math.round(
            metrics.technicalFeasibility * weights.technicalFeasibility +
            metrics.implementationPlan * weights.implementationPlan +
            metrics.innovation * weights.innovation +
            metrics.compliance * weights.compliance
        );
    }

    /**
     * حساب جاهزية السوق
     */
    private static calculateMarketReadiness(proposal: any, metrics: ProposalQualityMetrics): number {
        const weights = {
            marketAnalysis: 0.4,
            competitiveAdvantage: 0.3,
            stakeholderAlignment: 0.2,
            businessValue: 0.1
        };

        return Math.round(
            metrics.marketAnalysis * weights.marketAnalysis +
            metrics.competitiveAdvantage * weights.competitiveAdvantage +
            metrics.stakeholderAlignment * weights.stakeholderAlignment +
            metrics.businessValue * weights.businessValue
        );
    }

    /**
     * حساب النقاط الإجمالية للمقترح
     */
    private static calculateOverallProposalScore(metrics: ProposalQualityMetrics): number {
        const weights = {
            businessValue: 0.15,
            marketAnalysis: 0.15,
            financialFeasibility: 0.15,
            technicalFeasibility: 0.15,
            riskAssessment: 0.1,
            competitiveAdvantage: 0.1,
            stakeholderAlignment: 0.1,
            implementationPlan: 0.1
        };

        return Math.round(
            metrics.businessValue * weights.businessValue +
            metrics.marketAnalysis * weights.marketAnalysis +
            metrics.financialFeasibility * weights.financialFeasibility +
            metrics.technicalFeasibility * weights.technicalFeasibility +
            metrics.riskAssessment * weights.riskAssessment +
            metrics.competitiveAdvantage * weights.competitiveAdvantage +
            metrics.stakeholderAlignment * weights.stakeholderAlignment +
            metrics.implementationPlan * weights.implementationPlan
        );
    }

    // Helper methods
    private static hasInternalContradictions(proposal: any): boolean {
        // فحص التناقضات الداخلية
        if (proposal.budget && proposal.expectedCost && proposal.budget < proposal.expectedCost) {
            return true;
        }

        if (proposal.timeline && proposal.expectedDuration && proposal.timeline < proposal.expectedDuration) {
            return true;
        }

        return false;
    }

    private static hasInvalidTimeline(timeline: any): boolean {
        if (typeof timeline === 'string') {
            return timeline.length < 5;
        }
        if (typeof timeline === 'number') {
            return timeline < 0;
        }
        return false;
    }
}
