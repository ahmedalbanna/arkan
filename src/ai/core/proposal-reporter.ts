/**
 * نظام تقارير المقترحات المتقدم
 * يولد تقارير شاملة ومفصلة عن المقترحات
 */

import { ProposalAnalysis } from './proposal-analyzer';
import { ProposalEnhancement } from './proposal-enhancer';
import { ProposalContextAnalysis } from './proposal-context-analyzer';
import { ProposalQualityMetrics } from './proposal-quality-validator';

export interface ProposalReport {
    // معلومات أساسية
    basicInfo: {
        title: string;
        projectType: string;
        industry: string;
        budget: string;
        timeline: string;
        generatedAt: string;
        reportVersion: string;
    };

    // التقييم العام
    overallAssessment: {
        score: number;
        level: 'poor' | 'fair' | 'good' | 'excellent';
        decision: 'reject' | 'revise' | 'approve' | 'excellent';
        summary: string;
        keyHighlights: string[];
        criticalIssues: string[];
    };

    // التقييم التفصيلي
    detailedAssessment: {
        businessReadiness: {
            score: number;
            level: string;
            strengths: string[];
            weaknesses: string[];
            recommendations: string[];
        };
        technicalReadiness: {
            score: number;
            level: string;
            strengths: string[];
            weaknesses: string[];
            recommendations: string[];
        };
        marketReadiness: {
            score: number;
            level: string;
            strengths: string[];
            weaknesses: string[];
            recommendations: string[];
        };
    };

    // التحليل المالي
    financialAnalysis: {
        budgetAdequacy: string;
        costBenefitRatio: number;
        paybackPeriod: string;
        recommendations: string[];
    };

    // التحليل التنافسي
    competitiveAnalysis: {
        marketPosition: string;
        competitiveAdvantages: string[];
        threats: string[];
        recommendations: string[];
    };

    // تحليل المخاطر
    riskAnalysis: {
        overallRisk: string;
        keyRisks: Array<{
            risk: string;
            probability: string;
            impact: string;
            mitigation: string;
        }>;
        recommendations: string[];
    };

    // تحليل التنفيذ
    implementationAnalysis: {
        feasibility: string;
        timeline: string;
        resourceRequirements: string;
        recommendations: string[];
    };

    // التحسينات
    improvements: {
        applied: Array<{
            section: string;
            improvement: string;
            reason: string;
        }>;
        suggested: Array<{
            section: string;
            suggestion: string;
            reason: string;
            priority: string;
        }>;
        metrics: {
            overallImprovement: number;
            sectionsImproved: number;
            totalSuggestions: number;
        };
    };

    // التوصيات النهائية
    finalRecommendations: {
        priority: string;
        actions: string[];
        timeline: string;
        resources: string[];
        nextSteps: string[];
    };

    // الملخص التنفيذي
    executiveSummary: {
        projectOverview: string;
        keyFindings: string[];
        recommendations: string[];
        conclusion: string;
    };
}

export class ProposalReporter {
    /**
     * توليد تقرير شامل للمقترح
     */
    static async generateReport(
        proposal: any,
        analysis: ProposalAnalysis,
        enhancement: ProposalEnhancement,
        contextAnalysis: ProposalContextAnalysis,
        qualityMetrics: ProposalQualityMetrics
    ): Promise<ProposalReport> {

        const basicInfo = this.extractBasicInfo(proposal);
        const overallAssessment = this.generateOverallAssessment(analysis);
        const detailedAssessment = this.generateDetailedAssessment(analysis);
        const financialAnalysis = this.generateFinancialAnalysis(analysis);
        const competitiveAnalysis = this.generateCompetitiveAnalysis(analysis);
        const riskAnalysis = this.generateRiskAnalysis(analysis);
        const implementationAnalysis = this.generateImplementationAnalysis(analysis);
        const improvements = this.generateImprovementsReport(enhancement);
        const finalRecommendations = this.generateFinalRecommendations(analysis, enhancement);
        const executiveSummary = this.generateExecutiveSummary(proposal, analysis, enhancement);

        return {
            basicInfo,
            overallAssessment,
            detailedAssessment,
            financialAnalysis,
            competitiveAnalysis,
            riskAnalysis,
            implementationAnalysis,
            improvements,
            finalRecommendations,
            executiveSummary
        };
    }

