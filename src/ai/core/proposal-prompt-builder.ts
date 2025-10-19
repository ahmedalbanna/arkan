/**
 * بناء المحفزات المتخصص للمقترحات
 * يبني prompts محسنة خصيصاً لمقترحات المشاريع
 */

import { ProposalContextAnalysis } from './proposal-context-analyzer';
import { PromptTemplate } from './intelligent-prompt-builder';

export interface ProposalPromptConfig {
    proposalType: 'business' | 'technical' | 'academic' | 'research' | 'funding' | 'partnership';
    industry: string;
    stakeholderTypes: Array<'investors' | 'clients' | 'partners' | 'regulators' | 'internal'>;
    budgetRange: 'low' | 'medium' | 'high' | 'enterprise';
    timelineComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
    riskLevel: 'low' | 'medium' | 'high';
    innovationLevel: 'incremental' | 'moderate' | 'disruptive';
    complianceRequirements: string[];
    technologyStack: string[];
    targetGeographic: string[];
    valueProposition: string[];
    uniqueSellingPoints: string[];
    resourceRequirements: {
        human: 'low' | 'medium' | 'high';
        financial: 'low' | 'medium' | 'high';
        technical: 'low' | 'medium' | 'high';
        time: 'low' | 'medium' | 'high';
    };
}

export class ProposalPromptBuilder {
    /**
     * بناء prompt متخصص للمقترحات
     */
    static buildProposalPrompt(
        contextAnalysis: ProposalContextAnalysis,
        userInput: string,
        externalContext?: Array<{ fileName: string; content: string; type: string }>
    ): PromptTemplate {

        const config: ProposalPromptConfig = {
            proposalType: contextAnalysis.proposalType,
            industry: contextAnalysis.industry,
            stakeholderTypes: contextAnalysis.stakeholderTypes,
            budgetRange: contextAnalysis.budgetRange,
            timelineComplexity: contextAnalysis.timelineComplexity,
            riskLevel: contextAnalysis.riskLevel,
            innovationLevel: contextAnalysis.innovationLevel,
            complianceRequirements: contextAnalysis.complianceRequirements,
            technologyStack: contextAnalysis.technologyStack,
            targetGeographic: contextAnalysis.targetGeographic,
            valueProposition: contextAnalysis.valueProposition,
            uniqueSellingPoints: contextAnalysis.uniqueSellingPoints,
            resourceRequirements: contextAnalysis.resourceRequirements
        };

        return {
            system: this.buildProposalSystemPrompt(config, contextAnalysis),
            context: this.buildProposalContextSection(userInput, externalContext, config),
            instructions: this.buildProposalInstructionsSection(config, contextAnalysis),
            examples: this.buildProposalExamplesSection(config),
            constraints: this.buildProposalConstraintsSection(config),
            outputFormat: this.buildProposalOutputFormatSection(config)
        };
    }

    /**
     * بناء System Prompt المتخصص للمقترحات
     */
    private static buildProposalSystemPrompt(
        config: ProposalPromptConfig,
        contextAnalysis: ProposalContextAnalysis
    ): string {
        let systemPrompt = `أنت خبير متخصص في كتابة مقترحات المشاريع ${this.getProposalTypeDescription(config.proposalType)}. `;

        // تخصيص حسب نوع المقترح
        systemPrompt += this.getProposalTypeExpertise(config.proposalType);

        // تخصيص حسب الصناعة
        systemPrompt += this.getIndustryExpertise(config.industry);

        // تخصيص حسب الجمهور المستهدف
        systemPrompt += this.getStakeholderExpertise(config.stakeholderTypes);

        // تخصيص حسب مستوى الميزانية
        systemPrompt += this.getBudgetLevelExpertise(config.budgetRange);

        // تخصيص حسب مستوى الابتكار
        systemPrompt += this.getInnovationLevelExpertise(config.innovationLevel);

        // تخصيص حسب مستوى المخاطر
        systemPrompt += this.getRiskLevelExpertise(config.riskLevel);

        // تخصيص حسب المنطقة الجغرافية
        systemPrompt += this.getGeographicExpertise(config.targetGeographic);

        // تخصيص حسب مستوى التعقيد
        systemPrompt += this.getComplexityExpertise(contextAnalysis.complexityLevel);

        // تخصيص حسب الجمهور المستهدف
        systemPrompt += this.getAudienceExpertise(contextAnalysis.targetAudience);

        return systemPrompt;
    }

