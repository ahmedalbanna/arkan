/**
 * محسن المقترحات التلقائي
 * يحسن المقترحات بناءً على التحليل والتوصيات
 */

import { ProposalAnalysis } from './proposal-analyzer';
import { ProposalContextAnalysis } from './proposal-context-analyzer';
import { ProposalQualityMetrics } from './proposal-quality-validator';

export interface ProposalEnhancement {
    // التحسينات المقترحة
    improvements: Array<{
        section: string;
        currentValue: string;
        improvedValue: string;
        reason: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        effort: 'low' | 'medium' | 'high';
    }>;

    // التحسينات التلقائية
    autoImprovements: Array<{
        section: string;
        improvement: string;
        reason: string;
    }>;

    // التحسينات المقترحة للمراجعة
    suggestedImprovements: Array<{
        section: string;
        suggestion: string;
        reason: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
    }>;

    // النتيجة المحسنة
    enhancedProposal: any;

    // مقاييس التحسين
    improvementMetrics: {
        overallImprovement: number;
        sectionsImproved: number;
        totalSuggestions: number;
        autoImprovements: number;
        manualImprovements: number;
    };
}

export class ProposalEnhancer {
    /**
     * تحسين المقترح بناءً على التحليل
     */
    static async enhanceProposal(
        proposal: any,
        analysis: ProposalAnalysis,
        contextAnalysis: ProposalContextAnalysis,
        qualityMetrics: ProposalQualityMetrics
    ): Promise<ProposalEnhancement> {

        const improvements: ProposalEnhancement['improvements'] = [];
        const autoImprovements: ProposalEnhancement['autoImprovements'] = [];
        const suggestedImprovements: ProposalEnhancement['suggestedImprovements'] = [];

        // تحسين جاهزية الأعمال
        if (analysis.businessReadiness.score < 75) {
            const businessImprovements = this.improveBusinessReadiness(proposal, analysis.businessReadiness);
            improvements.push(...businessImprovements);
        }

        // تحسين جاهزية التقنية
        if (analysis.technicalReadiness.score < 75) {
            const technicalImprovements = this.improveTechnicalReadiness(proposal, analysis.technicalReadiness);
            improvements.push(...technicalImprovements);
        }

        // تحسين جاهزية السوق
        if (analysis.marketReadiness.score < 75) {
            const marketImprovements = this.improveMarketReadiness(proposal, analysis.marketReadiness);
            improvements.push(...marketImprovements);
        }

        // تحسين الجوانب المالية
        if (analysis.financialAnalysis.budgetAdequacy === 'insufficient' ||
            analysis.financialAnalysis.budgetAdequacy === 'excessive') {
            const financialImprovements = this.improveFinancialAspects(proposal, analysis.financialAnalysis);
            improvements.push(...financialImprovements);
        }

        // تحسين الموقف التنافسي
        if (analysis.competitiveAnalysis.marketPosition === 'weak') {
            const competitiveImprovements = this.improveCompetitivePosition(proposal, analysis.competitiveAnalysis);
            improvements.push(...competitiveImprovements);
        }

        // تحسين إدارة المخاطر
        if (analysis.riskAnalysis.overallRisk === 'high' || analysis.riskAnalysis.overallRisk === 'critical') {
            const riskImprovements = this.improveRiskManagement(proposal, analysis.riskAnalysis);
            improvements.push(...riskImprovements);
        }

        // تحسين التنفيذ
        if (analysis.implementationAnalysis.feasibility === 'low') {
            const implementationImprovements = this.improveImplementation(proposal, analysis.implementationAnalysis);
            improvements.push(...implementationImprovements);
        }

        // التحسينات التلقائية
        const autoImprovementsResult = this.applyAutoImprovements(proposal, analysis);
        autoImprovements.push(...autoImprovementsResult);

        // التحسينات المقترحة
        const suggestedImprovementsResult = this.generateSuggestedImprovements(proposal, analysis, contextAnalysis);
        suggestedImprovements.push(...suggestedImprovementsResult);

        // تطبيق التحسينات
        const enhancedProposal = this.applyImprovements(proposal, improvements, autoImprovements);

        // حساب مقاييس التحسين
        const improvementMetrics = this.calculateImprovementMetrics(
            improvements, autoImprovements, suggestedImprovements
        );

        return {
            improvements,
            autoImprovements,
            suggestedImprovements,
            enhancedProposal,
            improvementMetrics
        };
    }

