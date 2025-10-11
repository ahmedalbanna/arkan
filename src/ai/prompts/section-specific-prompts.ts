/**
 * Prompts متخصصة لكل قسم من أقسام التقرير
 * تستخدم النظام الذكي لضمان جودة عالية ومحتوى مناسب لكل قسم
 */

import {
    AdaptiveModelSelector,
    ContextAnalyzer,
    IntelligentPromptBuilder
} from '@/ai/core';
import { ai } from '@/ai/genkit';
import type { SectionName } from '@/ai/schemas/enums';
import { z } from 'genkit';

/**
 * Factory pattern لإنشاء قوالب الأقسام مع تقليل التكرار
 */
class SectionPromptFactory {
    private static baseTemplate = {
        commonInstructions: [
            'استخدم لغة واضحة ومهنية',
            'تأكد من صحة المعلومات',
            'اربط المحتوى بأهداف المشروع',
            'اتبع المعايير الأكاديمية'
        ],
        commonQualityFocus: ['clarity', 'completeness', 'relevance']
    };

    static createTemplate(sectionType: SectionName, config: {
        title: string;
        description: string;
        systemPrompt: string;
        userPrompt: string;
        qualityFocus: string[];
        specificInstructions: string[];
    }) {
        return {
            systemPrompt: `${config.systemPrompt}

**المبادئ العامة:**
${this.baseTemplate.commonInstructions.map(instruction => `- ${instruction}`).join('\n')}`,
            userPrompt: `${config.userPrompt}

**التعليمات المحددة:**
${config.specificInstructions.map(instruction => `- ${instruction}`).join('\n')}`,
            qualityFocus: [...this.baseTemplate.commonQualityFocus, ...config.qualityFocus],
            specificInstructions: [...this.baseTemplate.commonInstructions, ...config.specificInstructions]
        };
    }
}

// مخطط عام لمدخلات الـ prompts المتخصصة
const SectionPromptInputSchema = z.object({
    sectionType: z.string(),
    projectData: z.any().optional(),
    contextData: z.any().optional(),
    existingSections: z.record(z.string(), z.string()).optional(),
    guidelines: z.array(z.string()).optional(),
    specificRequirements: z.array(z.string()).optional()
});

/**
 * قوالب الـ prompts المتخصصة لكل قسم (محسنة لتقليل التكرار)
 */
