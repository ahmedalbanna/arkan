/**
 * Prompt محسن لتوليد أقسام المقترح باستخدام النظام الذكي
 */

import { defaultModel } from '@/ai/config/models';
import {
    AdaptiveModelSelector,
    ContextAnalyzer,
    IntelligentPromptBuilder
} from '@/ai/core';



import { } from '@/ai/schemas';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
// // Mock function for testing environment
// const createMockPrompt = (config: any) => {
//     return async (input: any) => {
//         // Mock implementation for testing
//         return { output: {} };
//     };
// };

// // Use mock in test environment, real implementation in production
// const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
//     ? { definePrompt: createMockPrompt }
//     : require('@/ai/genkit').ai;

// Schema للمدخلات
export const ProposalSectionPromptInputSchema = z.object({
    type: z.enum([
        'executive_summary', 'problem_statement', 'objectives', 'scope',
        'methodology', 'timeline', 'budget', 'team', 'deliverables',
        'risk_assessment', 'success_criteria', 'conclusion', 'appendices'
    ]),
    projectContext: z.object({
        title: z.string(),
        description: z.string(),
        domain: z.string().optional(),
        industry: z.string().optional(),
        targetAudience: z.string().optional(),
        budget: z.number().optional(),
        duration: z.number().optional(),
        teamSize: z.number().optional(),
        objectives: z.array(z.string()).optional(),
        requirements: z.array(z.string()).optional(),
        constraints: z.array(z.string()).optional(),
        stakeholders: z.array(z.string()).optional(),
        technologies: z.array(z.string()).optional()
    }),
    style: z.object({
        complexity: z.enum(['basic', 'detailed', 'comprehensive']),
        tone: z.enum(['formal', 'professional', 'technical', 'executive']).default('professional'),
        length: z.enum(['brief', 'standard', 'extensive']).default('standard')
    }),
    referenceContent: z.object({
        existingSections: z.record(z.string()).optional(),
        guidelines: z.string().optional(),
        examples: z.array(z.string()).optional()
    }).optional(),
    externalContext: z.array(z.object({
        fileName: z.string(),
        content: z.string(),
        type: z.string()
    })).optional()
});

// Schema للمخرجات
export const ProposalSectionOutputSchema = z.object({
    type: z.string(),
    title: z.string(),
    content: z.string(),
    outline: z.array(z.string()),
    keyPoints: z.array(z.string()),
    wordCount: z.number(),
    estimatedReadingTime: z.number(),
    relatedSections: z.array(z.string()).optional(),
    qualityScore: z.number().optional(),
    suggestions: z.array(z.string()).optional()
});

export type ProposalSectionPromptInput = z.infer<typeof ProposalSectionPromptInputSchema>;
export type ProposalSectionOutput = z.infer<typeof ProposalSectionOutputSchema>;

/**
 * بناء الـ prompt الأساسي لكل نوع قسم
 */