    /**
     * تحسين جاهزية الأعمال
     */
    private static improveBusinessReadiness(
        proposal: any,
        businessReadiness: ProposalAnalysis['businessReadiness']
    ): ProposalEnhancement['improvements'] {

        const improvements: ProposalEnhancement['improvements'] = [];

        if (businessReadiness.score < 70) {
            // تحسين تحليل القيمة التجارية
            if (!proposal.businessValue || proposal.businessValue.length < 100) {
                improvements.push({
                    section: 'businessValue',
                    currentValue: proposal.businessValue || 'غير محدد',
                    improvedValue: this.generateBusinessValueAnalysis(proposal),
                    reason: 'تحسين تحليل القيمة التجارية',
                    priority: 'high',
                    effort: 'medium'
                });
            }

            // تحسين خطة الأعمال
            if (!proposal.businessPlan || proposal.businessPlan.length < 200) {
                improvements.push({
                    section: 'businessPlan',
                    currentValue: proposal.businessPlan || 'غير محدد',
                    improvedValue: this.generateBusinessPlan(proposal),
                    reason: 'تحسين خطة الأعمال',
                    priority: 'high',
                    effort: 'high'
                });
            }

            // تحسين تحليل السوق
            if (!proposal.marketAnalysis || proposal.marketAnalysis.length < 150) {
                improvements.push({
                    section: 'marketAnalysis',
                    currentValue: proposal.marketAnalysis || 'غير محدد',
                    improvedValue: this.generateMarketAnalysis(proposal),
                    reason: 'تحسين تحليل السوق',
                    priority: 'medium',
                    effort: 'medium'
                });
            }
        }

        return improvements;
    }

    /**
     * تحسين جاهزية التقنية
     */
    private static improveTechnicalReadiness(
        proposal: any,
        technicalReadiness: ProposalAnalysis['technicalReadiness']
    ): ProposalEnhancement['improvements'] {

        const improvements: ProposalEnhancement['improvements'] = [];

        if (technicalReadiness.score < 70) {
            // تحسين المتطلبات التقنية
            if (!proposal.technicalRequirements || proposal.technicalRequirements.length < 100) {
                improvements.push({
                    section: 'technicalRequirements',
                    currentValue: proposal.technicalRequirements || 'غير محدد',
                    improvedValue: this.generateTechnicalRequirements(proposal),
                    reason: 'تحسين المتطلبات التقنية',
                    priority: 'high',
                    effort: 'medium'
                });
            }

            // تحسين خطة التطوير
            if (!proposal.developmentPlan || proposal.developmentPlan.length < 150) {
                improvements.push({
                    section: 'developmentPlan',
                    currentValue: proposal.developmentPlan || 'غير محدد',
                    improvedValue: this.generateDevelopmentPlan(proposal),
                    reason: 'تحسين خطة التطوير',
                    priority: 'high',
                    effort: 'high'
                });
            }

            // تحسين خطة التنفيذ
            if (!proposal.implementationPlan || proposal.implementationPlan.length < 200) {
                improvements.push({
                    section: 'implementationPlan',
                    currentValue: proposal.implementationPlan || 'غير محدد',
                    improvedValue: this.generateImplementationPlan(proposal),
                    reason: 'تحسين خطة التنفيذ',
                    priority: 'medium',
                    effort: 'high'
                });
            }
        }

        return improvements;
    }

    /**
     * تحسين جاهزية السوق
     */
    private static improveMarketReadiness(
        proposal: any,
        marketReadiness: ProposalAnalysis['marketReadiness']
    ): ProposalEnhancement['improvements'] {

        const improvements: ProposalEnhancement['improvements'] = [];

        if (marketReadiness.score < 70) {
            // تحسين تحليل السوق
            if (!proposal.marketAnalysis || proposal.marketAnalysis.length < 150) {
                improvements.push({
                    section: 'marketAnalysis',
                    currentValue: proposal.marketAnalysis || 'غير محدد',
                    improvedValue: this.generateMarketAnalysis(proposal),
                    reason: 'تحسين تحليل السوق',
                    priority: 'high',
                    effort: 'medium'
                });
            }

            // تحسين الميزة التنافسية
            if (!proposal.competitiveAdvantage || proposal.competitiveAdvantage.length < 100) {
                improvements.push({
                    section: 'competitiveAdvantage',
                    currentValue: proposal.competitiveAdvantage || 'غير محدد',
                    improvedValue: this.generateCompetitiveAdvantage(proposal),
                    reason: 'تحسين الميزة التنافسية',
                    priority: 'high',
                    effort: 'medium'
                });
            }

            // تحسين خطة التواصل مع أصحاب المصلحة
            if (!proposal.stakeholderCommunication || proposal.stakeholderCommunication.length < 100) {
                improvements.push({
                    section: 'stakeholderCommunication',
                    currentValue: proposal.stakeholderCommunication || 'غير محدد',
                    improvedValue: this.generateStakeholderCommunication(proposal),
                    reason: 'تحسين خطة التواصل مع أصحاب المصلحة',
                    priority: 'medium',
                    effort: 'low'
                });
            }
        }

        return improvements;
    }