    /**
     * بناء قسم السياق المتخصص للمقترحات
     */
    private static buildProposalContextSection(
        userInput: string,
        externalContext: Array<{ fileName: string; content: string; type: string }> | undefined,
        config: ProposalPromptConfig
    ): string {
        let contextSection = '--- سياق المقترح والمعلومات المتاحة ---\n';

        // إضافة معلومات المشروع الأساسية
        contextSection += '**معلومات المشروع:**\n';
        contextSection += `- نوع المقترح: ${this.getProposalTypeDescription(config.proposalType)}\n`;
        contextSection += `- الصناعة: ${config.industry}\n`;
        contextSection += `- الجمهور المستهدف: ${config.stakeholderTypes.join(', ')}\n`;
        contextSection += `- نطاق الميزانية: ${this.getBudgetRangeDescription(config.budgetRange)}\n`;
        contextSection += `- تعقيد الجدول الزمني: ${this.getTimelineComplexityDescription(config.timelineComplexity)}\n`;
        contextSection += `- مستوى المخاطر: ${this.getRiskLevelDescription(config.riskLevel)}\n`;
        contextSection += `- مستوى الابتكار: ${this.getInnovationLevelDescription(config.innovationLevel)}\n\n`;

        // إضافة متطلبات الامتثال
        if (config.complianceRequirements.length > 0) {
            contextSection += '**متطلبات الامتثال:**\n';
            config.complianceRequirements.forEach(req => {
                contextSection += `- ${req}\n`;
            });
            contextSection += '\n';
        }

        // إضافة التكنولوجيا المستخدمة
        if (config.technologyStack.length > 0) {
            contextSection += '**التكنولوجيا المستخدمة:**\n';
            contextSection += `- ${config.technologyStack.join(', ')}\n\n`;
        }

        // إضافة القيمة المقترحة
        if (config.valueProposition.length > 0) {
            contextSection += '**القيمة المقترحة:**\n';
            config.valueProposition.forEach(value => {
                contextSection += `- ${value}\n`;
            });
            contextSection += '\n';
        }

        // إضافة النقاط المميزة
        if (config.uniqueSellingPoints.length > 0) {
            contextSection += '**النقاط المميزة:**\n';
            config.uniqueSellingPoints.forEach(point => {
                contextSection += `- ${point}\n`;
            });
            contextSection += '\n';
        }

        // إضافة السياق الخارجي
        if (externalContext && externalContext.length > 0) {
            contextSection += '**الملفات والمراجع المتاحة:**\n';
            externalContext.forEach(file => {
                contextSection += `--- ${file.fileName} (${file.type}) ---\n`;
                const content = file.content.length > 1000 ?
                    file.content.substring(0, 1000) + '...' :
                    file.content;
                contextSection += `${content}\n---\n\n`;
            });
        }

        return contextSection;
    }

    /**
     * بناء قسم التعليمات المتخصص للمقترحات
     */
    private static buildProposalInstructionsSection(
        config: ProposalPromptConfig,
        contextAnalysis: ProposalContextAnalysis
    ): string {
        let instructions = '--- التعليمات المتخصصة لكتابة المقترح ---\n';

        // التعليمات الأساسية
        instructions += `**المهمة الأساسية:** ${this.getProposalTaskDescription(config.proposalType)}\n\n`;

        // تعليمات حسب نوع المقترح
        instructions += this.getProposalTypeInstructions(config.proposalType);

        // تعليمات حسب الصناعة
        instructions += this.getIndustryInstructions(config.industry);

        // تعليمات حسب الجمهور المستهدف
        instructions += this.getStakeholderInstructions(config.stakeholderTypes);

        // تعليمات حسب مستوى الميزانية
        instructions += this.getBudgetLevelInstructions(config.budgetRange);

        // تعليمات حسب مستوى الابتكار
        instructions += this.getInnovationLevelInstructions(config.innovationLevel);

        // تعليمات حسب مستوى المخاطر
        instructions += this.getRiskLevelInstructions(config.riskLevel);

        // تعليمات حسب المنطقة الجغرافية
        instructions += this.getGeographicInstructions(config.targetGeographic);

        // تعليمات حسب مستوى التعقيد
        instructions += this.getComplexityInstructions(contextAnalysis.complexityLevel);

        // تعليمات حسب الجمهور المستهدف
        instructions += this.getAudienceInstructions(contextAnalysis.targetAudience);

        // تعليمات الجودة
        instructions += '\n**معايير الجودة للمقترح:**\n';
        instructions += '- تأكد من الوضوح والشمولية\n';
        instructions += '- استخدم لغة مهنية ومناسبة\n';
        instructions += '- قدم أدلة وبيانات داعمة\n';
        instructions += '- اتبع أفضل الممارسات في المجال\n';
        instructions += '- راجع المخرجات قبل التسليم\n';

        return instructions;
    }

