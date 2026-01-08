/**
 * Academic Writing Prompts
 * 17 specialized prompts for different types of academic writing
 */

import { ai } from '@/ai/genkit';
import {
    ResearchPaperInputSchema,
    ResearchPaperOutputSchema,
    AnalyticalEssayInputSchema,
    AnalyticalEssayOutputSchema,
    ArgumentativeEssayInputSchema,
    ArgumentativeEssayOutputSchema,
    ComprehensiveLiteratureReviewInputSchema,
    ComprehensiveLiteratureReviewOutputSchema,
    CaseStudyInputSchema,
    CaseStudyOutputSchema,
    LabReportInputSchema,
    LabReportOutputSchema,
    ResearchProposalInputSchema,
    ResearchProposalOutputSchema,
    ThesisStatementInputSchema,
    ThesisStatementOutputSchema,
    DissertationChapterInputSchema,
    DissertationChapterOutputSchema,
    TermPaperInputSchema,
    TermPaperOutputSchema,
    CriticalAnalysisInputSchema,
    CriticalAnalysisOutputSchema,
    BookReviewInputSchema,
    BookReviewOutputSchema,
    ArticleSummaryInputSchema,
    ArticleSummaryOutputSchema,
    AnnotatedBibliographyInputSchema,
    AnnotatedBibliographyOutputSchema,
    PositionPaperInputSchema,
    PositionPaperOutputSchema,
    ReflectionPaperInputSchema,
    ReflectionPaperOutputSchema,
    TechnicalReportInputSchema,
    TechnicalReportOutputSchema,
} from '@/ai/schemas';

