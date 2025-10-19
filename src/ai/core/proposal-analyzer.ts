/**
 * محلل المقترحات المتقدم
 * يحلل المقترحات ويقدم رؤى وتوصيات متخصصة
 */

import { ProposalContextAnalysis } from './proposal-context-analyzer';
import { ProposalQualityMetrics } from './proposal-quality-validator';

export interface ProposalAnalysis {
    // التحليل الأساسي
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];

    // التحليل المتخصص
    businessReadiness: {
        score: number;
        level: 'low' | 'medium' | 'high' | 'excellent';
        recommendations: string[];
    };

    technicalReadiness: {
        score: number;
        level: 'low' | 'medium' | 'high' | 'excellent';
        recommendations: string[];
    };

    marketReadiness: {
        score: number;
        level: 'low' | 'medium' | 'high' | 'excellent';
        recommendations: string[];
    };

    // التحليل المالي
    financialAnalysis: {
        budgetAdequacy: 'insufficient' | 'adequate' | 'generous' | 'excessive';
        costBenefitRatio: number;
        paybackPeriod: string;
        recommendations: string[];
    };

    // التحليل التنافسي
    competitiveAnalysis: {
        marketPosition: 'weak' | 'moderate' | 'strong' | 'dominant';
        competitiveAdvantage: string[];
        threats: string[];
        recommendations: string[];
    };

    // التحليل المخاطر
    riskAnalysis: {
        overallRisk: 'low' | 'medium' | 'high' | 'critical';
        keyRisks: Array<{
            risk: string;
            probability: 'low' | 'medium' | 'high';
            impact: 'low' | 'medium' | 'high';
            mitigation: string;
        }>;
        recommendations: string[];
    };

    // التحليل التنفيذي
    implementationAnalysis: {
        feasibility: 'low' | 'medium' | 'high' | 'excellent';
        timeline: 'realistic' | 'optimistic' | 'pessimistic' | 'unrealistic';
        resourceRequirements: 'low' | 'medium' | 'high' | 'excessive';
        recommendations: string[];
    };

    // التوصيات العامة
    overallRecommendations: {
        priority: 'low' | 'medium' | 'high' | 'critical';
        actions: string[];
        timeline: string;
        resources: string[];
    };

    // النتيجة النهائية
    overallScore: number;
    overallLevel: 'poor' | 'fair' | 'good' | 'excellent';
    decision: 'reject' | 'revise' | 'approve' | 'excellent';
}

export class ProposalAnalyzer {
    /**
     * تحليل شامل للمقترح
     */
    static async analyzeProposal(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis,
        qualityMetrics: ProposalQualityMetrics
    ): Promise<ProposalAnalysis> {

        // التحليل الأساسي
        const swotAnalysis = this.performSWOTAnalysis(proposal, contextAnalysis);

        // التحليل المتخصص
        const businessReadiness = this.analyzeBusinessReadiness(proposal, qualityMetrics);
        const technicalReadiness = this.analyzeTechnicalReadiness(proposal, qualityMetrics);
        const marketReadiness = this.analyzeMarketReadiness(proposal, qualityMetrics);

        // التحليل المالي
        const financialAnalysis = this.analyzeFinancialAspects(proposal, contextAnalysis);

        // التحليل التنافسي
        const competitiveAnalysis = this.analyzeCompetitivePosition(proposal, contextAnalysis);

        // التحليل المخاطر
        const riskAnalysis = this.analyzeRisks(proposal, contextAnalysis);

        // التحليل التنفيذي
        const implementationAnalysis = this.analyzeImplementation(proposal, contextAnalysis);

        // التوصيات العامة
        const overallRecommendations = this.generateOverallRecommendations(
            proposal, contextAnalysis, qualityMetrics
        );

        // النتيجة النهائية
        const overallScore = this.calculateOverallScore(qualityMetrics);
        const overallLevel = this.determineOverallLevel(overallScore);
        const decision = this.makeDecision(overallScore, riskAnalysis.overallRisk);

        return {
            ...swotAnalysis,
            businessReadiness,
            technicalReadiness,
            marketReadiness,
            financialAnalysis,
            competitiveAnalysis,
            riskAnalysis,
            implementationAnalysis,
            overallRecommendations,
            overallScore,
            overallLevel,
            decision
        };
    }