    /**
     * تحسين الجوانب المالية
     */
    private static improveFinancialAspects(
        proposal: any,
        financialAnalysis: ProposalAnalysis['financialAnalysis']
    ): ProposalEnhancement['improvements'] {

        const improvements: ProposalEnhancement['improvements'] = [];

        if (financialAnalysis.budgetAdequacy === 'insufficient') {
            improvements.push({
                section: 'budget',
                currentValue: proposal.budget || 'غير محدد',
                improvedValue: this.adjustBudget(proposal, 'increase'),
                reason: 'زيادة الميزانية لتغطية المتطلبات',
                priority: 'critical',
                effort: 'medium'
            });
        } else if (financialAnalysis.budgetAdequacy === 'excessive') {
            improvements.push({
                section: 'budget',
                currentValue: proposal.budget || 'غير محدد',
                improvedValue: this.adjustBudget(proposal, 'decrease'),
                reason: 'تحسين كفاءة الميزانية',
                priority: 'medium',
                effort: 'low'
            });
        }

        if (financialAnalysis.costBenefitRatio > 0.5) {
            improvements.push({
                section: 'costBenefitAnalysis',
                currentValue: proposal.costBenefitAnalysis || 'غير محدد',
                improvedValue: this.generateCostBenefitAnalysis(proposal),
                reason: 'تحسين تحليل التكلفة والفائدة',
                priority: 'high',
                effort: 'medium'
            });
        }

        return improvements;
    }

    /**
     * تحسين الموقف التنافسي
     */
    private static improveCompetitivePosition(
        proposal: any,
        competitiveAnalysis: ProposalAnalysis['competitiveAnalysis']
    ): ProposalEnhancement['improvements'] {

        const improvements: ProposalEnhancement['improvements'] = [];

        if (competitiveAnalysis.marketPosition === 'weak') {
            improvements.push({
                section: 'competitiveAdvantage',
                currentValue: proposal.competitiveAdvantage || 'غير محدد',
                improvedValue: this.generateCompetitiveAdvantage(proposal),
                reason: 'تحسين الميزة التنافسية',
                priority: 'high',
                effort: 'medium'
            });

            improvements.push({
                section: 'uniqueValue',
                currentValue: proposal.uniqueValue || 'غير محدد',
                improvedValue: this.generateUniqueValue(proposal),
                reason: 'تحديد القيمة الفريدة',
                priority: 'high',
                effort: 'medium'
            });
        }

        return improvements;
    }

    /**
     * تحسين إدارة المخاطر
     */
    private static improveRiskManagement(
        proposal: any,
        riskAnalysis: ProposalAnalysis['riskAnalysis']
    ): ProposalEnhancement['improvements'] {

        const improvements: ProposalEnhancement['improvements'] = [];

        if (riskAnalysis.overallRisk === 'high' || riskAnalysis.overallRisk === 'critical') {
            improvements.push({
                section: 'riskAnalysis',
                currentValue: proposal.riskAnalysis || 'غير محدد',
                improvedValue: this.generateRiskAnalysis(proposal, riskAnalysis),
                reason: 'تحسين تحليل المخاطر',
                priority: 'critical',
                effort: 'high'
            });

            improvements.push({
                section: 'riskMitigation',
                currentValue: proposal.riskMitigation || 'غير محدد',
                improvedValue: this.generateRiskMitigation(proposal, riskAnalysis),
                reason: 'تحسين خطة إدارة المخاطر',
                priority: 'critical',
                effort: 'high'
            });
        }

        return improvements;
    }