    /**
     * استخراج المعلومات الأساسية
     */
    private static extractBasicInfo(proposal: any): ProposalReport['basicInfo'] {
        return {
            title: proposal.title || 'مقترح مشروع',
            projectType: proposal.projectType || 'غير محدد',
            industry: proposal.industry || 'غير محدد',
            budget: proposal.budget || 'غير محدد',
            timeline: proposal.timeline || 'غير محدد',
            generatedAt: new Date().toISOString(),
            reportVersion: '1.0'
        };
    }

    /**
     * توليد التقييم العام
     */
    private static generateOverallAssessment(analysis: ProposalAnalysis): ProposalReport['overallAssessment'] {
        const keyHighlights: string[] = [];
        const criticalIssues: string[] = [];

        // تحديد النقاط المضيئة
        if (analysis.strengths.length > 0) {
            keyHighlights.push(...analysis.strengths.slice(0, 3));
        }

        if (analysis.businessReadiness.level === 'excellent') {
            keyHighlights.push('جاهزية أعمال ممتازة');
        }

        if (analysis.technicalReadiness.level === 'excellent') {
            keyHighlights.push('جاهزية تقنية ممتازة');
        }

        if (analysis.marketReadiness.level === 'excellent') {
            keyHighlights.push('جاهزية سوق ممتازة');
        }

        // تحديد القضايا الحرجة
        if (analysis.weaknesses.length > 0) {
            criticalIssues.push(...analysis.weaknesses.slice(0, 3));
        }

        if (analysis.riskAnalysis.overallRisk === 'critical') {
            criticalIssues.push('مخاطر حرجة تتطلب معالجة فورية');
        }

        if (analysis.implementationAnalysis.feasibility === 'low') {
            criticalIssues.push('صعوبة في التنفيذ');
        }

        const summary = this.generateOverallSummary(analysis);

        return {
            score: analysis.overallScore,
            level: analysis.overallLevel,
            decision: analysis.decision,
            summary,
            keyHighlights,
            criticalIssues
        };
    }

    /**
     * توليد التقييم التفصيلي
     */
    private static generateDetailedAssessment(analysis: ProposalAnalysis): ProposalReport['detailedAssessment'] {
        return {
            businessReadiness: {
                score: analysis.businessReadiness.score,
                level: analysis.businessReadiness.level,
                strengths: this.extractStrengths(analysis.businessReadiness),
                weaknesses: this.extractWeaknesses(analysis.businessReadiness),
                recommendations: analysis.businessReadiness.recommendations
            },
            technicalReadiness: {
                score: analysis.technicalReadiness.score,
                level: analysis.technicalReadiness.level,
                strengths: this.extractStrengths(analysis.technicalReadiness),
                weaknesses: this.extractWeaknesses(analysis.technicalReadiness),
                recommendations: analysis.technicalReadiness.recommendations
            },
            marketReadiness: {
                score: analysis.marketReadiness.score,
                level: analysis.marketReadiness.level,
                strengths: this.extractStrengths(analysis.marketReadiness),
                weaknesses: this.extractWeaknesses(analysis.marketReadiness),
                recommendations: analysis.marketReadiness.recommendations
            }
        };
    }

    /**
     * توليد التحليل المالي
     */
    private static generateFinancialAnalysis(analysis: ProposalAnalysis): ProposalReport['financialAnalysis'] {
        return {
            budgetAdequacy: analysis.financialAnalysis.budgetAdequacy,
            costBenefitRatio: analysis.financialAnalysis.costBenefitRatio,
            paybackPeriod: analysis.financialAnalysis.paybackPeriod,
            recommendations: analysis.financialAnalysis.recommendations
        };
    }

    /**
     * توليد التحليل التنافسي
     */
    private static generateCompetitiveAnalysis(analysis: ProposalAnalysis): ProposalReport['competitiveAnalysis'] {
        return {
            marketPosition: analysis.competitiveAnalysis.marketPosition,
            competitiveAdvantages: analysis.competitiveAnalysis.competitiveAdvantage,
            threats: analysis.competitiveAnalysis.threats,
            recommendations: analysis.competitiveAnalysis.recommendations
        };
    }

    /**
     * توليد تحليل المخاطر
     */
    private static generateRiskAnalysis(analysis: ProposalAnalysis): ProposalReport['riskAnalysis'] {
        return {
            overallRisk: analysis.riskAnalysis.overallRisk,
            keyRisks: analysis.riskAnalysis.keyRisks,
            recommendations: analysis.riskAnalysis.recommendations
        };
    }

