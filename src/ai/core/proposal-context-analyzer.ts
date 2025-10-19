/**
 * محلل السياق المتخصص للمقترحات
 * يحلل السياق بشكل خاص لمقترحات المشاريع
 */

import { ContextAnalysisResult, ContextAnalyzer } from './context-analyzer';

export interface ProposalContextAnalysis extends ContextAnalysisResult {
    // تحليل نوع المقترح
    proposalType: 'business' | 'technical' | 'academic' | 'research' | 'funding' | 'partnership';

    // تحليل الصناعة
    industry: string;
    marketSize: 'small' | 'medium' | 'large' | 'enterprise';

    // تحليل الجمهور المستهدف
    stakeholderTypes: Array<'investors' | 'clients' | 'partners' | 'regulators' | 'internal'>;

    // تحليل الميزانية المتوقعة
    budgetRange: 'low' | 'medium' | 'high' | 'enterprise';

    // تحليل الجدول الزمني
    timelineComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';

    // تحليل المخاطر
    riskLevel: 'low' | 'medium' | 'high';

    // تحليل المنافسة
    competitiveLandscape: 'low' | 'medium' | 'high';

    // تحليل الابتكار
    innovationLevel: 'incremental' | 'moderate' | 'disruptive';

    // تحليل الامتثال
    complianceRequirements: string[];

    // تحليل التكنولوجيا
    technologyStack: string[];
    technicalComplexity: 'low' | 'medium' | 'high';

    // تحليل السوق
    marketMaturity: 'emerging' | 'growing' | 'mature' | 'declining';
    targetGeographic: string[];

    // تحليل القيمة
    valueProposition: string[];
    uniqueSellingPoints: string[];

    // تحليل الموارد
    resourceRequirements: {
        human: 'low' | 'medium' | 'high';
        financial: 'low' | 'medium' | 'high';
        technical: 'low' | 'medium' | 'high';
        time: 'low' | 'medium' | 'high';
    };
}

export class ProposalContextAnalyzer {
    /**
     * تحليل السياق المتخصص للمقترحات
     */
    static async analyzeProposalContext(input: {
        projectIdea: string;
        externalContext?: Array<{ fileName: string; content: string; type: string }>;
        guidelines?: string[];
        projectType?: string;
        budget?: number;
        timeline?: string;
        targetAudience?: string;
    }): Promise<ProposalContextAnalysis> {

        // التحليل الأساسي
        const baseAnalysis = await ContextAnalyzer.analyzeContext({
            userInput: input.projectIdea,
            externalContext: input.externalContext,
            guidelines: input.guidelines,
            projectType: input.projectType
        });

        // التحليل المتخصص للمقترحات
        const proposalAnalysis = this.analyzeProposalSpecifics(input, baseAnalysis);

        // دمج التحليل الأساسي والتحليل المتخصص مع القيم الافتراضية
        const mergedAnalysis: ProposalContextAnalysis = {
            ...baseAnalysis,
            proposalType: proposalAnalysis.proposalType || 'business',
            industry: proposalAnalysis.industry || 'غير محدد',
            marketSize: proposalAnalysis.marketSize || 'medium',
            stakeholderTypes: proposalAnalysis.stakeholderTypes || ['clients'],
            budgetRange: proposalAnalysis.budgetRange || 'medium',
            timelineComplexity: proposalAnalysis.timelineComplexity || 'moderate',
            riskLevel: proposalAnalysis.riskLevel || 'medium',
            competitiveLandscape: proposalAnalysis.competitiveLandscape || 'medium',
            innovationLevel: proposalAnalysis.innovationLevel || 'moderate',
            complianceRequirements: proposalAnalysis.complianceRequirements || [],
            technologyStack: proposalAnalysis.technologyStack || [],
            technicalComplexity: proposalAnalysis.technicalComplexity || 'medium',
            marketMaturity: proposalAnalysis.marketMaturity || 'growing',
            targetGeographic: proposalAnalysis.targetGeographic || ['محلي'],
            valueProposition: proposalAnalysis.valueProposition || [],
            uniqueSellingPoints: proposalAnalysis.uniqueSellingPoints || [],
            resourceRequirements: proposalAnalysis.resourceRequirements || {
                human: 'medium',
                financial: 'medium',
                technical: 'medium',
                time: 'medium'
            }
        };

        return mergedAnalysis;
    }