function buildSectionSpecificPrompt(sectionType: ProposalSectionType, complexity: string): string {
    const sectionPrompts = {
        executive_summary: {
            basic: `اكتب ملخص تنفيذي مختصر يغطي:
- نظرة عامة على المشروع (فقرة واحدة)
- الأهداف الرئيسية (3-4 نقاط)
- الفوائد المتوقعة (2-3 نقاط)
- التوصية (جملة واحدة واضحة)`,

            detailed: `اكتب ملخص تنفيذي شامل يتضمن:
- نظرة عامة على المشروع وخلفيته
- تحليل المشكلة أو الفرصة
- الحل المقترح والمنهجية
- الأهداف والنتائج المتوقعة
- التأثير على الأعمال والعائد المتوقع
- متطلبات الموارد والجدول الزمني
- التوصيات والخطوات التالية`,

            comprehensive: `اكتب ملخص تنفيذي متقدم وشامل يشمل:
- خلاصة واضحة للمشروع مع السياق الاستراتيجي
- تحليل معمق للمشكلة والفرص السوقية
- الحل المبتكر والميزة التنافسية
- تحليل مفصل للأهداف والمؤشرات القابلة للقياس
- دراسة العائد على الاستثمار والتأثير المالي
- تحليل المخاطر والاستراتيجيات البديلة
- خارطة طريق التنفيذ والمعالم الرئيسية
- التوصيات الاستراتيجية وقرار الاستثمار`
        },

        problem_statement: {
            basic: `حدد المشكلة بوضوح من خلال:
- وصف المشكلة الحالية
- من يتأثر بهذه المشكلة
- لماذا هذه المشكلة مهمة الآن
- ما هو التأثير إذا لم تُحل`,

            detailed: `اكتب بيان مشكلة مفصل يتضمن:
- تحليل الوضع الحالي والتحديات
- الجذور الأساسية للمشكلة
- تأثير المشكلة على أصحاب المصلحة
- الأدلة والبيانات الداعمة
- الآثار طويلة المدى لعدم المعالجة
- الاستعجال والأولوية`,

            comprehensive: `قم بتحليل شامل ومعمق للمشكلة يشمل:
- دراسة مفصلة للسياق والخلفية التاريخية
- تحليل جذري للأسباب الجوهرية (Root Cause Analysis)
- تقييم تأثيرات متعددة الأبعاد (مالية، تشغيلية، استراتيجية)
- دراسة مقارنة مع المنافسين والسوق
- تحليل أصحاب المصلحة وتأثيراتهم
- نمذجة السيناريوهات المستقبلية
- تحليل الفجوات والفرص الضائعة
- التكلفة الكاملة للمشكلة`
        },

        objectives: {
            basic: `حدد الأهداف الواضحة:
- 3-5 أهداف رئيسية قابلة للقياس
- مؤشرات النجاح لكل هدف
- الإطار الزمني المتوقع`,

            detailed: `اكتب أهداف شاملة باستخدام إطار SMART:
- أهداف استراتيجية طويلة المدى
- أهداف تكتيكية قصيرة المدى
- مؤشرات الأداء الرئيسية (KPIs)
- معايير القياس والتقييم
- الأولويات والتبعيات`,

            comprehensive: `ضع خطة أهداف متطورة ومترابطة:
- أهداف استراتيجية متعددة المستويات
- تحليل OKRs (Objectives and Key Results)
- خارطة تأثير وترابط الأهداف
- نمذجة المخاطر والسيناريوهات البديلة
- آليات المراقبة والتحكم التكيفي
- استراتيجيات التحسين المستمر`
        },

        methodology: {
            basic: `اشرح المنهجية المقترحة:
- النهج العام للمشروع
- المراحل الرئيسية
- الأدوات والتقنيات المستخدمة
- فريق العمل المطلوب`,

            detailed: `اكتب منهجية مفصلة تتضمن:
- إطار العمل المنهجي المختار
- تبرير اختيار المنهجية
- مراحل التنفيذ التفصيلية
- الأدوات والتقنيات والمعايير
- إدارة المخاطر والجودة
- آليات التواصل والتقرير`,

            comprehensive: `صمم منهجية متقدمة ومبتكرة تشمل:
- دراسة مقارنة للمنهجيات المختلفة
- منهجية مخصصة ومتكيفة للمشروع
- نمذجة العمليات والتدفقات
- إطار إدارة التغيير والابتكار
- نظم الذكاء الاصطناعي والأتمتة
- منهجيات البحث والتطوير
- استراتيجيات التحسين المستمر`
        },

        timeline: {
            basic: `ضع جدول زمني واضح:
- المراحل الرئيسية والمدة
- المعالم المهمة
- التبعيات بين المهام
- المخاطر الزمنية`,

            detailed: `اكتب جدول زمني شامل يتضمن:
- تفكيك تفصيلي للمهام (WBS)
- تحليل المسار الحرج
- توزيع الموارد عبر الزمن
- نقاط التحكم والمراجعة
- خطط الطوارئ والمرونة
- التبعيات الداخلية والخارجية`,

            comprehensive: `صمم خطة زمنية متقدمة تشمل:
- نمذجة احتمالية للجداول الزمنية
- تحليل مونت كارلو للمخاطر الزمنية
- خوارزميات التحسين والجدولة
- إدارة الموارد المتعددة والقيود
- نظم الإنذار المبكر والتنبؤ
- استراتيجيات التعافي والتكيف`
        },

        budget: {
            basic: `ضع تقدير للميزانية:
- التكاليف الرئيسية
- تفكيك حسب الفئات
- الهامش للطوارئ
- مصادر التمويل`,

            detailed: `اكتب ميزانية مفصلة تتضمن:
- تحليل التكلفة-الفائدة
- تفكيك تفصيلي للتكاليف
- نمذجة التدفق النقدي
- تحليل الحساسية والمخاطر المالية
- استراتيجيات إدارة التكلفة
- العائد على الاستثمار المتوقع`,

            comprehensive: `صمم نموذج مالي متقدم يشمل:
- نمذجة مالية ديناميكية ومحاكاة
- تحليل القيمة الاقتصادية المضافة
- تحليل التكلفة الكاملة للملكية
- نمذجة المخاطر المالية المتقدمة
- استراتيجيات التمويل والاستثمار
- مؤشرات الأداء المالي المتقدمة`
        }
    };

    return sectionPrompts[sectionType]?.[complexity] || `اكتب قسم ${sectionType} بمستوى تفصيل ${complexity}`;
}