    /**
     * تحليل SWOT
     */
    private static performSWOTAnalysis(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis
    ): Pick<ProposalAnalysis, 'strengths' | 'weaknesses' | 'opportunities' | 'threats'> {

        const strengths: string[] = [];
        const weaknesses: string[] = [];
        const opportunities: string[] = [];
        const threats: string[] = [];

        // تحليل نقاط القوة
        if (proposal.uniqueValue || proposal.competitiveAdvantage) {
            strengths.push('ميزة تنافسية واضحة');
        }
        if (proposal.team && proposal.team.length > 0) {
            strengths.push('فريق عمل مؤهل');
        }
        if (proposal.technologyStack && proposal.technologyStack.length > 0) {
            strengths.push('تقنيات متقدمة');
        }
        if (proposal.marketAnalysis) {
            strengths.push('تحليل سوق شامل');
        }

        // تحليل نقاط الضعف
        if (!proposal.riskAnalysis) {
            weaknesses.push('عدم وجود تحليل للمخاطر');
        }
        if (!proposal.implementationPlan) {
            weaknesses.push('عدم وجود خطة تنفيذ واضحة');
        }
        if (!proposal.financialPlan) {
            weaknesses.push('عدم وجود خطة مالية مفصلة');
        }
        if (!proposal.qualityAssurance) {
            weaknesses.push('عدم وجود خطة ضمان الجودة');
        }

        // تحليل الفرص
        if (contextAnalysis.marketMaturity === 'emerging') {
            opportunities.push('سوق ناشئ مع فرص كبيرة');
        }
        if (contextAnalysis.innovationLevel === 'disruptive') {
            opportunities.push('ابتكار ثوري يمكن أن يغير السوق');
        }
        if (contextAnalysis.targetGeographic.includes('الشرق الأوسط')) {
            opportunities.push('سوق الشرق الأوسط المتنامي');
        }
        if (proposal.partnerships && proposal.partnerships.length > 0) {
            opportunities.push('شراكات استراتيجية محتملة');
        }

        // تحليل التهديدات
        if (contextAnalysis.competitiveLandscape === 'high') {
            threats.push('منافسة شديدة في السوق');
        }
        if (contextAnalysis.riskLevel === 'high') {
            threats.push('مخاطر عالية في التنفيذ');
        }
        if (contextAnalysis.complianceRequirements.length > 0) {
            threats.push('متطلبات تنظيمية معقدة');
        }
        if (contextAnalysis.marketMaturity === 'declining') {
            threats.push('سوق في تراجع');
        }

        return { strengths, weaknesses, opportunities, threats };
    }

    /**
     * تحليل جاهزية الأعمال
     */
    private static analyzeBusinessReadiness(
        proposal: any,
        qualityMetrics: ProposalQualityMetrics
    ): ProposalAnalysis['businessReadiness'] {

        const score = qualityMetrics.businessValue;
        const level = this.determineLevel(score);

        const recommendations: string[] = [];

        if (score < 70) {
            recommendations.push('تحسين تحليل القيمة التجارية');
            recommendations.push('إضافة تحليل أكثر تفصيلاً للسوق');
            recommendations.push('تحسين خطة الأعمال');
        }

        if (qualityMetrics.marketAnalysis < 70) {
            recommendations.push('إجراء تحليل سوق أكثر شمولية');
            recommendations.push('إضافة بيانات السوق والمنافسين');
        }

        if (qualityMetrics.financialFeasibility < 70) {
            recommendations.push('تحسين الخطة المالية');
            recommendations.push('إضافة تحليل التكلفة والفائدة');
        }

        return { score, level, recommendations };
    }