    /**
     * تحليل الجوانب الخاصة بالمقترحات
     */
    private static analyzeProposalSpecifics(input: any, baseAnalysis: ContextAnalysisResult): Partial<ProposalContextAnalysis> {
        const projectIdea = input.projectIdea.toLowerCase();

        return {
            // تحليل نوع المقترح
            proposalType: this.determineProposalType(projectIdea, input.projectType) || 'business',

            // تحليل الصناعة
            industry: this.extractIndustry(projectIdea, input.externalContext),
            marketSize: this.assessMarketSize(projectIdea, input.budget),

            // تحليل الجمهور المستهدف
            stakeholderTypes: this.identifyStakeholders(projectIdea, input.targetAudience),

            // تحليل الميزانية
            budgetRange: this.assessBudgetRange(input.budget, projectIdea),

            // تحليل الجدول الزمني
            timelineComplexity: this.assessTimelineComplexity(input.timeline, projectIdea),

            // تحليل المخاطر
            riskLevel: this.assessRiskLevel(projectIdea, input.externalContext),

            // تحليل المنافسة
            competitiveLandscape: this.assessCompetitiveLandscape(projectIdea, input.industry),

            // تحليل الابتكار
            innovationLevel: this.assessInnovationLevel(projectIdea, input.externalContext),

            // تحليل الامتثال
            complianceRequirements: this.extractComplianceRequirements(projectIdea, input.externalContext),

            // تحليل التكنولوجيا
            technologyStack: this.extractTechnologyStack(projectIdea, input.externalContext),
            technicalComplexity: this.assessTechnicalComplexity(projectIdea, input.externalContext),

            // تحليل السوق
            marketMaturity: this.assessMarketMaturity(projectIdea, input.industry),
            targetGeographic: this.extractTargetGeographic(projectIdea, input.externalContext),

            // تحليل القيمة
            valueProposition: this.extractValueProposition(projectIdea, input.externalContext),
            uniqueSellingPoints: this.extractUniqueSellingPoints(projectIdea, input.externalContext),

            // تحليل الموارد
            resourceRequirements: this.assessResourceRequirements(projectIdea, input.externalContext)
        };
    }

    // Helper methods
    private static determineProposalType(projectIdea: string, projectType?: string): ProposalContextAnalysis['proposalType'] {
        if (projectType) {
            const typeMap: { [key: string]: ProposalContextAnalysis['proposalType'] } = {
                'business': 'business',
                'technical': 'technical',
                'academic': 'academic',
                'research': 'research',
                'funding': 'funding',
                'partnership': 'partnership'
            };
            return typeMap[projectType] || 'business';
        }

        if (projectIdea.includes('بحث') || projectIdea.includes('دراسة') || projectIdea.includes('research')) {
            return 'research';
        }
        if (projectIdea.includes('تمويل') || projectIdea.includes('استثمار') || projectIdea.includes('funding')) {
            return 'funding';
        }
        if (projectIdea.includes('شراكة') || projectIdea.includes('تعاون') || projectIdea.includes('partnership')) {
            return 'partnership';
        }
        if (projectIdea.includes('تقني') || projectIdea.includes('تطبيق') || projectIdea.includes('نظام')) {
            return 'technical';
        }
        if (projectIdea.includes('أكاديمي') || projectIdea.includes('جامعة') || projectIdea.includes('academic')) {
            return 'academic';
        }

        return 'business';
    }

