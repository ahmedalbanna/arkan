/**
 * نظام بناء Prompts ذكي ومتكيف
 * يبني prompts محسنة بناءً على تحليل السياق والمتطلبات
 */

import { ContextAnalysisResult } from './context-analyzer';

export interface PromptTemplate {
    system: string;
    context: string;
    instructions: string;
    examples?: string;
    constraints?: string;
    outputFormat?: string;
}

export interface PromptBuildingConfig {
    taskType: 'generation' | 'analysis' | 'translation' | 'improvement';
    domain: string;
    contextAnalysis: ContextAnalysisResult;
    userInput: string;
    externalContext?: Array<{ fileName: string; content: string; type: string }>;
    previousOutput?: string;
    iterationCount?: number;
}

export class IntelligentPromptBuilder {

    /**
     * بناء prompt محسن بناءً على تحليل السياق
     */
    static buildPrompt(config: PromptBuildingConfig): PromptTemplate {
        const { contextAnalysis, taskType, domain, userInput } = config;

        return {
            system: this.buildSystemPrompt(contextAnalysis, taskType, domain),
            context: this.buildContextSection(config),
            instructions: this.buildInstructionsSection(config),
            examples: this.buildExamplesSection(contextAnalysis),
            constraints: this.buildConstraintsSection(contextAnalysis),
            outputFormat: this.buildOutputFormatSection(contextAnalysis, taskType)
        };
    }

    /**
     * بناء System Prompt محسن
     */
    private static buildSystemPrompt(
        contextAnalysis: ContextAnalysisResult,
        taskType: string,
        domain: string
    ): string {
        const { contentType, complexityLevel, targetAudience, language, culturalContext } = contextAnalysis;

        let systemPrompt = `أنت خبير متخصص في ${domain} ومساعد ذكي متقدم. `;

        // تخصيص حسب نوع المحتوى
        switch (contentType) {
            case 'technical':
                systemPrompt += `لديك خبرة عميقة في التقنيات الحديثة والهندسة المعمارية للأنظمة. `;
                break;
            case 'business':
                systemPrompt += `لديك خبرة واسعة في الاستراتيجيات التجارية وإدارة المشاريع. `;
                break;
            case 'academic':
                systemPrompt += `لديك خلفية أكاديمية قوية ومهارات بحثية متقدمة. `;
                break;
            case 'creative':
                systemPrompt += `لديك قدرات إبداعية عالية ومهارات في الكتابة الإبداعية. `;
                break;
            default:
                systemPrompt += `لديك معرفة شاملة في مختلف المجالات. `;
        }

        // تخصيص حسب مستوى التعقيد
        switch (complexityLevel) {
            case 'expert':
                systemPrompt += `تتعامل مع المفاهيم المعقدة والتحليلات المتقدمة بسهولة. `;
                break;
            case 'advanced':
                systemPrompt += `تقدم تحليلات متقدمة ومفصلة. `;
                break;
            case 'intermediate':
                systemPrompt += `تقدم شروحات واضحة ومفصلة. `;
                break;
            case 'basic':
                systemPrompt += `تقدم شروحات بسيطة وسهلة الفهم. `;
                break;
        }

        // تخصيص حسب الجمهور المستهدف
        switch (targetAudience) {
            case 'executive':
                systemPrompt += `تركز على الجوانب الاستراتيجية والتأثير على الأعمال. `;
                break;
            case 'technical':
                systemPrompt += `تقدم تفاصيل تقنية دقيقة ومفيدة للمطورين والمهندسين. `;
                break;
            case 'academic':
                systemPrompt += `تتبع المعايير الأكاديمية وتقدم مراجع وأدلة. `;
                break;
            case 'student':
                systemPrompt += `تقدم شروحات تعليمية واضحة مع أمثلة عملية. `;
                break;
            default:
                systemPrompt += `تقدم محتوى مفهوم للجمهور العام. `;
        }

        // تخصيص حسب السياق الثقافي
        if (culturalContext === 'middle-east') {
            systemPrompt += `تراعي السياق الثقافي والاجتماعي للشرق الأوسط. `;
        }

        // تخصيص حسب نوع المهمة
        switch (taskType) {
            case 'generation':
                systemPrompt += `مهمتك هي إنتاج محتوى أصلي وعالي الجودة يلبي المتطلبات بدقة.`;
                break;
            case 'analysis':
                systemPrompt += `مهمتك هي تحليل المعلومات المقدمة وتقديم رؤى عميقة.`;
                break;
            case 'translation':
                systemPrompt += `مهمتك هي الترجمة الدقيقة مع الحفاظ على المعنى والسياق.`;
                break;
            case 'improvement':
                systemPrompt += `مهمتك هي تحسين المحتوى الموجود وجعله أكثر فعالية.`;
                break;
        }

        return systemPrompt;
    }