    /**
     * تحليل جاهزية التقنية
     */
    private static analyzeTechnicalReadiness(
        proposal: any,
        qualityMetrics: ProposalQualityMetrics
    ): ProposalAnalysis['technicalReadiness'] {

        const score = qualityMetrics.technicalFeasibility;
        const level = this.determineLevel(score);

        const recommendations: string[] = [];

        if (score < 70) {
            recommendations.push('تحسين المتطلبات التقنية');
            recommendations.push('إضافة خطة تطوير أكثر تفصيلاً');
            recommendations.push('تحديد التقنيات المطلوبة بوضوح');
        }

        if (qualityMetrics.implementationPlan < 70) {
            recommendations.push('تحسين خطة التنفيذ');
            recommendations.push('إضافة جدول زمني مفصل');
        }

        if (qualityMetrics.innovation < 70) {
            recommendations.push('إضافة عناصر ابتكارية');
            recommendations.push('تحديد الميزات المميزة');
        }

        return { score, level, recommendations };
    }

    /**
     * تحليل جاهزية السوق
     */
    private static analyzeMarketReadiness(
        proposal: any,
        qualityMetrics: ProposalQualityMetrics
    ): ProposalAnalysis['marketReadiness'] {

        const score = qualityMetrics.marketAnalysis;
        const level = this.determineLevel(score);

        const recommendations: string[] = [];

        if (score < 70) {
            recommendations.push('تحسين تحليل السوق');
            recommendations.push('إضافة بيانات العملاء المستهدفين');
            recommendations.push('تحليل الاتجاهات السوقية');
        }

        if (qualityMetrics.competitiveAdvantage < 70) {
            recommendations.push('تحديد الميزة التنافسية بوضوح');
            recommendations.push('تحليل المنافسين');
        }

        if (qualityMetrics.stakeholderAlignment < 70) {
            recommendations.push('تحسين خطة التواصل مع أصحاب المصلحة');
            recommendations.push('إضافة خطة إدارة التغيير');
        }

        return { score, level, recommendations };
    }

    /**
     * تحليل الجوانب المالية
     */
    private static analyzeFinancialAspects(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis
    ): ProposalAnalysis['financialAnalysis'] {

        const budget = proposal.budget || 0;
        const expectedRevenue = proposal.expectedRevenue || 0;
        const paybackPeriod = proposal.paybackPeriod || 'غير محدد';

        let budgetAdequacy: ProposalAnalysis['financialAnalysis']['budgetAdequacy'] = 'adequate';
        if (budget < 10000) budgetAdequacy = 'insufficient';
        else if (budget > 1000000) budgetAdequacy = 'excessive';
        else if (budget > 500000) budgetAdequacy = 'generous';

        const costBenefitRatio = expectedRevenue > 0 ? budget / expectedRevenue : 0;

        const recommendations: string[] = [];

        if (budgetAdequacy === 'insufficient') {
            recommendations.push('زيادة الميزانية أو تقليل نطاق المشروع');
        }

        if (costBenefitRatio > 0.5) {
            recommendations.push('تحسين كفاءة التكلفة');
        }

        if (paybackPeriod === 'غير محدد') {
            recommendations.push('تحديد فترة الاسترداد المتوقعة');
        }

        return {
            budgetAdequacy,
            costBenefitRatio,
            paybackPeriod,
            recommendations
        };
    }

    /**
     * تحليل الموقف التنافسي
     */
    private static analyzeCompetitivePosition(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis
    ): ProposalAnalysis['competitiveAnalysis'] {

        let marketPosition: ProposalAnalysis['competitiveAnalysis']['marketPosition'] = 'moderate';

        if (contextAnalysis.competitiveLandscape === 'low') {
            marketPosition = 'strong';
        } else if (contextAnalysis.competitiveLandscape === 'high') {
            marketPosition = 'weak';
        }

        const competitiveAdvantage: string[] = [];
        if (proposal.uniqueValue) competitiveAdvantage.push('قيمة فريدة');
        if (proposal.technologyStack) competitiveAdvantage.push('تقنيات متقدمة');
        if (proposal.team) competitiveAdvantage.push('فريق مؤهل');

        const threats: string[] = [];
        if (contextAnalysis.competitiveLandscape === 'high') {
            threats.push('منافسة شديدة');
        }
        if (contextAnalysis.marketMaturity === 'declining') {
            threats.push('تراجع السوق');
        }

        const recommendations: string[] = [];

        if (marketPosition === 'weak') {
            recommendations.push('تحسين الميزة التنافسية');
            recommendations.push('تحديد نقاط التميز');
        }

        if (competitiveAdvantage.length === 0) {
            recommendations.push('تحديد الميزة التنافسية');
        }

        return {
            marketPosition,
            competitiveAdvantage,
            threats,
            recommendations
        };
    }