    private static extractIndustry(projectIdea: string, externalContext?: any[]): string {
        const industries = {
            'تكنولوجيا': ['تطبيق', 'نظام', 'برنامج', 'تقني', 'ذكي', 'رقمي'],
            'رعاية صحية': ['صحة', 'طبي', 'علاج', 'مستشفى', 'دواء'],
            'تعليم': ['تعليم', 'تدريب', 'تعلم', 'مدرسة', 'جامعة'],
            'مالية': ['مالي', 'بنك', 'استثمار', 'تأمين', 'دفع'],
            'تجارة': ['تجارة', 'بيع', 'شراء', 'متجر', 'تسوق'],
            'صناعة': ['صناعة', 'إنتاج', 'تصنيع', 'مصنع'],
            'زراعة': ['زراعة', 'مزرعة', 'محصول', 'نبات'],
            'طاقة': ['طاقة', 'كهرباء', 'شمسي', 'رياح'],
            'نقل': ['نقل', 'مواصلات', 'سيارة', 'طائرة', 'قطار']
        };

        for (const [industry, keywords] of Object.entries(industries)) {
            if (keywords.some(keyword => projectIdea.includes(keyword))) {
                return industry;
            }
        }

        return 'عام';
    }

    private static assessMarketSize(projectIdea: string, budget?: number): ProposalContextAnalysis['marketSize'] {
        if (budget) {
            if (budget < 10000) return 'small';
            if (budget < 100000) return 'medium';
            if (budget < 1000000) return 'large';
            return 'enterprise';
        }

        const enterpriseKeywords = ['مؤسسة', 'شركة كبيرة', 'حكومة', 'enterprise'];
        const largeKeywords = ['سوق كبير', 'جمهور واسع', 'توسع'];
        const mediumKeywords = ['سوق متوسط', 'جمهور محدود'];

        if (enterpriseKeywords.some(keyword => projectIdea.includes(keyword))) return 'enterprise';
        if (largeKeywords.some(keyword => projectIdea.includes(keyword))) return 'large';
        if (mediumKeywords.some(keyword => projectIdea.includes(keyword))) return 'medium';
        return 'small';
    }

    private static identifyStakeholders(projectIdea: string, targetAudience?: string): ProposalContextAnalysis['stakeholderTypes'] {
        const stakeholders: ProposalContextAnalysis['stakeholderTypes'] = [];

        if (projectIdea.includes('مستثمر') || projectIdea.includes('استثمار') || projectIdea.includes('investor')) {
            stakeholders.push('investors');
        }
        if (projectIdea.includes('عميل') || projectIdea.includes('زبون') || projectIdea.includes('client')) {
            stakeholders.push('clients');
        }
        if (projectIdea.includes('شريك') || projectIdea.includes('شراكة') || projectIdea.includes('partner')) {
            stakeholders.push('partners');
        }
        if (projectIdea.includes('حكومة') || projectIdea.includes('تنظيم') || projectIdea.includes('regulator')) {
            stakeholders.push('regulators');
        }
        if (projectIdea.includes('داخلي') || projectIdea.includes('موظف') || projectIdea.includes('internal')) {
            stakeholders.push('internal');
        }

        return stakeholders.length > 0 ? stakeholders : ['clients'];
    }

    private static assessBudgetRange(budget?: number, projectIdea?: string): ProposalContextAnalysis['budgetRange'] {
        if (budget) {
            if (budget < 10000) return 'low';
            if (budget < 100000) return 'medium';
            if (budget < 1000000) return 'high';
            return 'enterprise';
        }

        if (projectIdea) {
            if (projectIdea.includes('ميزانية صغيرة') || projectIdea.includes('تكلفة منخفضة')) return 'low';
            if (projectIdea.includes('ميزانية كبيرة') || projectIdea.includes('تكلفة عالية')) return 'high';
            if (projectIdea.includes('مؤسسة') || projectIdea.includes('enterprise')) return 'enterprise';
        }

        return 'medium';
    }

    private static assessTimelineComplexity(timeline?: string, projectIdea?: string): ProposalContextAnalysis['timelineComplexity'] {
        if (timeline) {
            if (timeline.includes('شهر') || timeline.includes('month')) return 'simple';
            if (timeline.includes('سنة') || timeline.includes('year')) return 'complex';
            return 'moderate';
        }

        if (projectIdea) {
            if (projectIdea.includes('سريع') || projectIdea.includes('فوري')) return 'simple';
            if (projectIdea.includes('طويل') || projectIdea.includes('معقد')) return 'complex';
            if (projectIdea.includes('مؤسسة') || projectIdea.includes('enterprise')) return 'enterprise';
        }

        return 'moderate';
    }