    /**
     * تحسين التنفيذ
     */
    private static improveImplementation(
        proposal: any,
        implementationAnalysis: ProposalAnalysis['implementationAnalysis']
    ): ProposalEnhancement['improvements'] {

        const improvements: ProposalEnhancement['improvements'] = [];

        if (implementationAnalysis.feasibility === 'low') {
            improvements.push({
                section: 'implementationPlan',
                currentValue: proposal.implementationPlan || 'غير محدد',
                improvedValue: this.generateImplementationPlan(proposal),
                reason: 'تحسين خطة التنفيذ',
                priority: 'high',
                effort: 'high'
            });

            improvements.push({
                section: 'resourcePlan',
                currentValue: proposal.resourcePlan || 'غير محدد',
                improvedValue: this.generateResourcePlan(proposal),
                reason: 'تحسين خطة الموارد',
                priority: 'high',
                effort: 'medium'
            });
        }

        return improvements;
    }

    /**
     * تطبيق التحسينات التلقائية
     */
    private static applyAutoImprovements(
        proposal: any,
        analysis: ProposalAnalysis
    ): ProposalEnhancement['autoImprovements'] {

        const autoImprovements: ProposalEnhancement['autoImprovements'] = [];

        // تحسين تلقائي للعنوان
        if (!proposal.title || proposal.title.length < 10) {
            autoImprovements.push({
                section: 'title',
                improvement: this.generateTitle(proposal),
                reason: 'تحسين العنوان'
            });
        }

        // تحسين تلقائي للملخص
        if (!proposal.summary || proposal.summary.length < 50) {
            autoImprovements.push({
                section: 'summary',
                improvement: this.generateSummary(proposal),
                reason: 'تحسين الملخص'
            });
        }

        // تحسين تلقائي للأهداف
        if (!proposal.objectives || proposal.objectives.length < 100) {
            autoImprovements.push({
                section: 'objectives',
                improvement: this.generateObjectives(proposal),
                reason: 'تحسين الأهداف'
            });
        }

        // تحسين تلقائي للجدول الزمني
        if (!proposal.timeline || proposal.timeline.length < 50) {
            autoImprovements.push({
                section: 'timeline',
                improvement: this.generateTimeline(proposal),
                reason: 'تحسين الجدول الزمني'
            });
        }

        return autoImprovements;
    }

    /**
     * توليد التحسينات المقترحة
     */
    private static generateSuggestedImprovements(
        proposal: any,
        analysis: ProposalAnalysis,
        contextAnalysis: ProposalContextAnalysis
    ): ProposalEnhancement['suggestedImprovements'] {

        const suggestions: ProposalEnhancement['suggestedImprovements'] = [];

        // اقتراحات بناءً على التحليل
        if (analysis.businessReadiness.score < 75) {
            suggestions.push({
                section: 'businessPlan',
                suggestion: 'إضافة تحليل أكثر تفصيلاً للقيمة التجارية',
                reason: 'تحسين جاهزية الأعمال',
                priority: 'high'
            });
        }

        if (analysis.technicalReadiness.score < 75) {
            suggestions.push({
                section: 'technicalSpecifications',
                suggestion: 'تحديد المتطلبات التقنية بشكل أكثر تفصيلاً',
                reason: 'تحسين جاهزية التقنية',
                priority: 'high'
            });
        }

        if (analysis.marketReadiness.score < 75) {
            suggestions.push({
                section: 'marketResearch',
                suggestion: 'إجراء بحث سوقي أكثر شمولية',
                reason: 'تحسين جاهزية السوق',
                priority: 'medium'
            });
        }

        // اقتراحات بناءً على السياق
        if (contextAnalysis.complexityLevel === 'expert') {
            suggestions.push({
                section: 'expertise',
                suggestion: 'إضافة معلومات عن الخبرة المطلوبة',
                reason: 'المشروع يتطلب خبرة متخصصة',
                priority: 'high'
            });
        }

        if (contextAnalysis.riskLevel === 'high') {
            suggestions.push({
                section: 'riskManagement',
                suggestion: 'تطوير خطة إدارة مخاطر شاملة',
                reason: 'المشروع يحمل مخاطر عالية',
                priority: 'critical'
            });
        }

        return suggestions;
    }

    /**
     * تطبيق التحسينات
     */
    private static applyImprovements(
        proposal: any,
        improvements: ProposalEnhancement['improvements'],
        autoImprovements: ProposalEnhancement['autoImprovements']
    ): any {

        const enhancedProposal = { ...proposal };

        // تطبيق التحسينات التلقائية
        for (const improvement of autoImprovements) {
            enhancedProposal[improvement.section] = improvement.improvement;
        }

        // تطبيق التحسينات المقترحة (يمكن تطبيقها تلقائياً أو للمراجعة)
        for (const improvement of improvements) {
            if (improvement.priority === 'critical' || improvement.priority === 'high') {
                enhancedProposal[improvement.section] = improvement.improvedValue;
            }
        }

        return enhancedProposal;
    }