    /**
     * بناء قسم الأمثلة المتخصص للمقترحات
     */
    private static buildProposalExamplesSection(config: ProposalPromptConfig): string {
        let examples = '--- أمثلة للإرشاد ---\n';

        // أمثلة حسب نوع المقترح
        examples += this.getProposalTypeExamples(config.proposalType);

        // أمثلة حسب الصناعة
        examples += this.getIndustryExamples(config.industry);

        // أمثلة حسب الجمهور المستهدف
        examples += this.getStakeholderExamples(config.stakeholderTypes);

        return examples;
    }

    /**
     * بناء قسم القيود المتخصص للمقترحات
     */
    private static buildProposalConstraintsSection(config: ProposalPromptConfig): string {
        let constraints = '--- القيود والمحددات للمقترح ---\n';

        // قيود حسب نوع المقترح
        constraints += this.getProposalTypeConstraints(config.proposalType);

        // قيود حسب الصناعة
        constraints += this.getIndustryConstraints(config.industry);

        // قيود حسب الجمهور المستهدف
        constraints += this.getStakeholderConstraints(config.stakeholderTypes);

        // قيود حسب مستوى الميزانية
        constraints += this.getBudgetLevelConstraints(config.budgetRange);

        // قيود حسب مستوى المخاطر
        constraints += this.getRiskLevelConstraints(config.riskLevel);

        return constraints;
    }

    /**
     * بناء قسم تنسيق المخرجات المتخصص للمقترحات
     */
    private static buildProposalOutputFormatSection(config: ProposalPromptConfig): string {
        let format = '--- تنسيق المخرجات المطلوب للمقترح ---\n';

        // تنسيق حسب نوع المقترح
        format += this.getProposalTypeFormat(config.proposalType);

        // تنسيق حسب الجمهور المستهدف
        format += this.getStakeholderFormat(config.stakeholderTypes);

        // تنسيق حسب مستوى الميزانية
        format += this.getBudgetLevelFormat(config.budgetRange);

        return format;
    }

    // Helper methods
    private static getProposalTypeDescription(type: string): string {
        const descriptions = {
            'business': 'التجارية',
            'technical': 'التقنية',
            'academic': 'الأكاديمية',
            'research': 'البحثية',
            'funding': 'التمويل',
            'partnership': 'الشراكة'
        };
        return descriptions[type as keyof typeof descriptions] || 'التجارية';
    }

    private static getProposalTypeExpertise(type: string): string {
        const expertise = {
            'business': 'لديك خبرة واسعة في كتابة المقترحات التجارية وإدارة المشاريع.',
            'technical': 'لديك خبرة عميقة في المقترحات التقنية والهندسية.',
            'academic': 'لديك خلفية أكاديمية قوية في كتابة المقترحات البحثية.',
            'research': 'لديك خبرة في كتابة مقترحات البحوث والدراسات.',
            'funding': 'لديك خبرة في كتابة مقترحات التمويل والاستثمار.',
            'partnership': 'لديك خبرة في كتابة مقترحات الشراكة والتعاون.'
        };
        return expertise[type as keyof typeof expertise] || expertise.business;
    }

    private static getIndustryExpertise(industry: string): string {
        return `تتخصص في صناعة ${industry} وتفهم متطلباتها وتحدياتها. `;
    }

    private static getStakeholderExpertise(stakeholders: string[]): string {
        if (stakeholders.includes('investors')) {
            return 'تكتب مقترحات مقنعة للمستثمرين مع التركيز على العائد على الاستثمار. ';
        }
        if (stakeholders.includes('clients')) {
            return 'تكتب مقترحات تركز على القيمة المقدمة للعملاء. ';
        }
        if (stakeholders.includes('partners')) {
            return 'تكتب مقترحات تركز على الفوائد المتبادلة في الشراكة. ';
        }
        if (stakeholders.includes('regulators')) {
            return 'تكتب مقترحات تراعي المتطلبات التنظيمية والامتثال. ';
        }
        return 'تكتب مقترحات مناسبة للجمهور المستهدف. ';
    }

    private static getBudgetLevelExpertise(budgetRange: string): string {
        const expertise = {
            'low': 'تكتب مقترحات للمشاريع ذات الميزانية المحدودة مع التركيز على الكفاءة.',
            'medium': 'تكتب مقترحات متوازنة للمشاريع ذات الميزانية المتوسطة.',
            'high': 'تكتب مقترحات للمشاريع ذات الميزانية الكبيرة مع التفاصيل الشاملة.',
            'enterprise': 'تكتب مقترحات للمشاريع المؤسسية الكبيرة مع التحليل المعمق.'
        };
        return expertise[budgetRange as keyof typeof expertise] || expertise.medium;
    }