    /**
     * تحليل المخاطر
     */
    private static analyzeRisks(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis
    ): ProposalAnalysis['riskAnalysis'] {

        const overallRisk = contextAnalysis.riskLevel;

        const keyRisks: ProposalAnalysis['riskAnalysis']['keyRisks'] = [];

        // مخاطر تقنية
        if (contextAnalysis.technicalComplexity === 'high') {
            keyRisks.push({
                risk: 'تعقيد تقني عالي',
                probability: 'medium',
                impact: 'high',
                mitigation: 'تطوير خطة تقنية مفصلة وتدريب الفريق'
            });
        }

        // مخاطر مالية
        if (contextAnalysis.budgetRange === 'high' || contextAnalysis.budgetRange === 'enterprise') {
            keyRisks.push({
                risk: 'مخاطر مالية عالية',
                probability: 'medium',
                impact: 'high',
                mitigation: 'تطوير خطة مالية محافظة ومراقبة التكاليف'
            });
        }

        // مخاطر السوق
        if (contextAnalysis.marketMaturity === 'emerging') {
            keyRisks.push({
                risk: 'عدم نضج السوق',
                probability: 'high',
                impact: 'medium',
                mitigation: 'إجراء بحث سوقي شامل وتطوير استراتيجية تسويق قوية'
            });
        }

        // مخاطر التنظيم
        if (contextAnalysis.complianceRequirements.length > 0) {
            keyRisks.push({
                risk: 'متطلبات تنظيمية معقدة',
                probability: 'medium',
                impact: 'high',
                mitigation: 'الاستعانة بخبراء قانونيين ووضع خطة امتثال'
            });
        }

        const recommendations: string[] = [];

        if (overallRisk === 'high') {
            recommendations.push('تطوير خطة إدارة مخاطر شاملة');
            recommendations.push('وضع خطط طوارئ لكل مخاطر رئيسية');
        }

        if (keyRisks.length > 3) {
            recommendations.push('تحديد أولويات المخاطر والتركيز على الأهم');
        }

        return {
            overallRisk,
            keyRisks,
            recommendations
        };
    }

    /**
     * تحليل التنفيذ
     */
    private static analyzeImplementation(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis
    ): ProposalAnalysis['implementationAnalysis'] {

        let feasibility: ProposalAnalysis['implementationAnalysis']['feasibility'] = 'medium';

        if (contextAnalysis.complexityLevel === 'basic') {
            feasibility = 'high';
        } else if (contextAnalysis.complexityLevel === 'expert') {
            feasibility = 'low';
        }

        let timeline: ProposalAnalysis['implementationAnalysis']['timeline'] = 'realistic';

        if (contextAnalysis.timelineComplexity === 'simple') {
            timeline = 'optimistic';
        } else if (contextAnalysis.timelineComplexity === 'enterprise') {
            timeline = 'pessimistic';
        }

        let resourceRequirements: ProposalAnalysis['implementationAnalysis']['resourceRequirements'] = 'medium';

        if (contextAnalysis.resourceRequirements.human === 'high' ||
            contextAnalysis.resourceRequirements.financial === 'high') {
            resourceRequirements = 'high';
        } else if (contextAnalysis.resourceRequirements.human === 'low' &&
                   contextAnalysis.resourceRequirements.financial === 'low') {
            resourceRequirements = 'low';
        }

        const recommendations: string[] = [];

        if (feasibility === 'low') {
            recommendations.push('تبسيط المشروع أو تقسيمه إلى مراحل');
            recommendations.push('الاستعانة بخبراء متخصصين');
        }

        if (timeline === 'pessimistic') {
            recommendations.push('مراجعة الجدول الزمني وإضافة وقت إضافي');
        }

        if (resourceRequirements === 'high') {
            recommendations.push('تحسين كفاءة استخدام الموارد');
            recommendations.push('البحث عن مصادر تمويل إضافية');
        }

        return {
            feasibility,
            timeline,
            resourceRequirements,
            recommendations
        };
    }