    /**
     * حساب مقاييس التحسين
     */
    private static calculateImprovementMetrics(
        improvements: ProposalEnhancement['improvements'],
        autoImprovements: ProposalEnhancement['autoImprovements'],
        suggestedImprovements: ProposalEnhancement['suggestedImprovements']
    ): ProposalEnhancement['improvementMetrics'] {

        const sectionsImproved = new Set([
            ...improvements.map(i => i.section),
            ...autoImprovements.map(i => i.section)
        ]).size;

        const autoImprovementsCount = autoImprovements.length;
        const manualImprovements = improvements.filter(i =>
            i.priority === 'critical' || i.priority === 'high'
        ).length;

        const overallImprovement = Math.min(100,
            (sectionsImproved * 10) + (autoImprovementsCount * 5) + (manualImprovements * 15)
        );

        return {
            overallImprovement,
            sectionsImproved,
            totalSuggestions: suggestedImprovements.length,
            autoImprovements: autoImprovementsCount,
            manualImprovements
        };
    }

    // Helper methods for generating content
    private static generateBusinessValueAnalysis(proposal: any): string {
        return `تحليل القيمة التجارية:
        - القيمة المضافة للمستخدمين: ${proposal.valueProposition || 'تحسين الكفاءة والإنتاجية'}
        - العائد المتوقع على الاستثمار: ${proposal.expectedROI || '15-25%'}
        - الفوائد طويلة المدى: ${proposal.longTermBenefits || 'توسع السوق وزيادة الحصة السوقية'}`;
    }

    private static generateBusinessPlan(proposal: any): string {
        return `خطة الأعمال:
        1. المرحلة الأولى: التطوير والاختبار (3-6 أشهر)
        2. المرحلة الثانية: الإطلاق التجريبي (6-9 أشهر)
        3. المرحلة الثالثة: التوسع والتطوير (9-18 شهر)
        4. المرحلة الرابعة: النضج والاستقرار (18+ شهر)`;
    }

    private static generateMarketAnalysis(proposal: any): string {
        return `تحليل السوق:
        - حجم السوق المستهدف: ${proposal.targetMarketSize || 'غير محدد'}
        - العملاء المستهدفين: ${proposal.targetCustomers || 'الشركات الصغيرة والمتوسطة'}
        - الاتجاهات السوقية: ${proposal.marketTrends || 'نمو الطلب على الحلول التقنية'}
        - المنافسون الرئيسيون: ${proposal.mainCompetitors || 'غير محدد'}`;
    }

    private static generateTechnicalRequirements(proposal: any): string {
        return `المتطلبات التقنية:
        - التقنيات الأساسية: ${proposal.techStack || 'غير محدد'}
        - البنية التحتية المطلوبة: ${proposal.infrastructure || 'غير محدد'}
        - معايير الأمان: ${proposal.securityStandards || 'غير محدد'}
        - متطلبات الأداء: ${proposal.performanceRequirements || 'غير محدد'}`;
    }

    private static generateDevelopmentPlan(proposal: any): string {
        return `خطة التطوير:
        1. التصميم والتحليل (4-6 أسابيع)
        2. التطوير الأساسي (8-12 أسبوع)
        3. الاختبار والتحسين (4-6 أسابيع)
        4. النشر والتدريب (2-4 أسابيع)`;
    }

    private static generateImplementationPlan(proposal: any): string {
        return `خطة التنفيذ:
        1. الإعداد والتحضير (2-4 أسابيع)
        2. التطبيق التدريجي (8-12 أسبوع)
        3. المراقبة والتحسين (4-6 أسابيع)
        4. التقييم والتحسين المستمر (مستمر)`;
    }

    private static generateCompetitiveAdvantage(proposal: any): string {
        return `الميزة التنافسية:
        - ${proposal.uniqueValue || 'قيمة فريدة للمستخدمين'}
        - ${proposal.technologyAdvantage || 'تقنيات متقدمة'}
        - ${proposal.teamAdvantage || 'فريق مؤهل وخبير'}
        - ${proposal.marketAdvantage || 'فهم عميق للسوق'}`;
    }

