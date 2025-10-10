/**
 * اختبارات نظام التحقق من جودة المخرجات
 */

import { ContextAnalysisResult } from '../context-analyzer';
import { OutputQualityValidator } from '../output-quality-validator';

describe('OutputQualityValidator', () => {
    let mockContextAnalysis: ContextAnalysisResult;

    beforeEach(() => {
        mockContextAnalysis = {
            contentType: 'technical',
            complexityLevel: 'intermediate',
            targetAudience: 'technical',
            language: 'ar',
            culturalContext: 'middle-east',
            specificRequirements: ['دقة', 'وضوح'],
            availableContext: {
                files: [],
                previousSections: [],
                guidelines: []
            },
            modelRecommendation: {
                primary: 'googleai/gemini-1.5-pro',
                fallback: 'googleai/gemini-1.5-flash',
                reasoning: 'مناسب للمحتوى التقني'
            }
        };
    });

    describe('validateOutput', () => {
        test('يجب أن يتحقق من جودة المخرجات العالية', async () => {
            const highQualityOutput = `
                # تقرير تقني شامل عن الذكاء الاصطناعي

                ## المقدمة
                الذكاء الاصطناعي هو مجال متطور من علوم الحاسوب يهدف إلى إنشاء أنظمة قادرة على أداء مهام تتطلب ذكاءً بشرياً.

                ## التطبيقات الرئيسية
                1. معالجة اللغة الطبيعية
                2. التعلم الآلي
                3. الرؤية الحاسوبية

                ## الخلاصة
                الذكاء الاصطناعي يحمل إمكانيات هائلة لتطوير مختلف المجالات.
      `;

            const result = await OutputQualityValidator.validateOutput(
                highQualityOutput,
                'اكتب تقرير تقني عن الذكاء الاصطناعي',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.isValid).toBe(true);
            expect(result.metrics.overall).toBeGreaterThan(70);
            expect(result.metrics.completeness).toBeGreaterThan(70);
            expect(result.metrics.accuracy).toBeGreaterThan(70);
            expect(result.metrics.clarity).toBeGreaterThan(70);
            expect(result.metrics.structure).toBeGreaterThan(70);
            expect(result.metrics.relevance).toBeGreaterThan(70);
            expect(result.needsImprovement).toBe(false);
            expect(result.issues).toHaveLength(0);
            expect(result.suggestions).toBeDefined();
        });

        test('يجب أن يتحقق من جودة المخرجات المنخفضة', async () => {
            const lowQualityOutput = 'نص قصير.';

            const result = await OutputQualityValidator.validateOutput(
                lowQualityOutput,
                'اكتب تقرير شامل ومفصل عن الذكاء الاصطناعي',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.isValid).toBe(false);
            expect(result.metrics.overall).toBeLessThan(70);
            expect(result.needsImprovement).toBe(true);
            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.suggestions.length).toBeGreaterThan(0);
            expect(result.improvementPrompt).toBeDefined();
        });

        test('يجب أن يتعامل مع أنواع مختلفة من المحتوى', async () => {
            const testCases = [
                { contentType: 'business', output: 'تقرير أعمال شامل' },
                { contentType: 'academic', output: 'بحث أكاديمي مفصل' },
                { contentType: 'creative', output: 'قصة إبداعية جميلة' },
                { contentType: 'mixed', output: 'محتوى مختلط متنوع' }
            ];

            for (const testCase of testCases) {
                const context = { ...mockContextAnalysis, contentType: testCase.contentType as 'technical' | 'business' | 'academic' | 'creative' | 'mixed' };
                const result = await OutputQualityValidator.validateOutput(
                    testCase.output,
                    'اكتب محتوى مفيد',
                    context
                );

                expect(result).toBeDefined();
                expect(result.metrics).toBeDefined();
                expect(result.issues).toBeDefined();
                expect(result.suggestions).toBeDefined();
            }
        });

        test('يجب أن يتعامل مع المحتوى التقني', async () => {
            const technicalOutput = `
                # نظام إدارة قواعد البيانات

                ## المتطلبات التقنية
                - خادم قاعدة بيانات MySQL
                - ذاكرة وصول عشوائي 8GB
                - مساحة تخزين 500GB

                ## التصميم
                النظام مصمم باستخدام معمارية ثلاثية الطبقات.
            `;

            const technicalContext = { ...mockContextAnalysis, contentType: 'technical' as const };
            const result = await OutputQualityValidator.validateOutput(
                technicalOutput,
                'اكتب مواصفات تقنية لنظام قاعدة بيانات',
                technicalContext
            );

            expect(result).toBeDefined();
            expect(result.metrics.accuracy).toBeGreaterThan(70);
            expect(result.metrics.structure).toBeGreaterThan(70);
        });

        test('يجب أن يتعامل مع المحتوى الإبداعي', async () => {
            const creativeOutput = `
                كان هناك شاب يحلم بالمغامرة. في يوم مشرق، قرر أن يبدأ رحلة إلى المجهول.
                حمل حقيبته وخرج من بيته بقلب مليء بالأمل والفضول.

                في الطريق، قابل أصدقاء جدد وعاش مغامرات مثيرة.
                تعلم أن الحياة أجمل عندما نجرؤ على الحلم.
            `;

            const creativeContext = { ...mockContextAnalysis, contentType: 'creative' as const };
            const result = await OutputQualityValidator.validateOutput(
                creativeOutput,
                'اكتب قصة قصيرة عن المغامرة',
                creativeContext
            );

            expect(result).toBeDefined();
            expect(result.metrics.clarity).toBeGreaterThan(60);
            expect(result.metrics.relevance).toBeGreaterThan(60);
        });

        test('يجب أن يتعامل مع المحتوى الأكاديمي', async () => {
            const academicOutput = `
                # تأثير التكنولوجيا على التعليم

                ## المقدمة
                شهد التعليم تحولات جذرية مع دخول التكنولوجيا إلى الفصول الدراسية.

                ## المنهجية
                تم استخدام منهجية البحث المختلط لجمع البيانات.

                ## النتائج
                أظهرت النتائج تحسناً ملحوظاً في الأداء التعليمي.

                ## الخلاصة والتوصيات
                التكنولوجيا تساهم في تطوير التعليم بشكل إيجابي.
            `;

            const academicContext = { ...mockContextAnalysis, contentType: 'academic' as const };
            const result = await OutputQualityValidator.validateOutput(
                academicOutput,
                'اكتب بحث أكاديمي عن تأثير التكنولوجيا على التعليم',
                academicContext
            );

            expect(result).toBeDefined();
            expect(result.metrics.structure).toBeGreaterThan(80);
            expect(result.metrics.completeness).toBeGreaterThan(70);
        });

        test('يجب أن يتعامل مع المحتوى المترجم', async () => {
            const translatedOutput = `
                # تقرير المبيعات الشهرية

                ## ملخص الأداء
                حققنا زيادة في المبيعات بنسبة 15% هذا الشهر.

                ## التحديات
                واجهنا بعض التحديات في التسويق الرقمي.

                ## التوصيات
                نوصي بزيادة الاستثمار في التسويق الرقمي.
            `;

            const result = await OutputQualityValidator.validateOutput(
                translatedOutput,
                'ترجم تقرير المبيعات إلى العربية',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.relevance).toBeGreaterThan(60);
            expect(result.metrics.clarity).toBeGreaterThan(60);
        });

        test('يجب أن يتعامل مع المحتوى المحسن', async () => {
            const improvedOutput = `
                # دليل استخدام النظام الجديد

                ## الخطوة الأولى: التسجيل
                1. افتح الموقع الإلكتروني
                2. اضغط على زر "تسجيل جديد"
                3. املأ البيانات المطلوبة
                4. اضغط "إنشاء حساب"

                ## الخطوة الثانية: التحقق
                ستتلقى رسالة تأكيد على بريدك الإلكتروني.

                ## الخطوة الثالثة: تسجيل الدخول
                استخدم بياناتك للدخول إلى النظام.
            `;

            const result = await OutputQualityValidator.validateOutput(
                improvedOutput,
                'حسن دليل الاستخدام ليكون أكثر وضوحاً',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.clarity).toBeGreaterThan(80);
            expect(result.metrics.structure).toBeGreaterThan(80);
        });

        test('يجب أن يتعامل مع المخرجات الفارغة', async () => {
            const result = await OutputQualityValidator.validateOutput(
                '',
                'اكتب محتوى مفيد',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.isValid).toBe(false);
            expect(result.metrics.overall).toBeLessThan(30);
            expect(result.issues.length).toBeGreaterThan(0);
            expect(result.needsImprovement).toBe(true);
        });

        test('يجب أن يتعامل مع عتبات جودة مختلفة', async () => {
            const output = 'محتوى متوسط الجودة يحتوي على بعض المعلومات المفيدة.';

            const result = await OutputQualityValidator.validateOutput(
                output,
                'اكتب محتوى مفيد',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.overall).toBeGreaterThan(0);
            expect(result.metrics.overall).toBeLessThan(100);
            expect(result.issues).toBeDefined();
            expect(result.suggestions).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        test('يجب أن يتعامل مع المخرجات الطويلة جداً', async () => {
            const veryLongOutput = 'محتوى طويل جداً. '.repeat(1000);

            const result = await OutputQualityValidator.validateOutput(
                veryLongOutput,
                'اكتب محتوى مفيد',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.completeness).toBeGreaterThan(70);
            expect(result.metrics.clarity).toBeLessThan(80);
        });

        test('يجب أن يتعامل مع الأحرف الخاصة', async () => {
            const specialCharsOutput = `
                # تقرير يحتوي على رموز خاصة

                ## الأرقام: 1234567890
                ## الرموز: @#$%^&*()
                ## الرموز الرياضية: ∑∏∫∞
                ## الرموز العربية: ءآأإ
            `;

            const result = await OutputQualityValidator.validateOutput(
                specialCharsOutput,
                'اكتب تقرير يحتوي على رموز خاصة',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.overall).toBeGreaterThan(0);
        });

        test('يجب أن يتعامل مع المحتوى متعدد اللغات', async () => {
            const multilingualOutput = `
                # تقرير متعدد اللغات

                ## English Section
                This is an English section with technical content.

                ## القسم العربي
                هذا قسم عربي يحتوي على محتوى تقني.

                ## Section Française
                Ceci est une section française avec du contenu technique.
            `;

            const result = await OutputQualityValidator.validateOutput(
                multilingualOutput,
                'اكتب تقرير متعدد اللغات',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.relevance).toBeGreaterThan(60);
        });

        test('يجب أن يتعامل مع المحتوى بدون هيكل', async () => {
            const unstructuredOutput = 'نص طويل بدون هيكل أو تنظيم واضح. يحتوي على معلومات مفيدة لكنها غير منظمة. لا توجد عناوين أو فقرات واضحة. المعلومات مبعثرة ولا تتبع ترتيباً منطقياً.';

            const result = await OutputQualityValidator.validateOutput(
                unstructuredOutput,
                'اكتب محتوى منظم',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.structure).toBeLessThan(70);
            expect(result.issues.some(issue => issue.type === 'poor_structure')).toBe(true);
        });

        test('يجب أن يتعامل مع المحتوى غير ذي الصلة', async () => {
            const irrelevantOutput = `
                # وصفة طبخ

                ## المكونات
                - دجاج
                - أرز
                - خضار

                ## طريقة التحضير
                اغسل الدجاج وقطعه إلى قطع صغيرة.
            `;

            const result = await OutputQualityValidator.validateOutput(
                irrelevantOutput,
                'اكتب تقرير تقني عن الذكاء الاصطناعي',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.relevance).toBeLessThan(50);
            expect(result.issues.some(issue => issue.type === 'irrelevant_content')).toBe(true);
        });

        test('يجب أن يتعامل مع المحتوى المتناقض', async () => {
            const contradictoryOutput = `
                # تقرير متناقض

                الذكاء الاصطناعي مفيد جداً في جميع المجالات.
                الذكاء الاصطناعي غير مفيد ويسبب مشاكل كثيرة.

                التكنولوجيا تحسن حياتنا بشكل كبير.
                التكنولوجيا تدمر حياتنا وتسبب العزلة.
            `;

            const result = await OutputQualityValidator.validateOutput(
                contradictoryOutput,
                'اكتب تقرير متسق عن التكنولوجيا',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.accuracy).toBeLessThan(70);
            expect(result.issues.some(issue => issue.type === 'factual_error')).toBe(true);
        });

        test('يجب أن يتعامل مع المحتوى غير الواضح', async () => {
            const unclearOutput = `
                # تقرير غير واضح

                النظام المعقد المتطور المتقدم المتطور يستخدم التقنيات المتقدمة المعقدة المتطورة لتحقيق الأهداف المطلوبة المحددة المطلوبة بشكل فعال ومتطور ومتقدم.

                الجملة الطويلة جداً التي تحتوي على الكثير من الكلمات المعقدة والمصطلحات التقنية المتقدمة التي تجعل الفهم صعباً ومعقداً.
            `;

            const result = await OutputQualityValidator.validateOutput(
                unclearOutput,
                'اكتب تقرير واضح ومفهوم',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.clarity).toBeLessThan(70);
            expect(result.issues.some(issue => issue.type === 'unclear_language')).toBe(true);
        });

        test('يجب أن يتعامل مع المحتوى الناقص', async () => {
            const incompleteOutput = `
                # تقرير ناقص

                هذا تقرير عن الذكاء الاصطناعي.

                الذكاء الاصطناعي مهم.
            `;

            const result = await OutputQualityValidator.validateOutput(
                incompleteOutput,
                'اكتب تقرير شامل ومفصل عن الذكاء الاصطناعي يتضمن التعريف والتطبيقات والتحديات',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.metrics.completeness).toBeLessThan(70);
            expect(result.issues.some(issue => issue.type === 'missing_content')).toBe(true);
        });

        test('يجب أن يتعامل مع المحتوى الممتاز', async () => {
            const excellentOutput = `
                # دليل شامل للذكاء الاصطناعي

                ## المقدمة
                الذكاء الاصطناعي (AI) هو مجال متطور من علوم الحاسوب يهدف إلى إنشاء أنظمة قادرة على أداء مهام تتطلب ذكاءً بشرياً.

                ## التعريف والمفاهيم الأساسية
                الذكاء الاصطناعي يشمل عدة فروع رئيسية:
                1. التعلم الآلي (Machine Learning)
                2. معالجة اللغة الطبيعية (NLP)
                3. الرؤية الحاسوبية (Computer Vision)
                4. الروبوتات الذكية (Intelligent Robotics)

                ## التطبيقات العملية
                ### في الرعاية الصحية
                - تشخيص الأمراض بدقة عالية
                - تحليل الصور الطبية
                - اكتشاف الأدوية الجديدة

                ### في النقل
                - السيارات ذاتية القيادة
                - تحسين حركة المرور
                - التنبؤ بصيانة المركبات

                ## التحديات والمخاطر
                1. الخصوصية والأمان
                2. التحيز في الخوارزميات
                3. التأثير على سوق العمل
                4. المسؤولية الأخلاقية

                ## المستقبل والتوقعات
                يتوقع الخبراء أن الذكاء الاصطناعي سيستمر في التطور وسيؤثر على جميع جوانب الحياة.

                ## الخلاصة
                الذكاء الاصطناعي يحمل إمكانيات هائلة لتطوير مختلف المجالات، لكنه يتطلب إدارة حكيمة للتحديات المرتبطة به.
            `;

            const result = await OutputQualityValidator.validateOutput(
                excellentOutput,
                'اكتب دليل شامل عن الذكاء الاصطناعي',
                mockContextAnalysis
            );

            expect(result).toBeDefined();
            expect(result.isValid).toBe(true);
            expect(result.metrics.overall).toBeGreaterThan(85);
            expect(result.metrics.completeness).toBeGreaterThan(85);
            expect(result.metrics.accuracy).toBeGreaterThan(85);
            expect(result.metrics.clarity).toBeGreaterThan(85);
            expect(result.metrics.structure).toBeGreaterThan(85);
            expect(result.metrics.relevance).toBeGreaterThan(85);
            expect(result.needsImprovement).toBe(false);
            expect(result.issues.length).toBe(0);
        });
    });
});