    /**
     * توليد تحليل التنفيذ
     */
    private static generateImplementationAnalysis(analysis: ProposalAnalysis): ProposalReport['implementationAnalysis'] {
        return {
            feasibility: analysis.implementationAnalysis.feasibility,
            timeline: analysis.implementationAnalysis.timeline,
            resourceRequirements: analysis.implementationAnalysis.resourceRequirements,
            recommendations: analysis.implementationAnalysis.recommendations
        };
    }

    /**
     * توليد تقرير التحسينات
     */
    private static generateImprovementsReport(enhancement: ProposalEnhancement): ProposalReport['improvements'] {
        return {
            applied: enhancement.autoImprovements,
            suggested: enhancement.suggestedImprovements,
            metrics: enhancement.improvementMetrics
        };
    }

    /**
     * توليد التوصيات النهائية
     */
    private static generateFinalRecommendations(
        analysis: ProposalAnalysis,
        enhancement: ProposalEnhancement
    ): ProposalReport['finalRecommendations'] {

        const actions: string[] = [];
        const resources: string[] = [];
        const nextSteps: string[] = [];

        // تحديد الإجراءات بناءً على التحليل
        if (analysis.overallScore < 70) {
            actions.push('مراجعة شاملة للمقترح');
            actions.push('تحسين النقاط الضعيفة');
        }

        if (analysis.riskAnalysis.overallRisk === 'high' || analysis.riskAnalysis.overallRisk === 'critical') {
            actions.push('تطوير خطة إدارة مخاطر شاملة');
        }

        if (analysis.implementationAnalysis.feasibility === 'low') {
            actions.push('تبسيط المشروع أو تقسيمه إلى مراحل');
        }

        // تحديد الموارد المطلوبة
        if (enhancement.improvementMetrics.manualImprovements > 0) {
            resources.push('فريق تطوير إضافي');
        }

        if (analysis.financialAnalysis.budgetAdequacy === 'insufficient') {
            resources.push('تمويل إضافي');
        }

        // تحديد الخطوات التالية
        if (analysis.decision === 'revise') {
            nextSteps.push('مراجعة التحسينات المقترحة');
            nextSteps.push('تطبيق التحسينات المطلوبة');
            nextSteps.push('إعادة تقديم المقترح');
        } else if (analysis.decision === 'approve') {
            nextSteps.push('البدء في التنفيذ');
            nextSteps.push('وضع خطة تنفيذ مفصلة');
            nextSteps.push('تحديد الفريق والموارد');
        } else if (analysis.decision === 'excellent') {
            nextSteps.push('البدء الفوري في التنفيذ');
            nextSteps.push('تطوير خطة توسع');
            nextSteps.push('البحث عن فرص تمويل إضافية');
        }

        return {
            priority: analysis.overallRecommendations.priority,
            actions: analysis.overallRecommendations.actions,
            timeline: analysis.overallRecommendations.timeline,
            resources: analysis.overallRecommendations.resources,
            nextSteps
        };
    }

    /**
     * توليد الملخص التنفيذي
     */
    private static generateExecutiveSummary(
        proposal: any,
        analysis: ProposalAnalysis,
        enhancement: ProposalEnhancement
    ): ProposalReport['executiveSummary'] {

        const projectOverview = this.generateProjectOverview(proposal);
        const keyFindings = this.generateKeyFindings(analysis);
        const recommendations = this.generateRecommendations(analysis, enhancement);
        const conclusion = this.generateConclusion(analysis);

        return {
            projectOverview,
            keyFindings,
            recommendations,
            conclusion
        };
    }

    /**
     * توليد نظرة عامة على المشروع
     */
    private static generateProjectOverview(proposal: any): string {
        return `هذا المقترح يهدف إلى ${proposal.objectives || 'تحقيق الأهداف المحددة'} من خلال ${proposal.approach || 'النهج المحدد'}.
        المشروع يتطلب ميزانية ${proposal.budget || 'غير محددة'} ومدة ${proposal.timeline || 'غير محددة'}
        ويستهدف ${proposal.targetAudience || 'الجمهور المستهدف'}.`;
    }

