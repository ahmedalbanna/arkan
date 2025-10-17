/**
 * Prompt محسن لتوليد أقسام المقترح باستخدام النظام الذكي
 */

import { defaultModel } from '@/ai/config/models';
import {
    AdaptiveModelSelector,
    ContextAnalyzer,
    IntelligentPromptBuilder
} from '@/ai/core';
import { ProposalSectionType } from '@/ai/schemas/enums';
import { z } from 'zod';

// Mock function for testing environment
const createMockPrompt = (config: any) => {
    return async (input: any) => {
        // Mock implementation for testing
        return { output: {} };
    };
};

// Use mock in test environment, real implementation in production
const ai = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'
    ? { definePrompt: createMockPrompt }
    : require('@/ai/genkit').ai;

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
    const sectionPrompts: Record<ProposalSectionType, Record<string, string>> = {
        executive_summary: {
            basic: `اكتب ملخص تنفيذي مختصر يغطي:
- نظرة عامة على المشروع (فقرة واحدة)
- الأهداف الرئيسية (3-4 نقاط)
- الفوائد المتوقعة (2-3 نقاط)
- التوصية (جملة واحدة واضحة)`,
            detailed: `اكتب ملخص تنفيذي مفصل يتضمن:
- نظرة عامة على المشروع وخلفيته
- تحليل المشكلة أو الفرصة
- الحل المقترح والمنهجية
- الأهداف والنتائج المتوقعة
- التأثير على الأعمال والعائد المتوقع
- متطلبات الموارد والجدول الزمني
- التوصيات والخطوات التالية`,
            comprehensive: `صمم ملخص تنفيذي شامل ومتكامل يتضمن:
- تحليل استراتيجي للوضع الحالي والفرص
- رؤية شاملة للمشروع وأهدافه الاستراتيجية
- تحليل القيمة المضافة والتأثير طويل المدى
- نمذجة العائد على الاستثمار والمخاطر
- خارطة طريق التنفيذ والمعالم الرئيسية
- استراتيجية إدارة التغيير والابتكار`
        },
        problem_statement: {
            basic: `صف المشكلة الحالية بوضوح:
- وصف المشكلة الحالية
- الأسباب الجذرية للمشكلة
- تأثير المشكلة على أصحاب المصلحة
- الأدلة والبيانات الداعمة`,
            detailed: `اكتب بيان مشكلة مفصل يتضمن:
- تحليل الوضع الحالي والتحديات
- الجذور الأساسية للمشكلة
- تأثير المشكلة على أصحاب المصلحة
- الأدلة والبيانات الداعمة
- الآثار طويلة المدى لعدم المعالجة
- الاستعجال والأولوية`,
            comprehensive: `صمم بيان مشكلة متقدم ومتكامل يتضمن:
- تحليل نظمي شامل للوضع الحالي
- نمذجة الأسباب الجذرية متعددة المستويات
- تحليل تأثير المشكلة على النظام البيئي الكامل
- دراسة مقارنة مع الحالات المشابهة
- تحليل التكلفة الاقتصادية والاجتماعية
- نمذجة السيناريوهات المستقبلية`
        },
        objectives: {
            basic: `صف الأهداف الواضحة والقابلة للقياس:
- الأهداف الرئيسية للمشروع
- مؤشرات النجاح لكل هدف
- الإطار الزمني المتوقع`,
            detailed: `اكتب أهداف مفصلة تتضمن:
- الأهداف الاستراتيجية والتشغيلية
- مؤشرات الأداء الرئيسية (KPIs)
- الأولويات والتبعيات
- خطة القياس والمتابعة`,
            comprehensive: `صمم إطار أهداف متقدم يشمل:
- هيكل أهداف متدرج (استراتيجي، تكتيكي، تشغيلي)
- نظام مؤشرات أداء متكامل ومتوازن
- نمذجة العلاقات والتبعيات بين الأهداف
- آليات المراجعة والتحسين المستمر
- استراتيجيات إدارة المخاطر للأهداف`
        },
        scope: {
            basic: `حدد نطاق المشروع بوضوح:
- ما يشمله المشروع
- ما لا يشمله المشروع
- الحدود والقيود
- المخرجات الرئيسية`,
            detailed: `اكتب نطاق مفصل يشمل:
- تعريف شامل لحدود المشروع
- تحليل المتطلبات الوظيفية وغير الوظيفية
- تحديد الاستثناءات والقيود
- خريطة أصحاب المصلحة والأدوار
- معايير القبول والجودة`,
            comprehensive: `صمم إطار نطاق متكامل يتضمن:
- نمذجة نطاق متعددة الأبعاد والمستويات
- تحليل شامل للمتطلبات والتبعيات
- إطار إدارة التغيير في النطاق
- نظام تتبع وضبط النطاق
- استراتيجيات التوسع والتكيف المستقبلي`
        },
        methodology: {
            basic: `صف المنهجية المقترحة:
- المنهج العام للتنفيذ
- المراحل الرئيسية
- الأدوات والتقنيات المستخدمة
- عمليات المراجعة والتحكم`,
            detailed: `اكتب منهجية مفصلة تتضمن:
- إطار منهجي متكامل للتنفيذ
- تفصيل المراحل والأنشطة
- أدوات وتقنيات التنفيذ المتقدمة
- عمليات ضمان الجودة والمراجعة
- آليات إدارة المخاطر والتغيير`,
            comprehensive: `صمم منهجية متقدمة ومتكاملة تتضمن:
- إطار منهجي هجين ومتكيف
- نمذجة العمليات والتدفقات المعقدة
- تكامل منهجيات الذكاء الاصطناعي والأتمتة
- نظام إدارة المعرفة والتعلم المستمر
- استراتيجيات الابتكار والتحسين المستمر
- إطار التكيف مع التغييرات والمستجدات`
        },
        timeline: {
            basic: `ضع جدول زمني واضح:
- المراحل الرئيسية والمدة
- المعالم المهمة
- التبعيات بين المهام
- المخاطر الزمنية`,
            detailed: `اكتب جدول زمني مفصل يتضمن:
- تفكيك تفصيلي للمهام والأنشطة
- تحليل المسار الحرج
- توزيع الموارد عبر الزمن
- نقاط التحكم والمراجعة
- خطط الطوارئ الزمنية`,
            comprehensive: `صمم جدول زمني متقدم ومتكامل يتضمن:
- نمذجة زمنية ديناميكية ومرنة
- تحليل متقدم للمسارات الحرجة والبديلة
- تحسين توزيع الموارد والأولويات
- نظام مراقبة وتحكم زمني ذكي
- استراتيجيات التسريع والتأخير المحسوبة
- تكامل مع أنظمة إدارة المشاريع المتقدمة`
        },
        budget: {
            basic: `ضع تقدير للميزانية:
- التكاليف الرئيسية
- تفكيك حسب الفئات
- الهامش للطوارئ
- مصادر التمويل`,
            detailed: `اكتب ميزانية مفصلة تتضمن:
- تحليل التكلفة-الفائدة التفصيلي
- تفكيك شامل للتكاليف المباشرة وغير المباشرة
- نمذجة التدفق النقدي
- تحليل الحساسية والمخاطر المالية
- استراتيجيات إدارة التكلفة والتحكم`,
            comprehensive: `صمم نموذج مالي متقدم يشمل:
- نمذجة مالية ديناميكية ومحاكاة متعددة السيناريوهات
- تحليل القيمة الاقتصادية المضافة والعائد الشامل
- نمذجة المخاطر المالية المتقدمة وإدارتها
- استراتيجيات التمويل والاستثمار المبتكرة
- نظام مراقبة مالية ذكي ومؤشرات أداء متقدمة
- تحليل التأثير الاقتصادي والاجتماعي الشامل`
        },
        team: {
            basic: `صف الفريق المطلوب:
- المهارات والخبرات المطلوبة
- الأدوار والمسؤوليات
- هيكل الفريق
- خطة التطوير والتدريب`,
            detailed: `اكتب خطة فريق مفصلة تشمل:
- تحليل شامل للمهارات والكفاءات المطلوبة
- هيكل تنظيمي متكامل وواضح الأدوار
- استراتيجيات التوظيف واختيار الأعضاء
- برامج التطوير والتدريب المتخصصة
- آليات التحفيز وإدارة الأداء`,
            comprehensive: `صمم استراتيجية فريق متقدمة تتضمن:
- نمذجة الكفاءات والمهارات المستقبلية
- هيكل فرق متعددة التخصصات ومرنة
- استراتيجيات إدارة المواهب والاحتفاظ بها
- نظم التعلم المستمر والتطوير المهني
- ثقافة الابتكار والتعاون الفعال
- تكامل التقنيات الحديثة في إدارة الفرق`
        },
        deliverables: {
            basic: `حدد المخرجات المطلوبة:
- المنتجات والخدمات الرئيسية
- معايير الجودة والقبول
- جدول التسليم
- آليات التسليم والتحقق`,
            detailed: `اكتب خطة مخرجات مفصلة تشمل:
- تعريف شامل لجميع المخرجات والمنتجات
- مواصفات الجودة ومعايير القبول التفصيلية
- خطة التسليم المرحلية والمتكاملة
- عمليات المراجعة والتحقق من الجودة
- آليات التحديث والصيانة`,
            comprehensive: `صمم إطار مخرجات متقدم يتضمن:
- نظام إدارة دورة حياة المنتجات الشاملة
- معايير جودة متقدمة ونظم ضمان الجودة
- استراتيجيات التسليم المرنة والمتكيفة
- نظم المراقبة والتحسين المستمر للمخرجات
- تكامل التقنيات الذكية في إدارة المخرجات
- استراتيجيات القيمة المضافة والابتكار`
        },
        risk_assessment: {
            basic: `حدد المخاطر المحتملة:
- المخاطر الرئيسية المتوقعة
- تقييم الاحتمالية والتأثير
- استراتيجيات التخفيف
- خطط الطوارئ`,
            detailed: `اكتب تقييم مخاطر مفصل يشمل:
- تحليل شامل للمخاطر الداخلية والخارجية
- نمذجة المخاطر وتقييم الاحتمالية والتأثير
- استراتيجيات إدارة المخاطر المتعددة
- خطط الاستجابة والطوارئ التفصيلية
- نظام مراقبة المخاطر المستمر`,
            comprehensive: `صمم إطار إدارة مخاطر متقدم يتضمن:
- نمذجة مخاطر متعددة الأبعاد والسيناريوهات
- تحليل المخاطر الناشئة والمستقبلية
- استراتيجيات إدارة مخاطر ديناميكية ومتكيفة
- نظم الإنذار المبكر والاستجابة الذكية
- تكامل تقنيات الذكاء الاصطناعي في إدارة المخاطر
- إطار التعلم من المخاطر والتحسين المستمر`
        },
        success_criteria: {
            basic: `حدد معايير النجاح:
- المؤشرات الكمية والنوعية
- معايير القياس والتقييم
- الأهداف المرحلية
- آليات المراجعة والتقييم`,
            detailed: `اكتب معايير نجاح مفصلة تشمل:
- نظام مؤشرات أداء متكامل ومتوازن
- معايير قياس متعددة الأبعاد والمستويات
- خطة المراجعة والتقييم المرحلية
- آليات التحسين المستمر والتكيف
- نظام التغذية الراجعة والتعلم`,
            comprehensive: `صمم إطار نجاح متقدم ومتكامل يتضمن:
- نظام قياس أداء ذكي ومتعدد الأبعاد
- معايير نجاح ديناميكية ومتكيفة مع التغيير
- تكامل مؤشرات الأداء قصيرة وطويلة المدى
- نظم التحليل التنبؤي لمؤشرات النجاح
- استراتيجيات التحسين المستمر والابتكار
- إطار التعلم التنظيمي وإدارة المعرفة`
        },
        conclusion: {
            basic: `اكتب خلاصة شاملة:
- ملخص الأهداف والفوائد
- التوصيات الرئيسية
- الخطوات التالية
- دعوة للعمل`,
            detailed: `اكتب خاتمة مفصلة تتضمن:
- تلخيص شامل لقيمة المشروع وفوائده
- التوصيات الاستراتيجية والتكتيكية
- خارطة طريق التنفيذ والمتابعة
- تحليل التأثير المتوقع والعائد
- دعوة واضحة للعمل والموافقة`,
            comprehensive: `صمم خاتمة استراتيجية متكاملة تشمل:
- رؤية شاملة للقيمة الاستراتيجية والتحويلية
- تحليل التأثير طويل المدى والاستدامة
- استراتيجية التنفيذ والتطوير المستقبلي
- إطار الشراكة والتعاون الاستراتيجي
- رؤية الابتكار والتطوير المستمر
- دعوة للاستثمار في المستقبل`
        },
        appendices: {
            basic: `أضف الملاحق الضرورية:
- الوثائق المرجعية
- البيانات التفصيلية
- الرسوم البيانية والجداول
- المراجع والمصادر`,
            detailed: `اكتب ملاحق مفصلة تشمل:
- دراسات الحالة والأمثلة التطبيقية
- التحليلات الفنية والبيانات التفصيلية
- الرسوم البيانية والمخططات التوضيحية
- قائمة شاملة بالمراجع والمصادر
- نماذج وقوالب العمل المقترحة`,
            comprehensive: `صمم ملاحق متقدمة ومتكاملة تتضمن:
- مكتبة شاملة من دراسات الحالة والممارسات الأفضل
- نماذج تحليلية متقدمة وأدوات القياس
- مخططات تفاعلية ونماذج ثلاثية الأبعاد
- قاعدة معرفة متكاملة ومراجع متخصصة
- أدوات وقوالب رقمية للتنفيذ والمتابعة
- منصة تفاعلية للتعلم والتطوير المستمر`
        }
    };

    return sectionPrompts[sectionType]?.[complexity] || sectionPrompts[sectionType]?.basic || '';
}

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