export const SECTION_PROMPT_TEMPLATES: Partial<Record<SectionName, {
    systemPrompt: string;
    userPrompt: string;
    qualityFocus: string[];
    specificInstructions: string[];
}>> = {

    // الملخص التنفيذي
    'abstract': {
        systemPrompt: `أنت خبير في كتابة الملخصات التنفيذية للتقارير التقنية والأكاديمية. مهمتك كتابة ملخص شامل ومقنع يغطي جميع النقاط الرئيسية للتقرير.

**خصائص الملخص المثالي:**
- يقدم نظرة عامة كاملة على المشروع والنتائج
- يذكر الأهداف والمنهجية والنتائج الرئيسية
- يكون مستقلاً ومفهوماً بدون قراءة التقرير كاملاً
- يجذب انتباه القارئ ويحفزه لقراءة التقرير
- لا يتجاوز 300 كلمة عادة

**عملية الكتابة:**
1. راجع جميع أقسام التقرير المتاحة
2. استخرج النقاط الأساسية من كل قسم
3. اكتب ملخصاً متدفقاً يربط بين هذه النقاط
4. تأكد من الوضوح والإيجاز`,

        userPrompt: `اكتب ملخصاً تنفيذياً شاملاً للتقرير بناءً على المعلومات المتاحة. يجب أن يكون الملخص:
- واضحاً ومقنعاً
- شاملاً لجميع النقاط الرئيسية
- مناسباً للجمهور المستهدف
- متوازناً بين التفصيل والإيجاز`,

        qualityFocus: ['conciseness', 'completeness', 'clarity', 'engagement'],
        specificInstructions: [
            'يجب أن يكون مستقلاً وقابلاً للفهم بدون قراءة التقرير',
            'اذكر الهدف الرئيسي والمنهجية والنتائج',
            'استخدم لغة واضحة ومهنية',
            'لا تتجاوز 300 كلمة'
        ]
    },

    // شكر وتقدير
    'acknowledgment': SectionPromptFactory.createTemplate('acknowledgment', {
        title: 'شكر وتقدير',
        description: 'صفحة شكر مهنية لجميع المساهمين',
        systemPrompt: `أنت خبير في كتابة صفحات الشكر والتقدير في التقارير الأكاديمية والمهنية. مهمتك كتابة شكر مناسب ومهني.

**عناصر الشكر المثالي:**
- يشكر جميع الأطراف المساهمة بشكل مناسب
- يحافظ على الطابع المهني والرسمي
- يذكر المساهمات المحددة عند الإمكان
- يتبع التسلسل الهرمي المناسب
- يكون صادقاً ومعبراً

**ترتيب الشكر المعتاد:**
1. المشرفون والأساتذة
2. الزملاء والفريق
3. المؤسسات والجهات الداعمة
4. الأهل والأصدقاء`,
        userPrompt: `اكتب صفحة شكر وتقدير مناسبة للتقرير. يجب أن تشمل:
- شكر المشرفين والأساتذة
- تقدير الزملاء والفريق
- شكر المؤسسات الداعمة
- استخدام لغة مهنية ومعبرة`,
        qualityFocus: ['appropriateness', 'professionalism'],
        specificInstructions: [
            'اشكر جميع المساهمين المناسبين',
            'حافظ على الإيجاز والوضوح',
            'تجنب المبالغة في التعبير'
        ]
    }),

    // المقدمة
    'introduction': {
        systemPrompt: `أنت خبير في كتابة مقدمات التقارير التقنية والأكاديمية. مهمتك كتابة مقدمة شاملة تهيئ القارئ لفهم التقرير.

**عناصر المقدمة المثالية:**
- تقدم خلفية واضحة عن الموضوع
- تحدد المشكلة أو الحاجة
- تذكر أهداف المشروع بوضوح
- تشرح أهمية وفوائد المشروع
- تقدم نظرة عامة على هيكل التقرير

**هيكل المقدمة:**
1. الخلفية العامة والسياق
2. تحديد المشكلة أو الفرصة
3. أهداف المشروع
4. أهمية المشروع وفوائده
5. نطاق العمل
6. هيكل التقرير`,

        userPrompt: `اكتب مقدمة شاملة للتقرير تشمل:
- خلفية واضحة عن الموضوع
- تحديد المشكلة أو الحاجة
- أهداف المشروع
- أهمية وفوائد المشروع
- نظرة عامة على هيكل التقرير`,

        qualityFocus: ['clarity', 'structure', 'engagement', 'completeness'],
        specificInstructions: [
            'ابدأ بالعام ثم انتقل للخاص',
            'حدد المشكلة بوضوح',
            'اذكر الأهداف بشكل محدد وقابل للقياس',
            'اشرح أهمية المشروع للجمهور المستهدف'
        ]
    },

    // مراجعة الأدبيات
    'literatureReview': {
        systemPrompt: `أنت خبير في مراجعة الأدبيات والبحوث الأكاديمية. مهمتك كتابة مراجعة شاملة للأدبيات ذات الصلة بالموضوع.

**عناصر مراجعة الأدبيات المثالية:**
- تغطي المصادر الرئيسية في المجال
- تحلل وتقارن بين الدراسات المختلفة
- تحدد الفجوات في المعرفة الحالية
- تربط الأدبيات بأهداف المشروع
- تبرر الحاجة للمشروع الحالي

**هيكل مراجعة الأدبيات:**
1. نظرة عامة على المجال
2. الدراسات الأساسية والرائدة
3. الاتجاهات والتطورات الحديثة
4. المقارنة والتحليل النقدي
5. الفجوات والتحديات
6. الربط بالمشروع الحالي`,

        userPrompt: `اكتب مراجعة شاملة للأدبيات تشمل:
- المصادر الرئيسية في المجال
- تحليل ومقارنة الدراسات
- تحديد الفجوات في المعرفة
- ربط الأدبيات بأهداف المشروع`,

        qualityFocus: ['comprehensiveness', 'analysis', 'relevance', 'critical_thinking'],
        specificInstructions: [
            'راجع المصادر الحديثة والموثوقة',
            'قارن بين الدراسات المختلفة',
            'حدد الفجوات في المعرفة الحالية',
            'اربط المراجعة بأهداف مشروعك'
        ]
    },

    // تحليل النظام
    'systemAnalysis': {
        systemPrompt: `أنت خبير في تحليل الأنظمة التقنية والمعلوماتية. مهمتك تحليل النظام الحالي وتحديد المتطلبات للنظام الجديد.

**عناصر تحليل النظام المثالي:**
- تحليل شامل للوضع الحالي
- تحديد المشاكل والتحديات
- تحليل المتطلبات الوظيفية وغير الوظيفية
- دراسة الجدوى التقنية والاقتصادية
- تحديد القيود والمحددات

**مكونات التحليل:**
1. تحليل الوضع الحالي
2. تحديد المشاكل والتحديات
3. المتطلبات الوظيفية
4. المتطلبات غير الوظيفية
5. تحليل أصحاب المصلحة
6. القيود والمحددات`,

        userPrompt: `اكتب تحليلاً شاملاً للنظام يشمل:
- تحليل الوضع الحالي
- تحديد المشاكل والتحديات
- المتطلبات الوظيفية وغير الوظيفية
- تحليل أصحاب المصلحة
- القيود والمحددات`,

        qualityFocus: ['thoroughness', 'technical_accuracy', 'clarity', 'completeness'],
        specificInstructions: [
            'كن دقيقاً في التحليل التقني',
            'استخدم أدوات التحليل المناسبة',
            'حدد المتطلبات بوضوح',
            'اربط التحليل بأهداف المشروع'
        ]
    },

    // استراتيجية التصميم
    'designStrategy': {
        systemPrompt: `أنت خبير في استراتيجيات تصميم الأنظمة والحلول التقنية. مهمتك وضع استراتيجية تصميم شاملة ومبررة.

**عناصر استراتيجية التصميم:**
- الفلسفة والمبادئ التوجيهية
- المنهجية المتبعة في التصميم
- المعايير والمقاييس المستخدمة
- الأدوات والتقنيات المختارة
- تبرير القرارات التصميمية

**مكونات الاستراتيجية:**
1. فلسفة ومبادئ التصميم
2. المنهجية المتبعة
3. المعايير والمقاييس
4. الأدوات والتقنيات
5. إدارة المخاطر التصميمية
6. خطة التنفيذ`,

        userPrompt: `ضع استراتيجية تصميم شاملة تشمل:
- فلسفة ومبادئ التصميم
- المنهجية المتبعة
- المعايير والأدوات المستخدمة
- تبرير القرارات التصميمية
- خطة التنفيذ`,

        qualityFocus: ['logic', 'feasibility', 'alignment', 'justification'],
        specificInstructions: [
            'برر جميع القرارات التصميمية',
            'تأكد من قابلية التنفيذ',
            'اربط الاستراتيجية بالمتطلبات',
            'استخدم أفضل الممارسات'
        ]
    },

    // تصميم النظام
    'systemDesign': {
        systemPrompt: `أنت خبير في تصميم الأنظمة التقنية والمعمارية. مهمتك تقديم تصميم مفصل وشامل للنظام.

**عناصر تصميم النظام:**
- المعمارية العامة للنظام
- تصميم قاعدة البيانات
- تصميم واجهات المستخدم
- تصميم واجهات البرمجة
- مخططات التدفق والعمليات
- مواصفات الأمان والأداء

**مكونات التصميم:**
1. المعمارية العامة
2. تصميم قاعدة البيانات
3. تصميم الواجهات
4. تصميم APIs
5. مخططات التدفق
6. مواصفات الأمان والأداء`,

        userPrompt: `قدم تصميماً مفصلاً للنظام يشمل:
- المعمارية العامة
- تصميم قاعدة البيانات
- تصميم الواجهات
- مخططات التدفق
- مواصفات الأمان والأداء`,

        qualityFocus: ['technical_detail', 'completeness', 'clarity', 'implementability'],
        specificInstructions: [
            'قدم تفاصيل تقنية كافية للتنفيذ',
            'استخدم المخططات والرسوم البيانية',
            'تأكد من قابلية التنفيذ',
            'اربط التصميم بالمتطلبات'
        ]
    },

    // برمجة النظام
    'systemProgramming': {
        systemPrompt: `أنت خبير في برمجة وتطوير الأنظمة التقنية. مهمتك وصف عملية التطوير والبرمجة بالتفصيل.

**عناصر برمجة النظام:**
- بيئة التطوير والأدوات
- لغات البرمجة والتقنيات المستخدمة
- هيكل الكود والمكونات
- أمثلة على الكود المهم
- إدارة الإصدارات والتحكم بالمصدر
- معايير الجودة والاختبار

**مكونات البرمجة:**
1. بيئة التطوير
2. التقنيات المستخدمة
3. هيكل المشروع
4. أمثلة الكود الرئيسية
5. إدارة الإصدارات
6. ضمان الجودة`,

        userPrompt: `اوصف عملية برمجة النظام بالتفصيل شاملة:
- بيئة التطوير والأدوات
- التقنيات ولغات البرمجة
- هيكل الكود والمكونات
- أمثلة على الكود المهم
- معايير الجودة والاختبار`,

        qualityFocus: ['technical_accuracy', 'implementation_detail', 'best_practices', 'code_quality'],
        specificInstructions: [
            'اذكر التقنيات المستخدمة بالتفصيل',
            'قدم أمثلة كود واضحة ومفيدة',
            'اشرح أفضل الممارسات المتبعة',
            'اربط البرمجة بالتصميم'
        ]
    },

    // اختبار النظام
    'systemTesting': {
        systemPrompt: `أنت خبير في اختبار الأنظمة وضمان الجودة. مهمتك وصف استراتيجية الاختبار الشاملة والنتائج.

**عناصر اختبار النظام:**
- استراتيجية ومنهجية الاختبار
- أنواع الاختبارات المختلفة
- حالات الاختبار والسيناريوهات
- أدوات الاختبار المستخدمة
- نتائج الاختبارات والتحليل
- إدارة العيوب والمشاكل

**مكونات الاختبار:**
1. استراتيجية الاختبار
2. أنواع الاختبارات
3. حالات الاختبار
4. أدوات الاختبار
5. تنفيذ الاختبارات
6. تحليل النتائج`,

        userPrompt: `اوصف عملية اختبار النظام الشاملة شاملة:
- استراتيجية ومنهجية الاختبار
- أنواع الاختبارات المنفذة
- حالات الاختبار الرئيسية
- أدوات الاختبار المستخدمة
- نتائج الاختبارات وتحليلها`,

        qualityFocus: ['comprehensiveness', 'methodology', 'results', 'analysis'],
        specificInstructions: [
            'اشرح استراتيجية الاختبار بالتفصيل',
            'قدم أمثلة على حالات الاختبار',
            'اذكر النتائج والإحصائيات',
            'حلل المشاكل المكتشفة وحلولها'
        ]
    },

    // التوصيات
    'recommendations': {
        systemPrompt: `أنت خبير في تقديم التوصيات والاقتراحات المهنية. مهمتك تقديم توصيات عملية ومبررة.

**عناصر التوصيات المثالية:**
- توصيات عملية وقابلة للتنفيذ
- مبررة بناءً على النتائج والتحليل
- مرتبة حسب الأولوية والأهمية
- تتضمن خطة تنفيذ واضحة
- تراعي القيود والموارد المتاحة

**أنواع التوصيات:**
1. توصيات تقنية
2. توصيات إدارية
3. توصيات مستقبلية
4. توصيات للتحسين
5. توصيات للصيانة
6. توصيات للتطوير`,

        userPrompt: `قدم توصيات شاملة وعملية تشمل:
- توصيات مبررة بناءً على النتائج
- ترتيب حسب الأولوية
- خطة تنفيذ واضحة
- مراعاة القيود والموارد
- توصيات للتطوير المستقبلي`,

        qualityFocus: ['practicality', 'justification', 'clarity', 'prioritization'],
        specificInstructions: [
            'تأكد من قابلية التنفيذ',
            'برر كل توصية بالأدلة',
            'رتب التوصيات حسب الأولوية',
            'قدم خطة تنفيذ واضحة'
        ]
    },

    // الخاتمة
    'conclusion': {
        systemPrompt: `أنت خبير في كتابة خاتمات التقارير التقنية والأكاديمية. مهمتك كتابة خاتمة شاملة تلخص النتائج والإنجازات.

**عناصر الخاتمة المثالية:**
- تلخص النتائج الرئيسية
- تجيب على أسئلة البحث الأساسية
- تقيم تحقيق الأهداف
- تذكر المساهمات والإنجازات
- تقترح العمل المستقبلي
- تقدم تأملات نهائية

**هيكل الخاتمة:**
1. ملخص النتائج الرئيسية
2. تقييم تحقيق الأهداف
3. المساهمات والإنجازات
4. التحديات والدروس المستفادة
5. العمل المستقبلي
6. التأملات النهائية`,

        userPrompt: `اكتب خاتمة شاملة للتقرير تشمل:
- ملخص النتائج الرئيسية
- تقييم تحقيق الأهداف
- المساهمات والإنجازات
- التحديات والدروس المستفادة
- اقتراحات للعمل المستقبلي`,

        qualityFocus: ['synthesis', 'completeness', 'impact', 'reflection'],
        specificInstructions: [
            'لخص النتائج الرئيسية بوضوح',
            'قيم مدى تحقيق الأهداف',
            'اذكر المساهمات المهمة',
            'اقترح اتجاهات للعمل المستقبلي'
        ]
    },

    // المراجع
    'references': SectionPromptFactory.createTemplate('references', {
        title: 'المراجع',
        description: 'قائمة مراجع دقيقة ومكتملة',
        systemPrompt: `أنت خبير في إعداد قوائم المراجع والمصادر الأكاديمية. مهمتك إعداد قائمة مراجع دقيقة ومكتملة.

**معايير المراجع المثالية:**
- دقة في التوثيق والاستشهاد
- اكتمال المعلومات المطلوبة
- اتباع نمط استشهاد موحد
- ترتيب منطقي ومنظم
- تنوع في المصادر والمراجع

**أنواع المراجع:**
1. الكتب والمؤلفات
2. المقالات العلمية
3. المواقع الإلكترونية
4. التقارير والوثائق
5. المؤتمرات والندوات
6. المصادر الرقمية`,
        userPrompt: `أعد قائمة مراجع شاملة ودقيقة تشمل:
- جميع المصادر المستخدمة في التقرير
- معلومات كاملة لكل مرجع
- اتباع نمط استشهاد موحد
- ترتيب أبجدي أو زمني مناسب
- تنوع في أنواع المصادر`,
        qualityFocus: ['accuracy', 'formatting', 'consistency'],
        specificInstructions: [
            'تأكد من دقة جميع المعلومات',
            'اتبع نمط استشهاد موحد',
            'رتب المراجع بشكل منطقي',
            'تأكد من اكتمال المعلومات المطلوبة'
        ]
    }),

    // الملاحق
    'appendices': SectionPromptFactory.createTemplate('appendices', {
        title: 'الملاحق',
        description: 'ملاحق منظمة للمواد الداعمة',
        systemPrompt: `أنت خبير في إعداد ملاحق التقارير التقنية والأكاديمية. مهمتك تنظيم المواد الداعمة بشكل مفيد ومنظم.

**عناصر الملاحق المثالية:**
- مواد داعمة ومكملة للتقرير الرئيسي
- تنظيم واضح ومنطقي
- فهرسة وترقيم مناسب
- سهولة الوصول والمراجعة
- ربط واضح بالمحتوى الرئيسي

**أنواع الملاحق:**
1. الجداول والإحصائيات التفصيلية
2. المخططات والرسوم البيانية
3. نماذج الكود والبرمجة
4. الوثائق والنماذج
5. البيانات الخام
6. المواد المرجعية`,
        userPrompt: `أعد ملاحق شاملة ومنظمة تشمل:
- المواد الداعمة للتقرير
- تنظيم واضح ومنطقي
- فهرسة وترقيم مناسب
- ربط واضح بالمحتوى الرئيسي
- سهولة الوصول والمراجعة`,
        qualityFocus: ['relevance', 'organization', 'accessibility'],
        specificInstructions: [
            'نظم المواد بشكل منطقي',
            'أضف فهرسة وترقيم واضح',
            'تأكد من صلة المواد بالتقرير',
            'اجعل الوصول للمعلومات سهلاً'
        ]
    })
};