    /**
     * توليد التوصيات العامة
     */
    private static generateOverallRecommendations(
        proposal: any,
        contextAnalysis: ProposalContextAnalysis,
        qualityMetrics: ProposalQualityMetrics
    ): ProposalAnalysis['overallRecommendations'] {

        const actions: string[] = [];
        const resources: string[] = [];

        // تحديد الأولوية
        let priority: ProposalAnalysis['overallRecommendations']['priority'] = 'medium';

        if (qualityMetrics.overall < 60) {
            priority = 'critical';
        } else if (qualityMetrics.overall > 85) {
            priority = 'low';
        } else if (qualityMetrics.overall > 75) {
            priority = 'medium';
        } else {
            priority = 'high';
        }

        // تحديد الإجراءات
        if (qualityMetrics.businessValue < 70) {
            actions.push('تحسين تحليل القيمة التجارية');
        }

        if (qualityMetrics.technicalFeasibility < 70) {
            actions.push('تحسين المتطلبات التقنية');
        }

        if (qualityMetrics.marketAnalysis < 70) {
            actions.push('إجراء تحليل سوق شامل');
        }

        if (qualityMetrics.riskAssessment < 70) {
            actions.push('تطوير خطة إدارة المخاطر');
        }

        // تحديد الموارد المطلوبة
        if (contextAnalysis.resourceRequirements.human === 'high') {
            resources.push('فريق عمل إضافي');
        }

        if (contextAnalysis.resourceRequirements.financial === 'high') {
            resources.push('تمويل إضافي');
        }

        if (contextAnalysis.resourceRequirements.technical === 'high') {
            resources.push('خبراء تقنيين');
        }

        // تحديد الجدول الزمني
        let timeline = '3-6 أشهر';
        if (contextAnalysis.timelineComplexity === 'simple') {
            timeline = '1-3 أشهر';
        } else if (contextAnalysis.timelineComplexity === 'complex') {
            timeline = '6-12 شهر';
        } else if (contextAnalysis.timelineComplexity === 'enterprise') {
            timeline = '12+ شهر';
        }

        return {
            priority,
            actions,
            timeline,
            resources
        };
    }

    /**
     * حساب النقاط الإجمالية
     */
    private static calculateOverallScore(qualityMetrics: ProposalQualityMetrics): number {
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
            qualityMetrics.businessValue * weights.businessValue +
            qualityMetrics.marketAnalysis * weights.marketAnalysis +
            qualityMetrics.financialFeasibility * weights.financialFeasibility +
            qualityMetrics.technicalFeasibility * weights.technicalFeasibility +
            qualityMetrics.riskAssessment * weights.riskAssessment +
            qualityMetrics.competitiveAdvantage * weights.competitiveAdvantage +
            qualityMetrics.stakeholderAlignment * weights.stakeholderAlignment +
            qualityMetrics.implementationPlan * weights.implementationPlan
        );
    }

    /**
     * تحديد المستوى العام
     */
    private static determineOverallLevel(score: number): ProposalAnalysis['overallLevel'] {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        return 'poor';
    }

    /**
     * اتخاذ القرار
     */
    private static makeDecision(
        score: number,
        riskLevel: 'low' | 'medium' | 'high' | 'critical'
    ): ProposalAnalysis['decision'] {

        if (score >= 90 && riskLevel !== 'critical') {
            return 'excellent';
        }

        if (score >= 75 && riskLevel !== 'high' && riskLevel !== 'critical') {
            return 'approve';
        }

        if (score >= 60 && riskLevel !== 'critical') {
            return 'revise';
        }

        return 'reject';
    }

    /**
     * تحديد المستوى
     */
    private static determineLevel(score: number): 'low' | 'medium' | 'high' | 'excellent' {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    }
}