    private static getInnovationLevelExpertise(innovationLevel: string): string {
        const expertise = {
            'incremental': 'تكتب مقترحات للتحسينات التدريجية مع التركيز على الاستقرار.',
            'moderate': 'تكتب مقترحات للابتكارات المعتدلة مع التوازن بين الجدة والموثوقية.',
            'disruptive': 'تكتب مقترحات للابتكارات الثورية مع التركيز على التغيير الجذري.'
        };
        return expertise[innovationLevel as keyof typeof expertise] || expertise.moderate;
    }

    private static getRiskLevelExpertise(riskLevel: string): string {
        const expertise = {
            'low': 'تكتب مقترحات للمشاريع منخفضة المخاطر مع التركيز على الأمان.',
            'medium': 'تكتب مقترحات للمشاريع متوسطة المخاطر مع إدارة المخاطر المناسبة.',
            'high': 'تكتب مقترحات للمشاريع عالية المخاطر مع خطة إدارة المخاطر الشاملة.'
        };
        return expertise[riskLevel as keyof typeof expertise] || expertise.medium;
    }

    private static getGeographicExpertise(regions: string[]): string {
        if (regions.includes('الشرق الأوسط')) {
            return 'تكتب مقترحات مناسبة للسياق الثقافي والاقتصادي للشرق الأوسط. ';
        }
        if (regions.includes('أوروبا')) {
            return 'تكتب مقترحات تراعي المعايير الأوروبية والتنظيمية. ';
        }
        if (regions.includes('أمريكا الشمالية')) {
            return 'تكتب مقترحات مناسبة للسوق الأمريكي والشمال أمريكي. ';
        }
        return 'تكتب مقترحات مناسبة للسياق المحلي. ';
    }

    private static getComplexityExpertise(complexity: string): string {
        const expertise = {
            'basic': 'تكتب مقترحات بسيطة وواضحة للمشاريع الأساسية.',
            'intermediate': 'تكتب مقترحات متوسطة التعقيد مع التفاصيل المناسبة.',
            'advanced': 'تكتب مقترحات متقدمة مع التحليل المعمق.',
            'expert': 'تكتب مقترحات متخصصة للمشاريع المعقدة مع الخبرة المتقدمة.'
        };
        return expertise[complexity as keyof typeof expertise] || expertise.intermediate;
    }

    private static getAudienceExpertise(audience: string): string {
        const expertise = {
            'executive': 'تكتب مقترحات تنفيذية مع التركيز على النتائج والتأثير.',
            'technical': 'تكتب مقترحات تقنية مع التفاصيل التقنية الدقيقة.',
            'academic': 'تكتب مقترحات أكاديمية مع المنهجية العلمية.',
            'student': 'تكتب مقترحات تعليمية مع الشروحات الواضحة.',
            'general': 'تكتب مقترحات مفهومة للجمهور العام.'
        };
        return expertise[audience as keyof typeof expertise] || expertise.general;
    }

    // Helper methods for descriptions
    private static getBudgetRangeDescription(range: string): string {
        const descriptions = {
            'low': 'منخفضة (أقل من 10,000)',
            'medium': 'متوسطة (10,000 - 100,000)',
            'high': 'عالية (100,000 - 1,000,000)',
            'enterprise': 'مؤسسية (أكثر من 1,000,000)'
        };
        return descriptions[range as keyof typeof descriptions] || 'متوسطة';
    }

    private static getTimelineComplexityDescription(complexity: string): string {
        const descriptions = {
            'simple': 'بسيط (أقل من 3 أشهر)',
            'moderate': 'متوسط (3-12 شهر)',
            'complex': 'معقد (1-3 سنوات)',
            'enterprise': 'مؤسسي (أكثر من 3 سنوات)'
        };
        return descriptions[complexity as keyof typeof descriptions] || 'متوسط';
    }

    private static getRiskLevelDescription(level: string): string {
        const descriptions = {
            'low': 'منخفض',
            'medium': 'متوسط',
            'high': 'عالي'
        };
        return descriptions[level as keyof typeof descriptions] || 'متوسط';
    }

    private static getInnovationLevelDescription(level: string): string {
        const descriptions = {
            'incremental': 'تدريجي',
            'moderate': 'معتدل',
            'disruptive': 'ثوري'
        };
        return descriptions[level as keyof typeof descriptions] || 'معتدل';
    }