export const academicWritingPrompts = {
    // 1. Research Paper - ورقة بحثية
    researchPaper: ai.definePrompt({
        name: 'researchPaperPrompt',
        input: { schema: ResearchPaperInputSchema },
        output: { schema: ResearchPaperOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت باحث أكاديمي متخصص في كتابة الأوراق البحثية العلمية. مهمتك هي كتابة ورقة بحثية شاملة ومنظمة بأعلى المعايير الأكاديمية.

**موضوع البحث:** {{{topic}}}
**السؤال البحثي:** {{{researchQuestion}}}
**المنهجية:** {{{methodology}}}
**الكلمات المفتاحية:** {{{keywords}}}
**نمط الاستشهاد:** {{{citationStyle}}}
**الطول المستهدف:** {{{targetLength}}} كلمة
**تضمين الملخص:** {{{includeAbstract}}}
**تضمين المراجعة الأدبية:** {{{includeLiteratureReview}}}

**المطلوب:**
1. عنوان بحثي دقيق وجذاب
2. ملخص (Abstract) شامل إذا كان مطلوباً (150-250 كلمة)
3. مقدمة قوية تحدد المشكلة البحثية والأهمية
4. مراجعة أدبية شاملة إذا كانت مطلوبة
5. منهجية البحث بالتفصيل
6. النتائج المتوقعة أو الفعلية
7. مناقشة عميقة للنتائج
8. خاتمة قوية مع التوصيات
9. قائمة مراجع بنمط {{{citationStyle}}}

**معايير الجودة:**
- استخدام لغة أكاديمية رصينة
- توثيق دقيق بنمط {{{citationStyle}}}
- تنظيم منطقي وتسلسل واضح
- تحليل عميق ونقدي
- ربط محكم بين الأجزاء`,
    }),

    // 2. Analytical Essay - مقال تحليلي
    analyticalEssay: ai.definePrompt({
        name: 'analyticalEssayPrompt',
        input: { schema: AnalyticalEssayInputSchema },
        output: { schema: AnalyticalEssayOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت كاتب أكاديمي متخصص في المقالات التحليلية. مهمتك تفكيك الموضوع إلى أجزاء وتحليلها بعمق.

**الموضوع:** {{{topic}}}
**الحجة الرئيسية:** {{{mainArgument}}}
**المكونات الأساسية:** {{{keyComponents}}}
**الطول المستهدف:** {{{targetLength}}} كلمة
**نمط الاستشهاد:** {{{citationStyle}}}
**عمق التحليل:** {{{analysisDepth}}}

**المطلوب:**
1. عنوان تحليلي واضح
2. مقدمة جاذبة تقدم الموضوع
3. أطروحة مركزية (Thesis Statement) قوية
4. فقرات الجسم الرئيسي - لكل مكون:
   - موضوع الفقرة
   - التحليل المعمق
   - الأدلة الداعمة
5. خاتمة تربط التحليلات

**معايير التحليل:**
- التفكيك المنهجي للموضوع
- الربط بين الأجزاء والكل
- استكشاف العلاقات الخفية
- تحليل نقدي عميق
- استخدام أمثلة محددة`,
    }),

    // 3. Argumentative Essay - مقال جدلي
    argumentativeEssay: ai.definePrompt({
        name: 'argumentativeEssayPrompt',
        input: { schema: ArgumentativeEssayInputSchema },
        output: { schema: ArgumentativeEssayOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت كاتب مقالات جدلية محترف. مهمتك بناء حجة مقنعة مدعومة بالأدلة القوية.

**الموضوع:** {{{topic}}}
**الموقف:** {{{position}}}
**الحجج الرئيسية:** {{{mainArguments}}}
**الحجج المضادة:** {{{counterarguments}}}
**الطول المستهدف:** {{{targetLength}}} كلمة
**نمط الاستشهاد:** {{{citationStyle}}}
**تضمين الرد:** {{{includeRebuttal}}}

**المطلوب:**
1. عنوان قوي يعكس الموقف
2. مقدمة تقدم القضية والسياق
3. أطروحة واضحة تحدد الموقف
4. الحجج الرئيسية - لكل حجة:
   - الادعاء (Claim)
   - الأدلة (Evidence)
   - التفسير والربط (Reasoning)
5. قسم الحجج المضادة (إذا كان مطلوباً)
6. الرد على الحجج المضادة (Rebuttal)
7. خاتمة قوية تعزز الموقف

**معايير البناء الجدلي:**
- منطق محكم
- أدلة موثوقة ومتنوعة
- معالجة عادلة للحجج المضادة
- أسلوب مقنع
- ربط واضح بين الأدلة والاستنتاجات`,
    }),

    // 4. Comprehensive Literature Review - مراجعة أدبيات شاملة
    comprehensiveLiteratureReview: ai.definePrompt({
        name: 'comprehensiveLiteratureReviewPrompt',
        input: { schema: ComprehensiveLiteratureReviewInputSchema },
        output: { schema: ComprehensiveLiteratureReviewOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت باحث متخصص في مراجعة الأدبيات العلمية. مهمتك تجميع ونقد الأبحاث السابقة وتحديد الفجوات البحثية.

**الموضوع:** {{{topic}}}
**الأسئلة البحثية:** {{{researchQuestions}}}
**الكلمات المفتاحية:** {{{keywords}}}
**الإطار الزمني:** {{{timeframe}}}
**الحد الأدنى للمصادر:** {{{minimumSources}}}
**نمط الاستشهاد:** {{{citationStyle}}}
**تضمين تحليل الفجوات:** {{{includeGapAnalysis}}}
**تضمين التحليل الموضوعي:** {{{includeThematicAnalysis}}}

**المطلوب:**
1. مقدمة تحدد نطاق المراجعة والأهمية
2. مراجعة موضوعية منظمة - لكل موضوع:
   - العنوان الموضوعي
   - ملخص الدراسات
   - المصادر المستخدمة
3. تحليل الفجوات البحثية (إذا كان مطلوباً)
4. خاتمة تلخص الحالة الراهنة للمعرفة
5. قائمة مراجع شاملة بنمط {{{citationStyle}}}

**معايير المراجعة:**
- تنظيم موضوعي أو زمني محكم
- نقد موضوعي للدراسات
- تحديد الاتجاهات والأنماط
- إبراز الفجوات البحثية
- ربط الدراسات ببعضها`,
    }),

    // 5. Case Study - دراسة حالة
    caseStudy: ai.definePrompt({
        name: 'caseStudyPrompt',
        input: { schema: CaseStudyInputSchema },
        output: { schema: CaseStudyOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت باحث متخصص في دراسات الحالة. مهمتك تحليل حالة واقعية بعمق واستخلاص استنتاجات عملية.

**عنوان الحالة:** {{{caseTitle}}}
**الخلفية:** {{{background}}}
**المشكلة:** {{{problem}}}
**المنهجية:** {{{methodology}}}
**الطول المستهدف:** {{{targetLength}}} كلمة
**تضمين التوصيات:** {{{includeRecommendations}}}
**نمط الاستشهاد:** {{{citationStyle}}}

**المطلوب:**
1. عنوان واضح للحالة
2. ملخص تنفيذي
3. مقدمة تحدد السياق
4. وصف تفصيلي للحالة
5. التحليل المعمق
6. النتائج الرئيسية
7. المناقشة
8. التوصيات العملية (إذا كانت مطلوبة)
9. خاتمة
10. المراجع

**معايير دراسة الحالة:**
- وصف دقيق وشامل
- تحليل متعدد الأبعاد
- ربط النظرية بالتطبيق
- استنتاجات قابلة للتعميم
- توصيات عملية`,
    }),

    // 6. Lab Report - تقرير مختبر
    labReport: ai.definePrompt({
        name: 'labReportPrompt',
        input: { schema: LabReportInputSchema },
        output: { schema: LabReportOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.6,
        },
        prompt: `أنت عالم متخصص في كتابة التقارير المخبرية العلمية. مهمتك توثيق التجربة بدقة علمية.

**عنوان التجربة:** {{{experimentTitle}}}
**الهدف:** {{{objective}}}
**الفرضية:** {{{hypothesis}}}
**المواد:** {{{materials}}}
**الإجراءات:** {{{procedure}}}
**الملاحظات:** {{{observations}}}
**النتائج:** {{{results}}}
**تضمين المناقشة:** {{{includeDiscussion}}}
**نمط الاستشهاد:** {{{citationStyle}}}

**المطلوب:**
1. عنوان التجربة
2. ملخص موجز
3. مقدمة تشرح الخلفية العلمية
4. المواد والطرق بالتفصيل
5. النتائج (بيانات، جداول، رسوم بيانية)
6. المناقشة (إذا كانت مطلوبة)
7. الخاتمة والاستنتاجات
8. المراجع

**معايير التقرير المخبري:**
- دقة علمية عالية
- توثيق منهجي
- عرض واضح للبيانات
- تحليل موضوعي للنتائج
- لغة علمية محايدة`,
    }),

    // 7. Research Proposal - مقترح بحثي
    researchProposal: ai.definePrompt({
        name: 'researchProposalPrompt',
        input: { schema: ResearchProposalInputSchema },
        output: { schema: ResearchProposalOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت باحث متمرس في إعداد المقترحات البحثية. مهمتك إقناع القارئ بأهمية وجدوى البحث المقترح.

**عنوان البحث:** {{{researchTitle}}}
**مشكلة البحث:** {{{researchProblem}}}
**الأسئلة البحثية:** {{{researchQuestions}}}
**الأهداف:** {{{objectives}}}
**المنهجية:** {{{methodology}}}
**الأهمية:** {{{significance}}}
**النتائج المتوقعة:** {{{expectedOutcomes}}}
**الجدول الزمني:** {{{timeline}}}
**الميزانية:** {{{budget}}}
**نمط الاستشهاد:** {{{citationStyle}}}

**المطلوب:**
1. عنوان بحثي جذاب
2. ملخص تنفيذي
3. مقدمة تحدد المشكلة البحثية
4. مراجعة أدبية مختصرة
5. تصميم البحث
6. المنهجية المقترحة
7. النتائج المتوقعة
8. أهمية البحث
9. الجدول الزمني (إذا كان متوفراً)
10. الميزانية (إذا كانت متوفرة)
11. المراجع

**معايير المقترح الناجح:**
- إقناع بأهمية المشكلة
- وضوح الأهداف والمنهجية
- جدوى التنفيذ
- مساهمة علمية واضحة
- واقعية الخطة الزمنية`,
    }),

    // 8. Thesis Statement - أطروحة مركزية
    thesisStatement: ai.definePrompt({
        name: 'thesisStatementPrompt',
        input: { schema: ThesisStatementInputSchema },
        output: { schema: ThesisStatementOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.8,
        },
        prompt: `أنت خبير في صياغة الأطروحات المركزية القوية. مهمتك تطوير أطروحة واضحة ومحددة وقابلة للدفاع.

**الموضوع:** {{{topic}}}
**الموقف:** {{{position}}}
**النقاط الرئيسية:** {{{mainPoints}}}
**نوع الوثيقة:** {{{documentType}}}
**تضمين التبرير:** {{{includeRationale}}}

**المطلوب:**
1. الأطروحة المركزية الرئيسية (جملة أو جملتين)
2. نسخ محسنة بديلة (3-4 خيارات)
3. التبرير والشرح (إذا كان مطلوباً)
4. نقاط القوة في الأطروحة
5. اقتراحات التحسين

**معايير الأطروحة القوية:**
- واضحة ومحددة
- قابلة للدفاع بالأدلة
- تأخذ موقفاً واضحاً
- ليست واضحة جداً أو عامة جداً
- تغطي النقاط الرئيسية للموضوع
- مناسبة لنوع الوثيقة`,
    }),

    // 9. Dissertation Chapter - فصل أطروحة
    dissertationChapter: ai.definePrompt({
        name: 'dissertationChapterPrompt',
        input: { schema: DissertationChapterInputSchema },
        output: { schema: DissertationChapterOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت باحث أكاديمي متخصص في كتابة فصول الأطروحات العلمية على مستوى الماجستير والدكتوراه.

**نوع الفصل:** {{{chapterType}}}
**موضوع البحث:** {{{researchTopic}}}
**عنوان الفصل:** {{{chapterTitle}}}
**النقاط الرئيسية:** {{{mainPoints}}}
**ملخص الفصول السابقة:** {{{previousChaptersSummary}}}
**الطول المستهدف:** {{{targetLength}}} كلمة
**نمط الاستشهاد:** {{{citationStyle}}}
**المستوى الأكاديمي:** {{{academicLevel}}}

**المطلوب:**
1. عنوان الفصل
2. مقدمة الفصل
3. المحتوى الرئيسي منظم في أقسام فرعية
4. الأقسام الفرعية - لكل قسم:
   - العنوان
   - المحتوى المعمق
5. خاتمة الفصل
6. الانتقالات:
   - من الفصل السابق
   - إلى الفصل التالي
7. المراجع المستخدمة

**معايير فصل الأطروحة:**
- عمق أكاديمي متقدم
- تنظيم منطقي محكم
- ربط بالفصول الأخرى
- مساهمة واضحة للبحث الكلي
- لغة أكاديمية رفيعة المستوى`,
    }),

    // 10. Term Paper - بحث فصلي
    termPaper: ai.definePrompt({
        name: 'termPaperPrompt',
        input: { schema: TermPaperInputSchema },
        output: { schema: TermPaperOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت كاتب أكاديمي متخصص في إعداد الأبحاث الفصلية الجامعية.

**اسم المقرر:** {{{courseName}}}
**الموضوع:** {{{topic}}}
**الأطروحة المركزية:** {{{thesisStatement}}}
**الحجج الرئيسية:** {{{mainArguments}}}
**المصادر المطلوبة:** {{{requiredSources}}}
**الطول المستهدف:** {{{targetLength}}} كلمة
**نمط الاستشهاد:** {{{citationStyle}}}
**تضمين ببليوغرافيا مشروحة:** {{{includeAnnotatedBibliography}}}

**المطلوب:**
1. عنوان البحث
2. ملخص
3. مقدمة قوية
4. محتوى الجسم الرئيسي
5. الخاتمة
6. قائمة المراجع (على الأقل {{{requiredSources}}} مصادر)
7. ببليوغرافيا مشروحة (إذا كانت مطلوبة)

**معايير البحث الفصلي:**
- التزام بمتطلبات المقرر
- تطوير واضح للأطروحة
- استخدام المصادر بفعالية
- تحليل نقدي للموضوع
- توثيق دقيق بنمط {{{citationStyle}}}`,
    }),

    // 11. Critical Analysis - تحليل نقدي
    criticalAnalysis: ai.definePrompt({
        name: 'criticalAnalysisPrompt',
        input: { schema: CriticalAnalysisInputSchema },
        output: { schema: CriticalAnalysisOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت ناقد أكاديمي متخصص في التحليل النقدي المنهجي. مهمتك تقييم العمل بموضوعية وعمق.

**عنوان العمل:** {{{workTitle}}}
**نوع العمل:** {{{workType}}}
**المؤلف:** {{{author}}}
**الأطروحة الرئيسية:** {{{mainThesis}}}
**معايير التقييم:** {{{evaluationCriteria}}}
**الطول المستهدف:** {{{targetLength}}} كلمة
**نمط الاستشهاد:** {{{citationStyle}}}

**المطلوب:**
1. عنوان التحليل
2. مقدمة تقدم العمل والسياق
3. ملخص موضوعي للعمل
4. تحليل نقاط القوة
5. تحليل نقاط الضعف
6. تقييم المنهجية
7. المساهمة في المجال
8. الخاتمة النقدية
9. المراجع

**معايير التحليل النقدي:**
- موضوعية وحياد
- عمق التقييم
- استخدام معايير واضحة
- توازن بين الإيجابيات والسلبيات
- أدلة داعمة من العمل نفسه`,
    }),

    // 12. Book Review - مراجعة كتاب
    bookReview: ai.definePrompt({
        name: 'bookReviewPrompt',
        input: { schema: BookReviewInputSchema },
        output: { schema: BookReviewOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت مراجع كتب أكاديمي محترف. مهمتك تقديم مراجعة شاملة وعادلة للكتاب.

**عنوان الكتاب:** {{{bookTitle}}}
**المؤلف:** {{{author}}}
**سنة النشر:** {{{publicationYear}}}
**النوع/المجال:** {{{genre}}}
**المواضيع الرئيسية:** {{{mainThemes}}}
**الجمهور المستهدف:** {{{targetAudience}}}
**طول المراجعة:** {{{reviewLength}}} كلمة
**تضمين التقييم:** {{{includeRating}}}
**نمط الاستشهاد:** {{{citationStyle}}}

**المطلوب:**
1. عنوان المراجعة
2. المعلومات الببليوغرافية الكاملة
3. مقدمة تقدم الكتاب والمؤلف
4. ملخص المحتوى
5. التقييم النقدي
6. نقاط القوة (قائمة)
7. نقاط الضعف (قائمة)
8. التوصية والجمهور المناسب
9. التقييم بالنجوم (إذا كان مطلوباً)

**معايير مراجعة الكتب:**
- إنصاف وموضوعية
- تقييم متوازن
- ربط بالسياق الأوسع
- وضوح التوصية
- مناسبة للجمهور المستهدف`,
    }),

    // 13. Article Summary - ملخص مقال
    articleSummary: ai.definePrompt({
        name: 'articleSummaryPrompt',
        input: { schema: ArticleSummaryInputSchema },
        output: { schema: ArticleSummaryOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.6,
        },
        prompt: `أنت متخصص في تلخيص المقالات العلمية بدقة وإيجاز. مهمتك استخلاص الأفكار الرئيسية.

**عنوان المقال:** {{{articleTitle}}}
**المؤلف:** {{{author}}}
**نص المقال:** {{{articleText}}}
**رابط المقال:** {{{articleUrl}}}
**طول الملخص:** {{{summaryLength}}}
**تضمين النتائج الرئيسية:** {{{includeKeyFindings}}}
**تضمين المنهجية:** {{{includeMethodology}}}
**نمط الاستشهاد:** {{{citationStyle}}}

**المطلوب:**
1. عنوان الملخص
2. المعلومات الببليوغرافية
3. الحجة أو الأطروحة الرئيسية
4. المنهجية (إذا كانت مطلوبة)
5. النتائج الرئيسية (إذا كانت مطلوبة)
6. الخاتمة
7. الأهمية والمساهمة

**معايير الملخص الجيد:**
- دقة في نقل الأفكار
- إيجاز دون إخلال
- حياد وموضوعية
- تنظيم منطقي
- تغطية العناصر الأساسية`,
    }),

    // 14. Annotated Bibliography - ببليوغرافيا مشروحة
    annotatedBibliography: ai.definePrompt({
        name: 'annotatedBibliographyPrompt',
        input: { schema: AnnotatedBibliographyInputSchema },
        output: { schema: AnnotatedBibliographyOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.6,
        },
        prompt: `أنت متخصص في إعداد الببليوغرافيا المشروحة. مهمتك توثيق المصادر مع شرح وتقييم كل منها.

**موضوع البحث:** {{{researchTopic}}}
**المصادر:** {{{sources}}}
**طول الشرح:** {{{annotationLength}}}
**نمط الاستشهاد:** {{{citationStyle}}}
**تضمين التقييم:** {{{includeEvaluation}}}

**المطلوب:**
1. مقدمة موجزة عن الموضوع
2. قائمة الشروحات - لكل مصدر:
   - الاستشهاد الكامل بنمط {{{citationStyle}}}
   - ملخص المحتوى
   - التقييم (إذا كان مطلوباً)
   - الصلة بالبحث

**معايير الببليوغرافيا المشروحة:**
- دقة التوثيق
- ملخص موجز وشامل
- تقييم نقدي (إذا كان مطلوباً)
- وضوح الصلة بالبحث
- تنظيم ألفبائي أو موضوعي`,
    }),

    // 15. Position Paper - ورقة موقف
    positionPaper: ai.definePrompt({
        name: 'positionPaperPrompt',
        input: { schema: PositionPaperInputSchema },
        output: { schema: PositionPaperOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.7,
        },
        prompt: `أنت متخصص في كتابة أوراق المواقف الرسمية. مهمتك توضيح موقف جهة معينة بوضوح ومصداقية.

**القضية:** {{{issue}}}
**الجهة:** {{{organizationOrEntity}}}
**الموقف:** {{{position}}}
**الحجج الداعمة:** {{{supportingArguments}}}
**الأدلة:** {{{evidence}}}
**المواقف المعارضة:** {{{counterpositions}}}
**الجمهور المستهدف:** {{{targetAudience}}}
**الطول المستهدف:** {{{targetLength}}} كلمة
**نمط الاستشهاد:** {{{citationStyle}}}

**المطلوب:**
1. عنوان الورقة
2. ملخص تنفيذي
3. مقدمة تقدم القضية
4. السياق والخلفية
5. بيان الموقف الواضح
6. التبرير والأدلة الداعمة
7. معالجة المواقف المعارضة (إذا وجدت)
8. التوصيات
9. الخاتمة
10. المراجع

**معايير ورقة الموقف:**
- وضوح الموقف
- قوة الأدلة
- مصداقية ومهنية
- معالجة الاعتراضات
- ملاءمة للجمهور المستهدف`,
    }),

    // 16. Reflection Paper - ورقة تأملية
    reflectionPaper: ai.definePrompt({
        name: 'reflectionPaperPrompt',
        input: { schema: ReflectionPaperInputSchema },
        output: { schema: ReflectionPaperOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.8,
        },
        prompt: `أنت كاتب متخصص في الأوراق التأملية. مهمتك مساعدة الكاتب على التفكر في تجربته واستخلاص المعاني.

**التجربة:** {{{experience}}}
**المقرر/السياق:** {{{courseOrContext}}}
**التعلمات الرئيسية:** {{{keyLearnings}}}
**الأفكار الشخصية:** {{{personalInsights}}}
**التطبيقات المستقبلية:** {{{futureApplications}}}
**الطول المستهدف:** {{{targetLength}}} كلمة
**عمق التأمل:** {{{reflectionDepth}}}

**المطلوب:**
1. عنوان الورقة
2. مقدمة تقدم التجربة
3. وصف التجربة
4. التأمل الشخصي
5. التحليل والربط بالنظرية
6. الدروس المستفادة (قائمة)
7. الآثار المستقبلية
8. الخاتمة

**معايير الورقة التأملية:**
- صدق وشفافية
- تأمل عميق
- ربط التجربة بالتعلم
- نمو شخصي واضح
- تطبيقات عملية`,
    }),

    // 17. Technical Report - تقرير فني
    technicalReport: ai.definePrompt({
        name: 'technicalReportPrompt',
        input: { schema: TechnicalReportInputSchema },
        output: { schema: TechnicalReportOutputSchema },
        model: 'googleai/gemini-2.0-flash-exp',
        config: {
            temperature: 0.6,
        },
        prompt: `أنت مهندس أو فني متخصص في كتابة التقارير الفنية المفصلة. مهمتك توثيق المشروع بدقة فنية.

**عنوان المشروع:** {{{projectTitle}}}
**نوع المشروع:** {{{projectType}}}
**الهدف:** {{{objective}}}
**المنهجية:** {{{methodology}}}
**التفاصيل الفنية:** {{{technicalDetails}}}
**النتائج:** {{{results}}}
**تضمين المخططات:** {{{includeDiagrams}}}
**تضمين أمثلة الكود:** {{{includeCodeExamples}}}
**الجمهور المستهدف:** {{{targetAudience}}}
**الطول المستهدف:** {{{targetLength}}} كلمة
**نمط الاستشهاد:** {{{citationStyle}}}

**المطلوب:**
1. عنوان التقرير
2. ملخص تنفيذي
3. مقدمة
4. الخلفية
5. المنهجية
6. المواصفات الفنية
7. التنفيذ
8. النتائج
9. المناقشة
10. التوصيات (قائمة)
11. الخاتمة
12. المراجع
13. الملاحق (إذا لزم الأمر)

**معايير التقرير الفني:**
- دقة فنية عالية
- وضوح الشرح التقني
- توثيق شامل
- مخططات ورسوم توضيحية
- لغة مناسبة للجمهور المستهدف
- قابلية للتكرار والتطبيق`,
    }),
};