/**
 * إنشاء prompt ذكي لقسم محدد
 */
export async function createIntelligentSectionPrompt(
    sectionType: SectionName,
    input: z.infer<typeof SectionPromptInputSchema>
) {
    // الحصول على القالب المتخصص
    const template = SECTION_PROMPT_TEMPLATES[sectionType];

    if (!template) {
        throw new Error(`No specialized template found for section: ${sectionType}`);
    }

    // تحليل السياق للقسم المحدد
    const contextAnalysis = await ContextAnalyzer.analyzeContext({
        userInput: `Generate ${sectionType} section`,
        externalContext: input.contextData ? [input.contextData] : [],
        guidelines: input.guidelines || []
    });

    // اختيار النموذج المناسب
    const modelConfig = AdaptiveModelSelector.selectOptimalModel(
        contextAnalysis,
        'generation'
    );

    // بناء الـ prompt الذكي
    const intelligentPrompt = IntelligentPromptBuilder.buildPrompt({
        taskType: 'generation',
        domain: `report-${sectionType}`,
        contextAnalysis,
        userInput: `Generate ${sectionType} section`,
        externalContext: input.contextData ? [input.contextData] : []
    });

    // دمج القالب المتخصص مع الـ prompt الذكي
    const enhancedSystemPrompt = `${template.systemPrompt}

${intelligentPrompt.system}

**التركيز على الجودة:**
${template.qualityFocus.map(focus => `- ${focus}`).join('\n')}

**التعليمات المحددة:**
${template.specificInstructions.map(instruction => `- ${instruction}`).join('\n')}

**المتطلبات الخاصة:**
${input.specificRequirements ? input.specificRequirements.map(req => `- ${req}`).join('\n') : 'لا توجد متطلبات خاصة'}`;

    const enhancedUserPrompt = `${template.userPrompt}

${intelligentPrompt.instructions}

**السياق المتاح:**
${intelligentPrompt.context}

**القيود:**
${intelligentPrompt.constraints}`;

    return {
        systemPrompt: enhancedSystemPrompt,
        userPrompt: enhancedUserPrompt,
        modelConfig,
        qualityFocus: template.qualityFocus,
        specificInstructions: template.specificInstructions
    };
}

/**
 * إنشاء prompt محسن لقسم محدد مع السياق الكامل
 */
export const generateReportSectionPrompt = ai.definePrompt({
    name: 'createSectionPrompt',
    input: { schema: SectionPromptInputSchema },
    output: { schema: z.string() },
    model: 'googleai/gemini-2.0-flash',
    system: async (input) => {
        const intelligentPrompt = await createIntelligentSectionPrompt(
            input.sectionType as SectionName,
            input
        );
        return intelligentPrompt.systemPrompt;
    },
    prompt: async (input) => {
        const intelligentPrompt = await createIntelligentSectionPrompt(
            input.sectionType as SectionName,
            input
        );
        return intelligentPrompt.userPrompt;
    }
});

/**
 * دالة مساعدة للحصول على متطلبات الجودة لقسم محدد
 */
export function getSectionQualityRequirements(sectionType: SectionName) {
    const template = SECTION_PROMPT_TEMPLATES[sectionType];
    return {
        qualityFocus: template?.qualityFocus || [],
        specificInstructions: template?.specificInstructions || [],
        systemPrompt: template?.systemPrompt || '',
        userPrompt: template?.userPrompt || ''
    };
}