    private static getProposalTaskDescription(type: string): string {
        const descriptions = {
            'business': 'كتابة مقترح تجاري شامل ومقنع',
            'technical': 'كتابة مقترح تقني مفصل ودقيق',
            'academic': 'كتابة مقترح أكاديمي منهجي',
            'research': 'كتابة مقترح بحثي علمي',
            'funding': 'كتابة مقترح تمويل مقنع',
            'partnership': 'كتابة مقترح شراكة متوازن'
        };
        return descriptions[type as keyof typeof descriptions] || 'كتابة مقترح شامل';
    }

    // Additional helper methods for instructions, examples, constraints, and format
    private static getProposalTypeInstructions(type: string): string {
        const instructions = {
            'business': '**تعليمات المقترح التجاري:**\n- ركز على القيمة التجارية والعائد على الاستثمار\n- قدم تحليل السوق والمنافسة\n- حدد استراتيجية التسويق والمبيعات\n- قدم خطة مالية مفصلة\n',
            'technical': '**تعليمات المقترح التقني:**\n- قدم تفاصيل تقنية دقيقة\n- حدد التقنيات المستخدمة والمتطلبات\n- قدم خطة التطوير والاختبار\n- حدد متطلبات البنية التحتية\n',
            'academic': '**تعليمات المقترح الأكاديمي:**\n- اتبع المعايير الأكاديمية\n- قدم مراجع ومصادر موثوقة\n- استخدم منهجية علمية واضحة\n- حدد الأهداف البحثية والفرضيات\n',
            'research': '**تعليمات المقترح البحثي:**\n- حدد مشكلة البحث بوضوح\n- قدم مراجعة الأدبيات\n- حدد منهجية البحث\n- قدم خطة جمع البيانات والتحليل\n',
            'funding': '**تعليمات مقترح التمويل:**\n- ركز على العائد المالي المتوقع\n- قدم تحليل المخاطر والفرص\n- حدد استخدام الأموال بالتفصيل\n- قدم خطة الخروج للمستثمرين\n',
            'partnership': '**تعليمات مقترح الشراكة:**\n- حدد الفوائد المتبادلة\n- قدم خطة التعاون والتنسيق\n- حدد المسؤوليات والحقوق\n- قدم خطة حل النزاعات\n'
        };
        return instructions[type as keyof typeof instructions] || '';
    }

    private static getIndustryInstructions(industry: string): string {
        return `**تعليمات خاصة بصناعة ${industry}:**\n- راعي المتطلبات الخاصة بالصناعة\n- اتبع المعايير واللوائح المعمول بها\n- قدم أمثلة من نفس الصناعة\n- حدد الفرص والتحديات الخاصة\n`;
    }

    private static getStakeholderInstructions(stakeholders: string[]): string {
        let instructions = '**تعليمات حسب الجمهور المستهدف:**\n';

        if (stakeholders.includes('investors')) {
            instructions += '- ركز على العائد المالي والمخاطر\n- قدم تحليل مالي مفصل\n- حدد خطة الخروج\n';
        }
        if (stakeholders.includes('clients')) {
            instructions += '- ركز على القيمة المقدمة للعميل\n- قدم أمثلة وحالات استخدام\n- حدد الفوائد والنتائج المتوقعة\n';
        }
        if (stakeholders.includes('partners')) {
            instructions += '- ركز على الفوائد المتبادلة\n- حدد مسؤوليات كل طرف\n- قدم خطة التعاون\n';
        }
        if (stakeholders.includes('regulators')) {
            instructions += '- ركز على الامتثال والتنظيم\n- قدم خطة إدارة المخاطر\n- حدد التدابير الوقائية\n';
        }

        return instructions + '\n';
    }

    private static getBudgetLevelInstructions(budgetRange: string): string {
        const instructions = {
            'low': '**تعليمات للميزانية المنخفضة:**\n- ركز على الكفاءة والتوفير\n- قدم حلول مبتكرة منخفضة التكلفة\n- حدد الأولويات والمراحل\n',
            'medium': '**تعليمات للميزانية المتوسطة:**\n- وازن بين الجودة والتكلفة\n- قدم خطة تنفيذ متوازنة\n- حدد الموارد المطلوبة\n',
            'high': '**تعليمات للميزانية العالية:**\n- قدم تحليل شامل ومفصل\n- حدد جميع المتطلبات والموارد\n- قدم خطة إدارة المخاطر\n',
            'enterprise': '**تعليمات للميزانية المؤسسية:**\n- قدم تحليل استراتيجي شامل\n- حدد التأثير على المؤسسة\n- قدم خطة التحول والتطوير\n'
        };
        return instructions[budgetRange as keyof typeof instructions] || '';
    }