    /**
     * بناء قسم السياق
     */
    private static buildContextSection(config: PromptBuildingConfig): string {
        const { contextAnalysis, externalContext, previousOutput } = config;

        let contextSection = '--- السياق والمعلومات المتاحة ---\n';

        // إضافة المتطلبات المحددة
        if (contextAnalysis.specificRequirements.length > 0) {
            contextSection += '**المتطلبات المحددة:**\n';
            contextAnalysis.specificRequirements.forEach((req, index) => {
                contextSection += `${index + 1}. ${req}\n`;
            });
            contextSection += '\n';
        }

        // إضافة السياق الخارجي
        if (externalContext && externalContext.length > 0) {
            contextSection += '**الملفات والمراجع المتاحة:**\n';
            externalContext.forEach(file => {
                contextSection += `--- ${file.fileName} (${file.type}) ---\n`;
                // تحديد طول المحتوى المعروض حسب الصلة
                const relevance = contextAnalysis.availableContext.files.find(f => f.name === file.fileName)?.relevance || 0.5;
                const maxLength = relevance > 0.8 ? 2000 : relevance > 0.5 ? 1000 : 500;

                // التأكد من وجود المحتوى وعدم كون الأخطاء
                const fileContent = file.content || '';
                const content = fileContent.length > maxLength ?
                    fileContent.substring(0, maxLength) + '...' :
                    fileContent;
                contextSection += `${content}\n---\n\n`;
            });
        }

        // إضافة المخرجات السابقة للتحسين التكراري
        if (previousOutput) {
            contextSection += '**المخرجات السابقة للمراجعة:**\n';
            contextSection += `${previousOutput}\n\n`;
        }

        return contextSection;
    }

    /**
     * بناء قسم التعليمات
     */
    private static buildInstructionsSection(config: PromptBuildingConfig): string {
        const { contextAnalysis, userInput, taskType, iterationCount } = config;

        let instructions = '--- التعليمات المفصلة ---\n';

        // التعليمات الأساسية
        instructions += `**المهمة الأساسية:** ${userInput}\n\n`;

        // تعليمات حسب نوع المهمة
        switch (taskType) {
            case 'generation':
                instructions += this.getGenerationInstructions(contextAnalysis);
                break;
            case 'analysis':
                instructions += this.getAnalysisInstructions(contextAnalysis);
                break;
            case 'translation':
                instructions += this.getTranslationInstructions(contextAnalysis);
                break;
            case 'improvement':
                instructions += this.getImprovementInstructions(contextAnalysis, iterationCount);
                break;
        }

        // تعليمات الجودة
        instructions += '\n**معايير الجودة:**\n';
        instructions += '- تأكد من الدقة والشمولية\n';
        instructions += '- استخدم مصادر موثوقة\n';
        instructions += '- اتبع أفضل الممارسات في المجال\n';
        instructions += '- راجع المخرجات قبل التسليم\n';

        return instructions;
    }

    private static getGenerationInstructions(contextAnalysis: ContextAnalysisResult): string {
        let instructions = '**تعليمات التوليد:**\n';

        switch (contextAnalysis.contentType) {
            case 'technical':
                instructions += '- قدم تفاصيل تقنية دقيقة\n';
                instructions += '- استخدم المصطلحات التقنية المناسبة\n';
                instructions += '- أضف أمثلة عملية عند الحاجة\n';
                break;
            case 'business':
                instructions += '- ركز على القيمة التجارية\n';
                instructions += '- قدم تحليل للتكلفة والفائدة\n';
                instructions += '- استخدم لغة مهنية واضحة\n';
                break;
            case 'academic':
                instructions += '- اتبع المعايير الأكاديمية\n';
                instructions += '- قدم مراجع ومصادر\n';
                instructions += '- استخدم منهجية علمية\n';
                break;
        }

        return instructions;
    }