/**
 * Prompt ذكي لتوليد أقسام المقترح
 */
export const generateProposalSectionPrompt = ai.definePrompt(
    {
        name: 'generateProposalSectionPrompt',
        input: { schema: ProposalSectionPromptInputSchema },
        output: { schema: ProposalSectionOutputSchema },
        model: defaultModel || 'googleai/gemini-2.0-flash',
        system: async (input: ProposalSectionPromptInput) => {
            console.log('🧠 بدء تحليل السياق للقسم:', input.type);

            try {
                // 1. تحليل السياق الذكي
                const contextAnalysis = await ContextAnalyzer.analyzeContext({
                    userInput: `${input.projectContext.title}: ${input.projectContext.description}`,
                    externalContext: input.externalContext,
                    guidelines: input.referenceContent?.guidelines ? [input.referenceContent.guidelines] : undefined,
                    projectType: input.projectContext.domain || 'general'
                });

                console.log('✅ تم تحليل السياق:', {
                    contentType: contextAnalysis.contentType,
                    complexity: contextAnalysis.complexityLevel,
                    audience: contextAnalysis.targetAudience
                });

                // 2. اختيار النموذج المناسب
                const modelConfig = AdaptiveModelSelector.selectOptimalModel(
                    contextAnalysis,
                    'generation'
                );

                console.log('🤖 تم اختيار النموذج:', modelConfig.modelId);

                // 3. بناء الـ prompt الذكي
                const promptTemplate = IntelligentPromptBuilder.buildPrompt({
                    taskType: 'generation',
                    domain: 'proposal-sections',
                    contextAnalysis,
                    userInput: `${input.projectContext.title}: ${input.projectContext.description}`,
                    externalContext: input.externalContext
                });

                // 4. بناء الـ prompt المخصص للقسم
                const sectionSpecificPrompt = buildSectionSpecificPrompt(input.type, input.style.complexity);

                return `${promptTemplate.system}

**نوع القسم المطلوب**: ${input.type}
**مستوى التعقيد**: ${input.style.complexity}
**النبرة المطلوبة**: ${input.style.tone}
**الطول المطلوب**: ${input.style.length}

**سياق المشروع**:
- **العنوان**: ${input.projectContext.title}
- **الوصف**: ${input.projectContext.description}
- **المجال**: ${input.projectContext.domain || 'غير محدد'}
- **الصناعة**: ${input.projectContext.industry || 'غير محدد'}
- **الجمهور المستهدف**: ${input.projectContext.targetAudience || 'عام'}
${input.projectContext.budget ? `- **الميزانية**: ${input.projectContext.budget}` : ''}
${input.projectContext.duration ? `- **المدة**: ${input.projectContext.duration} شهر` : ''}
${input.projectContext.teamSize ? `- **حجم الفريق**: ${input.projectContext.teamSize} شخص` : ''}

${input.projectContext.objectives?.length ? `**الأهداف**:
${input.projectContext.objectives.map((obj, i: number) => `${i + 1}. ${obj}`).join('\n')}
` : ''}

${input.projectContext.requirements?.length ? `**المتطلبات**:
${input.projectContext.requirements.map((req, i: number) => `${i + 1}. ${req}`).join('\n')}
` : ''}

${input.projectContext.constraints?.length ? `**القيود**:
${input.projectContext.constraints.map((con, i: number) => `${i + 1}. ${con}`).join('\n')}
` : ''}

${input.projectContext.stakeholders?.length ? `**أصحاب المصلحة**:
${input.projectContext.stakeholders.join(', ')}
` : ''}

${input.projectContext.technologies?.length ? `**التقنيات**:
${input.projectContext.technologies.join(', ')}
` : ''}

${promptTemplate.context}

**التعليمات المحددة للقسم**:
${sectionSpecificPrompt}

**الإرشادات الإضافية**:
${promptTemplate.instructions}

${input.referenceContent?.guidelines ? `**إرشادات إضافية**:
${input.referenceContent.guidelines}
` : ''}

${input.referenceContent?.existingSections ? `**الأقسام الموجودة للرجوع إليها**:
${Object.entries(input.referenceContent.existingSections).map(([key, value]: [string, string]) => `**${key}**: ${value.substring(0, 200)}...`).join('\n\n')}
` : ''}

**تنسيق المخرجات**:
يجب أن تكون استجابتك عبارة عن كائن JSON صالح يحتوي على:
- type: نوع القسم
- title: عنوان القسم باللغة العربية
- content: المحتوى الكامل للقسم بتنسيق Markdown
- outline: مخطط القسم (array of strings)
- keyPoints: النقاط الرئيسية (array of strings)
- wordCount: عدد الكلمات
- estimatedReadingTime: وقت القراءة المتوقع بالدقائق
- relatedSections: الأقسام ذات الصلة (اختياري)
- suggestions: اقتراحات للتحسين (اختياري)

**القيود والمحددات**:
${promptTemplate.constraints}

تأكد من أن المحتوى:
1. مكتوب باللغة العربية الفصحى
2. متسق مع باقي أقسام المقترح
3. يتبع أفضل الممارسات في كتابة المقترحات
4. مناسب للجمهور المستهدف
5. يحتوي على تفاصيل كافية حسب مستوى التعقيد المطلوب`;

            } catch (error) {
                console.error('❌ خطأ في تحليل السياق:', error);

                // Fallback إلى prompt بسيط
                const sectionSpecificPrompt = buildSectionSpecificPrompt(input.type, input.style.complexity);

                return `أنت خبير في كتابة المقترحات المهنية. مهمتك هي كتابة قسم "${input.type}" لمقترح مشروع.

**سياق المشروع**:
العنوان: ${input.projectContext.title}
الوصف: ${input.projectContext.description}

**التعليمات**:
${sectionSpecificPrompt}

**تنسيق المخرجات**:
يجب أن تكون استجابتك عبارة عن كائن JSON صالح يحتوي على جميع الحقول المطلوبة.

تأكد من أن المحتوى مكتوب باللغة العربية ومناسب لمقترح مهني.`;
            }
        },
        prompt: `قم بتوليد قسم المقترح المطلوب بناءً على السياق والتعليمات المقدمة.`
    }
);

/**
 * دالة مساعدة لحساب وقت القراءة المتوقع
 */
export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200; // متوسط سرعة القراءة بالعربية
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * دالة مساعدة لاستخراج مخطط القسم
 */
export function extractOutline(content: string): string[] {
    const lines = content.split('\n');
    const outline: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) {
            // إزالة رموز الـ Markdown والحصول على العنوان فقط
            const title = trimmed.replace(/^#+\s*/, '');
            outline.push(title);
        }
    }

    return outline;
}

/**
 * دالة مساعدة لاستخراج النقاط الرئيسية
 */
export function extractKeyPoints(content: string): string[] {
    const lines = content.split('\n');
    const keyPoints: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
            // إزالة رموز القوائم والحصول على النص فقط
            const point = trimmed.replace(/^(\-|\*|\d+\.)\s*/, '');
            if (point.length > 10) { // تجنب النقاط القصيرة جداً
                keyPoints.push(point);
            }
        }
    }

    return keyPoints.slice(0, 10); // أقصى 10 نقاط رئيسية
}