    private static getInnovationLevelInstructions(level: string): string {
        const instructions = {
            'incremental': '**تعليمات للابتكار التدريجي:**\n- ركز على التحسينات المثبتة\n- قدم أدلة على النجاح السابق\n- حدد المخاطر المنخفضة\n',
            'moderate': '**تعليمات للابتكار المعتدل:**\n- وازن بين الجدة والموثوقية\n- قدم أدلة على الجدوى\n- حدد المخاطر المتوسطة\n',
            'disruptive': '**تعليمات للابتكار الثوري:**\n- ركز على التغيير الجذري\n- قدم رؤية مستقبلية واضحة\n- حدد المخاطر العالية والفرص\n'
        };
        return instructions[level as keyof typeof instructions] || '';
    }

    private static getRiskLevelInstructions(level: string): string {
        const instructions = {
            'low': '**تعليمات للمخاطر المنخفضة:**\n- ركز على الاستقرار والموثوقية\n- قدم خطة تنفيذ آمنة\n- حدد التدابير الوقائية\n',
            'medium': '**تعليمات للمخاطر المتوسطة:**\n- وازن بين المخاطر والفرص\n- قدم خطة إدارة المخاطر\n- حدد التدابير التخفيفية\n',
            'high': '**تعليمات للمخاطر العالية:**\n- ركز على إدارة المخاطر\n- قدم خطة شاملة للتعامل مع المخاطر\n- حدد التدابير الوقائية والطارئة\n'
        };
        return instructions[level as keyof typeof instructions] || '';
    }

    private static getGeographicInstructions(regions: string[]): string {
        let instructions = '**تعليمات حسب المنطقة الجغرافية:**\n';

        if (regions.includes('الشرق الأوسط')) {
            instructions += '- راعي السياق الثقافي والاجتماعي\n- استخدم الأمثلة المناسبة للمنطقة\n- حدد الفرص المحلية\n';
        }
        if (regions.includes('أوروبا')) {
            instructions += '- راعي المعايير الأوروبية\n- اتبع لوائح حماية البيانات\n- حدد الفرص الأوروبية\n';
        }
        if (regions.includes('أمريكا الشمالية')) {
            instructions += '- راعي المعايير الأمريكية\n- اتبع لوائح السوق المحلي\n- حدد الفرص الأمريكية\n';
        }

        return instructions + '\n';
    }

    private static getComplexityInstructions(complexity: string): string {
        const instructions = {
            'basic': '**تعليمات للمشاريع الأساسية:**\n- استخدم لغة بسيطة وواضحة\n- ركز على النقاط الأساسية\n- قدم شروحات مبسطة\n',
            'intermediate': '**تعليمات للمشاريع المتوسطة:**\n- وازن بين البساطة والتفصيل\n- قدم تحليل متوازن\n- حدد المتطلبات بوضوح\n',
            'advanced': '**تعليمات للمشاريع المتقدمة:**\n- قدم تحليل معمق ومفصل\n- استخدم المصطلحات المتخصصة\n- حدد جميع الجوانب التقنية\n',
            'expert': '**تعليمات للمشاريع المتخصصة:**\n- قدم تحليل متخصص ومعمق\n- استخدم المصطلحات المتقدمة\n- حدد جميع التفاصيل التقنية\n'
        };
        return instructions[complexity as keyof typeof instructions] || '';
    }

    private static getAudienceInstructions(audience: string): string {
        const instructions = {
            'executive': '**تعليمات للجمهور التنفيذي:**\n- ركز على النتائج والتأثير\n- استخدم لغة تنفيذية واضحة\n- قدم ملخص تنفيذي شامل\n',
            'technical': '**تعليمات للجمهور التقني:**\n- قدم تفاصيل تقنية دقيقة\n- استخدم المصطلحات التقنية\n- قدم أمثلة تقنية عملية\n',
            'academic': '**تعليمات للجمهور الأكاديمي:**\n- اتبع المعايير الأكاديمية\n- قدم مراجع ومصادر\n- استخدم منهجية علمية\n',
            'student': '**تعليمات للجمهور الطلابي:**\n- استخدم لغة تعليمية واضحة\n- قدم شروحات مفصلة\n- أضف أمثلة تعليمية\n',
            'general': '**تعليمات للجمهور العام:**\n- استخدم لغة مفهومة\n- قدم شروحات مبسطة\n- أضف أمثلة من الحياة اليومية\n'
        };
        return instructions[audience as keyof typeof instructions] || '';
    }