    private static getAnalysisInstructions(contextAnalysis: ContextAnalysisResult): string {
        return '**تعليمات التحليل:**\n' +
            '- حلل المعلومات بعمق\n' +
            '- قدم رؤى وتوصيات\n' +
            '- استخدم البيانات المتاحة\n' +
            '- اربط النتائج بالسياق\n';
    }

    private static getTranslationInstructions(contextAnalysis: ContextAnalysisResult): string {
        return '**تعليمات الترجمة:**\n' +
            '- احتفظ بالمعنى الأصلي\n' +
            '- راعي السياق الثقافي\n' +
            '- استخدم المصطلحات المناسبة\n' +
            '- تأكد من الطلاقة اللغوية\n';
    }

    private static getImprovementInstructions(contextAnalysis: ContextAnalysisResult, iterationCount?: number): string {
        let instructions = '**تعليمات التحسين:**\n';

        if (iterationCount && iterationCount > 1) {
            instructions += '- راجع المخرجات السابقة\n';
            instructions += '- حدد نقاط الضعف\n';
            instructions += '- طبق التحسينات المطلوبة\n';
        } else {
            instructions += '- حلل المحتوى الحالي\n';
            instructions += '- حدد فرص التحسين\n';
            instructions += '- طبق أفضل الممارسات\n';
        }

        return instructions;
    }

    /**
     * بناء قسم الأمثلة
     */
    private static buildExamplesSection(contextAnalysis: ContextAnalysisResult): string {
        // يمكن إضافة أمثلة محددة حسب نوع المحتوى والمجال
        return '--- أمثلة للإرشاد ---\n' +
            'استخدم الأمثلة المتاحة في السياق كدليل للأسلوب والتنسيق المطلوب.\n';
    }

    /**
     * بناء قسم القيود
     */
    private static buildConstraintsSection(contextAnalysis: ContextAnalysisResult): string {
        let constraints = '--- القيود والمحددات ---\n';

        // قيود حسب مستوى التعقيد
        switch (contextAnalysis.complexityLevel) {
            case 'basic':
                constraints += '- استخدم لغة بسيطة وواضحة\n';
                constraints += '- تجنب المصطلحات المعقدة\n';
                break;
            case 'expert':
                constraints += '- يمكن استخدام المصطلحات المتخصصة\n';
                constraints += '- قدم تحليلات معمقة\n';
                break;
        }

        // قيود حسب الجمهور
        if (contextAnalysis.targetAudience === 'executive') {
            constraints += '- ركز على النتائج والتأثير\n';
            constraints += '- كن موجزاً ومباشراً\n';
        }

        return constraints;
    }

    /**
     * بناء قسم تنسيق المخرجات
     */
    private static buildOutputFormatSection(contextAnalysis: ContextAnalysisResult, taskType: string): string {
        let format = '--- تنسيق المخرجات المطلوب ---\n';

        switch (taskType) {
            case 'generation':
                format += 'قدم المحتوى في تنسيق Markdown منظم مع:\n';
                format += '- عناوين واضحة\n';
                format += '- فقرات منطقية\n';
                format += '- قوائم عند الحاجة\n';
                format += '- تنسيق مناسب للمحتوى\n';
                break;
            case 'analysis':
                format += 'نظم التحليل في أقسام واضحة:\n';
                format += '- ملخص تنفيذي\n';
                format += '- النتائج الرئيسية\n';
                format += '- التوصيات\n';
                format += '- الخلاصة\n';
                break;
        }

        return format;
    }

    /**
     * دمج جميع أجزاء الـ prompt
     */
    static compilePrompt(template: PromptTemplate): string {
        return [
            template.system,
            '',
            template.context,
            '',
            template.instructions,
            '',
            template.examples,
            '',
            template.constraints,
            '',
            template.outputFormat
        ].filter(Boolean).join('\n');
    }
}