    private static assessRiskLevel(projectIdea: string, externalContext?: any[]): ProposalContextAnalysis['riskLevel'] {
        const highRiskKeywords = ['مخاطر عالية', 'معقد', 'جديد', 'غير مضمون'];
        const lowRiskKeywords = ['آمن', 'مثبت', 'بسيط', 'مضمون'];

        if (highRiskKeywords.some(keyword => projectIdea.includes(keyword))) return 'high';
        if (lowRiskKeywords.some(keyword => projectIdea.includes(keyword))) return 'low';
        return 'medium';
    }

    private static assessCompetitiveLandscape(projectIdea: string, industry?: string): ProposalContextAnalysis['competitiveLandscape'] {
        const highCompetitionKeywords = ['منافسة شديدة', 'سوق مشبع', 'منافسين كثر'];
        const lowCompetitionKeywords = ['سوق جديد', 'منافسة قليلة', 'فرصة فريدة'];

        if (highCompetitionKeywords.some(keyword => projectIdea.includes(keyword))) return 'high';
        if (lowCompetitionKeywords.some(keyword => projectIdea.includes(keyword))) return 'low';
        return 'medium';
    }

    private static assessInnovationLevel(projectIdea: string, externalContext?: any[]): ProposalContextAnalysis['innovationLevel'] {
        const disruptiveKeywords = ['ثوري', 'جديد تماماً', 'تغيير جذري', 'disruptive'];
        const incrementalKeywords = ['تحسين', 'تطوير', 'تحديث', 'incremental'];

        if (disruptiveKeywords.some(keyword => projectIdea.includes(keyword))) return 'disruptive';
        if (incrementalKeywords.some(keyword => projectIdea.includes(keyword))) return 'incremental';
        return 'moderate';
    }

    private static extractComplianceRequirements(projectIdea: string, externalContext?: any[]): string[] {
        const requirements: string[] = [];

        if (projectIdea.includes('صحة') || projectIdea.includes('طبي')) {
            requirements.push('موافقات صحية');
        }
        if (projectIdea.includes('مالي') || projectIdea.includes('بنك')) {
            requirements.push('موافقات مالية');
        }
        if (projectIdea.includes('حكومة') || projectIdea.includes('عام')) {
            requirements.push('موافقات حكومية');
        }
        if (projectIdea.includes('بيانات') || projectIdea.includes('خصوصية')) {
            requirements.push('حماية البيانات');
        }

        return requirements;
    }

    private static extractTechnologyStack(projectIdea: string, externalContext?: any[]): string[] {
        const technologies: string[] = [];

        const techKeywords = {
            'React': ['react', 'jsx'],
            'Node.js': ['node', 'express'],
            'Python': ['python', 'django', 'flask'],
            'Java': ['java', 'spring'],
            'C#': ['c#', 'dotnet'],
            'PHP': ['php', 'laravel'],
            'Vue.js': ['vue', 'nuxt'],
            'Angular': ['angular'],
            'MongoDB': ['mongodb', 'mongo'],
            'PostgreSQL': ['postgresql', 'postgres'],
            'MySQL': ['mysql'],
            'Redis': ['redis'],
            'Docker': ['docker'],
            'Kubernetes': ['kubernetes', 'k8s'],
            'AWS': ['aws', 'amazon'],
            'Azure': ['azure', 'microsoft'],
            'Google Cloud': ['gcp', 'google cloud']
        };

        for (const [tech, keywords] of Object.entries(techKeywords)) {
            if (keywords.some(keyword => projectIdea.toLowerCase().includes(keyword))) {
                technologies.push(tech);
            }
        }

        return technologies;
    }

    private static assessTechnicalComplexity(projectIdea: string, externalContext?: any[]): ProposalContextAnalysis['technicalComplexity'] {
        const highComplexityKeywords = ['معقد', 'متقدم', 'ذكي', 'ai', 'ml', 'blockchain'];
        const lowComplexityKeywords = ['بسيط', 'أساسي', 'static'];

        if (highComplexityKeywords.some(keyword => projectIdea.includes(keyword))) return 'high';
        if (lowComplexityKeywords.some(keyword => projectIdea.includes(keyword))) return 'low';
        return 'medium';
    }