    // Additional helper methods for examples, constraints, and format
    private static getProposalTypeExamples(type: string): string {
        const examples = {
            'business': '**أمثلة للمقترحات التجارية:**\n- مقترح تطوير تطبيق جوال\n- مقترح فتح فرع جديد\n- مقترح دخول سوق جديد\n',
            'technical': '**أمثلة للمقترحات التقنية:**\n- مقترح تطوير نظام إدارة\n- مقترح تحديث البنية التحتية\n- مقترح تطبيق تقنيات جديدة\n',
            'academic': '**أمثلة للمقترحات الأكاديمية:**\n- مقترح بحث علمي\n- مقترح برنامج تعليمي\n- مقترح مشروع أكاديمي\n',
            'research': '**أمثلة للمقترحات البحثية:**\n- مقترح دراسة علمية\n- مقترح بحث تطبيقي\n- مقترح دراسة ميدانية\n',
            'funding': '**أمثلة لمقترحات التمويل:**\n- مقترح تمويل مشروع\n- مقترح استثمار\n- مقترح قرض\n',
            'partnership': '**أمثلة لمقترحات الشراكة:**\n- مقترح شراكة استراتيجية\n- مقترح تعاون تقني\n- مقترح شراكة تجارية\n'
        };
        return examples[type as keyof typeof examples] || '';
    }

    private static getIndustryExamples(industry: string): string {
        return `**أمثلة من صناعة ${industry}:**\n- استخدم أمثلة من الشركات الرائدة\n- قدم حالات نجاح من نفس الصناعة\n- حدد التحديات والفرص\n`;
    }

    private static getStakeholderExamples(stakeholders: string[]): string {
        let examples = '**أمثلة حسب الجمهور المستهدف:**\n';

        if (stakeholders.includes('investors')) {
            examples += '- أمثلة على العائد المالي\n- حالات نجاح استثمارية\n- مقارنات مع المشاريع المماثلة\n';
        }
        if (stakeholders.includes('clients')) {
            examples += '- حالات استخدام عملية\n- أمثلة على القيمة المقدمة\n- شهادات العملاء\n';
        }
        if (stakeholders.includes('partners')) {
            examples += '- أمثلة على الشراكات الناجحة\n- حالات التعاون السابق\n- الفوائد المتبادلة\n';
        }

        return examples + '\n';
    }

    private static getProposalTypeConstraints(type: string): string {
        const constraints = {
            'business': '**قيود المقترحات التجارية:**\n- يجب أن تكون واقعية وقابلة للتنفيذ\n- يجب أن تراعي السوق والمنافسة\n- يجب أن تكون مربحة مالياً\n',
            'technical': '**قيود المقترحات التقنية:**\n- يجب أن تكون تقنياً قابلة للتنفيذ\n- يجب أن تراعي المتطلبات التقنية\n- يجب أن تكون آمنة وموثوقة\n',
            'academic': '**قيود المقترحات الأكاديمية:**\n- يجب أن تتبع المعايير الأكاديمية\n- يجب أن تكون علمية ومنهجية\n- يجب أن تكون أخلاقية\n',
            'research': '**قيود المقترحات البحثية:**\n- يجب أن تكون علمية ومنهجية\n- يجب أن تكون أخلاقية\n- يجب أن تكون قابلة للتحقق\n',
            'funding': '**قيود مقترحات التمويل:**\n- يجب أن تكون مالية قابلة للتحقق\n- يجب أن تراعي المخاطر\n- يجب أن تكون شفافة\n',
            'partnership': '**قيود مقترحات الشراكة:**\n- يجب أن تكون متوازنة\n- يجب أن تراعي حقوق جميع الأطراف\n- يجب أن تكون قابلة للتنفيذ\n'
        };
        return constraints[type as keyof typeof constraints] || '';
    }

    private static getIndustryConstraints(industry: string): string {
        return `**قيود صناعة ${industry}:**\n- يجب أن تتبع اللوائح والأنظمة\n- يجب أن تراعي المعايير المهنية\n- يجب أن تكون أخلاقية\n`;
    }

    private static getStakeholderConstraints(stakeholders: string[]): string {
        let constraints = '**قيود حسب الجمهور المستهدف:**\n';

        if (stakeholders.includes('investors')) {
            constraints += '- يجب أن تكون مالية دقيقة\n- يجب أن تراعي المخاطر\n- يجب أن تكون شفافة\n';
        }
        if (stakeholders.includes('clients')) {
            constraints += '- يجب أن تكون مفيدة للعميل\n- يجب أن تكون قابلة للتنفيذ\n- يجب أن تكون عادلة\n';
        }
        if (stakeholders.includes('partners')) {
            constraints += '- يجب أن تكون متوازنة\n- يجب أن تراعي حقوق جميع الأطراف\n- يجب أن تكون قابلة للتنفيذ\n';
        }

        return constraints + '\n';
    }