    /**
     * توليد النتائج الرئيسية
     */
    private static generateKeyFindings(analysis: ProposalAnalysis): string[] {
        const findings: string[] = [];

        findings.push(`النقاط الإجمالية: ${analysis.overallScore}/100 (${analysis.overallLevel})`);
        findings.push(`جاهزية الأعمال: ${analysis.businessReadiness.score}/100 (${analysis.businessReadiness.level})`);
        findings.push(`جاهزية التقنية: ${analysis.technicalReadiness.score}/100 (${analysis.technicalReadiness.level})`);
        findings.push(`جاهزية السوق: ${analysis.marketReadiness.score}/100 (${analysis.marketReadiness.level})`);
        findings.push(`مستوى المخاطر: ${analysis.riskAnalysis.overallRisk}`);
        findings.push(`قابلية التنفيذ: ${analysis.implementationAnalysis.feasibility}`);

        return findings;
    }

    /**
     * توليد التوصيات
     */
    private static generateRecommendations(analysis: ProposalAnalysis, enhancement: ProposalEnhancement): string[] {
        const recommendations: string[] = [];

        // توصيات بناءً على التحليل
        if (analysis.businessReadiness.score < 70) {
            recommendations.push('تحسين تحليل القيمة التجارية وخطة الأعمال');
        }

        if (analysis.technicalReadiness.score < 70) {
            recommendations.push('تحسين المتطلبات التقنية وخطة التطوير');
        }

        if (analysis.marketReadiness.score < 70) {
            recommendations.push('إجراء تحليل سوق أكثر شمولية');
        }

        if (analysis.riskAnalysis.overallRisk === 'high' || analysis.riskAnalysis.overallRisk === 'critical') {
            recommendations.push('تطوير خطة إدارة مخاطر شاملة');
        }

        // توصيات بناءً على التحسينات
        if (enhancement.improvementMetrics.totalSuggestions > 0) {
            recommendations.push(`تطبيق ${enhancement.improvementMetrics.totalSuggestions} تحسين مقترح`);
        }

        return recommendations;
    }

    /**
     * توليد الخلاصة
     */
    private static generateConclusion(analysis: ProposalAnalysis): string {
        let conclusion = `بناءً على التحليل الشامل، المقترح يحصل على ${analysis.overallScore}/100 نقطة `;

        if (analysis.overallLevel === 'excellent') {
            conclusion += 'ويُعتبر ممتازاً. يُنصح بالموافقة عليه والبدء في التنفيذ فوراً.';
        } else if (analysis.overallLevel === 'good') {
            conclusion += 'ويُعتبر جيداً. يُنصح بالموافقة عليه مع تطبيق بعض التحسينات.';
        } else if (analysis.overallLevel === 'fair') {
            conclusion += 'ويُعتبر مقبولاً. يُنصح بمراجعته وتطبيق التحسينات المطلوبة قبل الموافقة.';
        } else {
            conclusion += 'ويُعتبر ضعيفاً. يُنصح برفضه أو إجراء مراجعة شاملة.';
        }

        return conclusion;
    }

    /**
     * توليد الملخص العام
     */
    private static generateOverallSummary(analysis: ProposalAnalysis): string {
        return `المقترح يحصل على ${analysis.overallScore}/100 نقطة ويُصنف كـ ${analysis.overallLevel}.
        ${analysis.strengths.length > 0 ? `من نقاط القوة: ${analysis.strengths.slice(0, 2).join('، ')}.` : ''}
        ${analysis.weaknesses.length > 0 ? `من نقاط الضعف: ${analysis.weaknesses.slice(0, 2).join('، ')}.` : ''}
        القرار المقترح: ${analysis.decision}.`;
    }

    /**
     * استخراج نقاط القوة
     */
    private static extractStrengths(assessment: any): string[] {
        const strengths: string[] = [];

        if (assessment.score >= 80) {
            strengths.push('أداء ممتاز');
        } else if (assessment.score >= 70) {
            strengths.push('أداء جيد');
        }

        if (assessment.recommendations.length === 0) {
            strengths.push('لا توجد توصيات للتحسين');
        }

        return strengths;
    }

    /**
     * استخراج نقاط الضعف
     */
    private static extractWeaknesses(assessment: any): string[] {
        const weaknesses: string[] = [];

        if (assessment.score < 60) {
            weaknesses.push('أداء ضعيف');
        } else if (assessment.score < 70) {
            weaknesses.push('أداء مقبول');
        }

        if (assessment.recommendations.length > 3) {
            weaknesses.push('يحتاج تحسينات كثيرة');
        }

        return weaknesses;
    }
}