    private static assessMarketMaturity(projectIdea: string, industry?: string): ProposalContextAnalysis['marketMaturity'] {
        const emergingKeywords = ['ناشئ', 'جديد', 'emerging', 'startup'];
        const matureKeywords = ['ناضج', 'مستقر', 'mature', 'established'];
        const decliningKeywords = ['تراجع', 'انخفاض', 'declining'];

        if (emergingKeywords.some(keyword => projectIdea.includes(keyword))) return 'emerging';
        if (decliningKeywords.some(keyword => projectIdea.includes(keyword))) return 'declining';
        if (matureKeywords.some(keyword => projectIdea.includes(keyword))) return 'mature';
        return 'growing';
    }

    private static extractTargetGeographic(projectIdea: string, externalContext?: any[]): string[] {
        const regions: string[] = [];

        const regionKeywords = {
            'الشرق الأوسط': ['شرق أوسط', 'خليج', 'عربي'],
            'أوروبا': ['أوروبا', 'europe', 'eu'],
            'أمريكا الشمالية': ['أمريكا', 'كندا', 'north america'],
            'آسيا': ['آسيا', 'asia', 'شرق آسيا'],
            'أفريقيا': ['أفريقيا', 'africa']
        };

        for (const [region, keywords] of Object.entries(regionKeywords)) {
            if (keywords.some(keyword => projectIdea.includes(keyword))) {
                regions.push(region);
            }
        }

        return regions.length > 0 ? regions : ['الشرق الأوسط'];
    }

    private static extractValueProposition(projectIdea: string, externalContext?: any[]): string[] {
        const propositions: string[] = [];

        if (projectIdea.includes('توفير') || projectIdea.includes('اقتصاد')) {
            propositions.push('توفير التكلفة');
        }
        if (projectIdea.includes('سرعة') || projectIdea.includes('سريع')) {
            propositions.push('تحسين السرعة');
        }
        if (projectIdea.includes('جودة') || projectIdea.includes('أفضل')) {
            propositions.push('تحسين الجودة');
        }
        if (projectIdea.includes('سهولة') || projectIdea.includes('بساطة')) {
            propositions.push('سهولة الاستخدام');
        }
        if (projectIdea.includes('أمان') || projectIdea.includes('حماية')) {
            propositions.push('الأمان والحماية');
        }

        return propositions;
    }

    private static extractUniqueSellingPoints(projectIdea: string, externalContext?: any[]): string[] {
        const sellingPoints: string[] = [];

        if (projectIdea.includes('فريد') || projectIdea.includes('مميز')) {
            sellingPoints.push('حل فريد ومميز');
        }
        if (projectIdea.includes('أول') || projectIdea.includes('رائد')) {
            sellingPoints.push('الريادة في المجال');
        }
        if (projectIdea.includes('ذكي') || projectIdea.includes('ai')) {
            sellingPoints.push('الذكاء الاصطناعي');
        }
        if (projectIdea.includes('سريع') || projectIdea.includes('فوري')) {
            sellingPoints.push('السرعة في التنفيذ');
        }

        return sellingPoints;
    }

    private static assessResourceRequirements(projectIdea: string, externalContext?: any[]): ProposalContextAnalysis['resourceRequirements'] {
        const highResourceKeywords = ['كثير', 'متعدد', 'معقد', 'كبير'];
        const lowResourceKeywords = ['قليل', 'بسيط', 'صغير', 'محدود'];

        const assessLevel = (keywords: string[]) => {
            if (highResourceKeywords.some(keyword => projectIdea.includes(keyword))) return 'high';
            if (lowResourceKeywords.some(keyword => projectIdea.includes(keyword))) return 'low';
            return 'medium';
        };

        return {
            human: assessLevel(['موظف', 'فريق', 'خبراء']),
            financial: assessLevel(['ميزانية', 'تكلفة', 'استثمار']),
            technical: assessLevel(['تقني', 'تكنولوجيا', 'نظام']),
            time: assessLevel(['وقت', 'مدة', 'جدول زمني'])
        };
    }
}