    private static getBudgetLevelConstraints(budgetRange: string): string {
        const constraints = {
            'low': '**قيود الميزانية المنخفضة:**\n- يجب أن تكون فعالة من ناحية التكلفة\n- يجب أن تراعي القيود المالية\n- يجب أن تكون قابلة للتنفيذ\n',
            'medium': '**قيود الميزانية المتوسطة:**\n- يجب أن تكون متوازنة\n- يجب أن تراعي القيود المالية\n- يجب أن تكون قابلة للتنفيذ\n',
            'high': '**قيود الميزانية العالية:**\n- يجب أن تكون مبررة مالياً\n- يجب أن تراعي القيود المالية\n- يجب أن تكون قابلة للتنفيذ\n',
            'enterprise': '**قيود الميزانية المؤسسية:**\n- يجب أن تكون استراتيجية\n- يجب أن تراعي القيود المالية\n- يجب أن تكون قابلة للتنفيذ\n'
        };
        return constraints[budgetRange as keyof typeof constraints] || '';
    }

    private static getRiskLevelConstraints(level: string): string {
        const constraints = {
            'low': '**قيود المخاطر المنخفضة:**\n- يجب أن تكون آمنة\n- يجب أن تراعي المخاطر\n- يجب أن تكون قابلة للتنفيذ\n',
            'medium': '**قيود المخاطر المتوسطة:**\n- يجب أن تكون متوازنة\n- يجب أن تراعي المخاطر\n- يجب أن تكون قابلة للتنفيذ\n',
            'high': '**قيود المخاطر العالية:**\n- يجب أن تكون مبررة\n- يجب أن تراعي المخاطر\n- يجب أن تكون قابلة للتنفيذ\n'
        };
        return constraints[level as keyof typeof constraints] || '';
    }

    private static getProposalTypeFormat(type: string): string {
        const formats = {
            'business': '**تنسيق المقترح التجاري:**\n- ملخص تنفيذي\n- تحليل السوق\n- استراتيجية التسويق\n- الخطة المالية\n- خطة التنفيذ\n',
            'technical': '**تنسيق المقترح التقني:**\n- نظرة عامة تقنية\n- المتطلبات التقنية\n- خطة التطوير\n- خطة الاختبار\n- خطة النشر\n',
            'academic': '**تنسيق المقترح الأكاديمي:**\n- ملخص البحث\n- مراجعة الأدبيات\n- منهجية البحث\n- خطة جمع البيانات\n- خطة التحليل\n',
            'research': '**تنسيق المقترح البحثي:**\n- مشكلة البحث\n- مراجعة الأدبيات\n- منهجية البحث\n- خطة جمع البيانات\n- خطة التحليل\n',
            'funding': '**تنسيق مقترح التمويل:**\n- ملخص الاستثمار\n- تحليل السوق\n- الخطة المالية\n- خطة إدارة المخاطر\n- خطة الخروج\n',
            'partnership': '**تنسيق مقترح الشراكة:**\n- نظرة عامة على الشراكة\n- الفوائد المتبادلة\n- خطة التعاون\n- المسؤوليات والحقوق\n- خطة حل النزاعات\n'
        };
        return formats[type as keyof typeof formats] || '';
    }

    private static getStakeholderFormat(stakeholders: string[]): string {
        let format = '**تنسيق حسب الجمهور المستهدف:**\n';

        if (stakeholders.includes('investors')) {
            format += '- ركز على العائد المالي\n- قدم تحليل مالي مفصل\n- حدد خطة الخروج\n';
        }
        if (stakeholders.includes('clients')) {
            format += '- ركز على القيمة المقدمة\n- قدم أمثلة وحالات استخدام\n- حدد الفوائد والنتائج\n';
        }
        if (stakeholders.includes('partners')) {
            format += '- ركز على الفوائد المتبادلة\n- حدد مسؤوليات كل طرف\n- قدم خطة التعاون\n';
        }

        return format + '\n';
    }

    private static getBudgetLevelFormat(budgetRange: string): string {
        const formats = {
            'low': '**تنسيق للميزانية المنخفضة:**\n- ركز على الكفاءة\n- قدم حلول مبتكرة\n- حدد الأولويات\n',
            'medium': '**تنسيق للميزانية المتوسطة:**\n- وازن بين الجودة والتكلفة\n- قدم خطة متوازنة\n- حدد الموارد\n',
            'high': '**تنسيق للميزانية العالية:**\n- قدم تحليل شامل\n- حدد جميع المتطلبات\n- قدم خطة إدارة المخاطر\n',
            'enterprise': '**تنسيق للميزانية المؤسسية:**\n- قدم تحليل استراتيجي\n- حدد التأثير على المؤسسة\n- قدم خطة التحول\n'
        };
        return formats[budgetRange as keyof typeof formats] || '';
    }
}