    private static generateStakeholderCommunication(proposal: any): string {
        return `خطة التواصل مع أصحاب المصلحة:
        1. العملاء: تقارير شهرية وتحديثات منتظمة
        2. المستثمرين: تقارير ربع سنوية وعروض تقديمية
        3. الفريق: اجتماعات أسبوعية وتحديثات مستمرة
        4. الشركاء: اجتماعات شهرية وتنسيق مستمر`;
    }

    private static adjustBudget(proposal: any, direction: 'increase' | 'decrease'): string {
        const currentBudget = proposal.budget || 0;
        const adjustment = direction === 'increase' ? 1.5 : 0.7;
        return Math.round(currentBudget * adjustment).toString();
    }

    private static generateCostBenefitAnalysis(proposal: any): string {
        return `تحليل التكلفة والفائدة:
        - التكلفة الإجمالية: ${proposal.budget || 'غير محدد'}
        - العائد المتوقع: ${proposal.expectedRevenue || 'غير محدد'}
        - فترة الاسترداد: ${proposal.paybackPeriod || 'غير محدد'}
        - صافي القيمة الحالية: ${proposal.npv || 'غير محدد'}`;
    }

    private static generateUniqueValue(proposal: any): string {
        return `القيمة الفريدة:
        - ${proposal.uniqueValue || 'حل مبتكر لمشكلة حقيقية'}
        - ${proposal.differentiation || 'تميز عن المنافسين'}
        - ${proposal.innovation || 'عناصر ابتكارية'}
        - ${proposal.impact || 'تأثير إيجابي على المستخدمين'}`;
    }

    private static generateRiskAnalysis(proposal: any, riskAnalysis: ProposalAnalysis['riskAnalysis']): string {
        return `تحليل المخاطر:
        - المخاطر الرئيسية: ${riskAnalysis.keyRisks.map(r => r.risk).join(', ')}
        - مستوى المخاطر الإجمالي: ${riskAnalysis.overallRisk}
        - استراتيجيات التخفيف: ${riskAnalysis.keyRisks.map(r => r.mitigation).join(', ')}`;
    }

    private static generateRiskMitigation(proposal: any, riskAnalysis: ProposalAnalysis['riskAnalysis']): string {
        return `خطة إدارة المخاطر:
        1. تحديد المخاطر: ${riskAnalysis.keyRisks.map(r => r.risk).join(', ')}
        2. تقييم المخاطر: تحليل الاحتمالية والتأثير
        3. استراتيجيات التخفيف: ${riskAnalysis.keyRisks.map(r => r.mitigation).join(', ')}
        4. المراقبة والمراجعة: تقييم مستمر وتحديث الخطط`;
    }

    private static generateResourcePlan(proposal: any): string {
        return `خطة الموارد:
        - الموارد البشرية: ${proposal.teamSize || 'غير محدد'}
        - الموارد المالية: ${proposal.budget || 'غير محدد'}
        - الموارد التقنية: ${proposal.techResources || 'غير محدد'}
        - الموارد الخارجية: ${proposal.externalResources || 'غير محدد'}`;
    }

    private static generateTitle(proposal: any): string {
        return `${proposal.projectName || 'مشروع'} - ${proposal.projectType || 'مقترح'} متكامل`;
    }

    private static generateSummary(proposal: any): string {
        return `ملخص المشروع:
        ${proposal.projectDescription || 'وصف المشروع'}.
        الهدف: ${proposal.objectives || 'تحقيق الأهداف المحددة'}.
        المدة: ${proposal.timeline || 'غير محدد'}.
        الميزانية: ${proposal.budget || 'غير محدد'}.`;
    }

    private static generateObjectives(proposal: any): string {
        return `أهداف المشروع:
        1. ${proposal.primaryObjective || 'تحقيق الهدف الرئيسي'}
        2. ${proposal.secondaryObjective || 'تحقيق الأهداف الثانوية'}
        3. ${proposal.successMetrics || 'قياس النجاح'}
        4. ${proposal.expectedOutcomes || 'النتائج المتوقعة'}`;
    }

    private static generateTimeline(proposal: any): string {
        return `الجدول الزمني:
        - المرحلة الأولى: ${proposal.phase1 || 'التطوير'} (3-6 أشهر)
        - المرحلة الثانية: ${proposal.phase2 || 'الاختبار'} (6-9 أشهر)
        - المرحلة الثالثة: ${proposal.phase3 || 'النشر'} (9-12 شهر)
        - المرحلة الرابعة: ${proposal.phase4 || 'التحسين'} (12+ شهر)`;
    }
}
