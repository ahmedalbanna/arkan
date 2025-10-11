# أمثلة الاستخدام - نظام التدفقات المصنف

## 📚 نظرة عامة

هذا الدليل يحتوي على أمثلة شاملة لاستخدام نظام التدفقات المصنف الجديد في مشروع Arkan. كل مثال يوضح طريقة محددة للاستخدام مع شرح مفصل.

## 🔧 الإعداد الأساسي

### استيراد النظام

```typescript
// استيراد النظام الموحد
import { UnifiedFlows } from '@/ai/flows';

// استيراد التدفقات المباشرة
import {
    grammarCheck,
    summarizeText,
    generateText,
    analyzeContext,
    writeDocument
} from '@/ai/flows';

// استيراد نظام التسجيل
import { FlowRegistry, FlowCategory } from '@/ai/flows';
```

## 🎯 أمثلة الاستخدام الأساسية

### 1. تنفيذ تدفق واحد

```typescript
/**
 * مثال: فحص القواعد النحوية لنص
 */
async function checkGrammarExample() {
    try {
        const result = await UnifiedFlows.execute({
            flowName: 'grammar-checker',
            input: {
                text: 'هذا نص يحتوي على أخطاء نحوية وإملائية',
                language: 'ar',
                strictMode: true
            }
        });

        if (result.success) {
            console.log('✅ فحص القواعد نجح');
            console.log('الوقت المستغرق:', result.executionTime, 'ms');
            console.log('التصحيحات:', result.data.corrections);
            console.log('النص المصحح:', result.data.correctedText);
        } else {
            console.error('❌ فشل فحص القواعد:', result.error);
        }
    } catch (error) {
        console.error('خطأ غير متوقع:', error);
    }
}
```

### 2. تنفيذ متعدد التدفقات

```typescript
/**
 * مثال: معالجة نص شامل (فحص + تلخيص + تحسين)
 */
async function comprehensiveTextProcessing() {
    const originalText = `
        الذكاء الاصطناعي هو مجال من مجالات علوم الحاسوب يركز على إنشاء أنظمة قادرة على أداء مهام تتطلب عادة ذكاء بشري.
        يشمل الذكاء الاصطناعي التعلم الآلي، معالجة اللغة الطبيعية، الرؤية الحاسوبية، والروبوتات.
        هذه التقنيات تستخدم في العديد من التطبيقات مثل السيارات ذاتية القيادة، المساعدات الذكية، والتشخيص الطبي.
    `;

    const requests = [
        {
            flowName: 'grammar-checker',
            input: { text: originalText, language: 'ar' }
        },
        {
            flowName: 'summarize-text',
            input: {
                text: originalText,
                maxLength: 100,
                style: 'academic'
            }
        },
        {
            flowName: 'humanize-text',
            input: {
                text: originalText,
                targetAudience: 'general',
                tone: 'friendly'
            }
        }
    ];

    console.log('🚀 بدء المعالجة الشاملة...');
    const results = await UnifiedFlows.executeMultiple(requests);

    results.forEach((result, index) => {
        const flowNames = ['grammar-checker', 'summarize-text', 'humanize-text'];
        console.log(`\n📋 نتيجة ${flowNames[index]}:`);

        if (result.success) {
            console.log('✅ نجح التنفيذ');
            console.log('الوقت:', result.executionTime, 'ms');
            console.log('البيانات:', result.data);
        } else {
            console.log('❌ فشل التنفيذ:', result.error);
        }
    });
}
```

### 3. تنفيذ مع إعادة المحاولة

```typescript
/**
 * مثال: توليد نص مع إعادة المحاولة للتدفقات الحرجة
 */
async function generateTextWithRetry() {
    const prompt = 'اكتب مقال شامل عن مستقبل الذكاء الاصطناعي في التعليم';

    console.log('🔄 محاولة توليد النص مع إعادة المحاولة...');

    const result = await UnifiedFlows.executeWithRetry(
        {
            flowName: 'generate-text',
            input: {
                prompt: prompt,
                style: 'academic',
                length: 'long',
                language: 'ar',
                includeReferences: true
            }
        },
        3, // محاولات
        2000 // تأخير 2 ثانية
    );

    if (result.success) {
        console.log('✅ تم توليد النص بنجاح');
        console.log('المحتوى:', result.data.content);
        console.log('المراجع:', result.data.references);
        console.log('الوقت الإجمالي:', result.executionTime, 'ms');
    } else {
        console.error('❌ فشل توليد النص بعد جميع المحاولات:', result.error);
    }
}
```

## 📊 أمثلة التدفقات المصنفة

### معالجة النصوص

```typescript
/**
 * مثال شامل لتدفقات معالجة النصوص
 */
async function textProcessingExamples() {
    const sampleText = 'هذا نص يحتوي على أخطاء نحوية وإملائية متعددة.';

    // 1. فحص القواعد النحوية
    const grammarResult = await grammarCheck({
        text: sampleText,
        language: 'ar',
        strictMode: false
    });
    console.log('فحص القواعد:', grammarResult);

    // 2. إعادة صياغة النص
    const paraphraseResult = await paraphraseText({
        text: sampleText,
        style: 'formal',
        preserveMeaning: true
    });
    console.log('إعادة الصياغة:', paraphraseResult);

    // 3. تلخيص النص
    const summaryResult = await summarizeText({
        text: sampleText,
        maxLength: 50,
        style: 'concise'
    });
    console.log('التلخيص:', summaryResult);

    // 4. جعل النص أكثر إنسانية
    const humanizeResult = await humanizeText({
        text: sampleText,
        targetAudience: 'students',
        tone: 'friendly'
    });
    console.log('التأنسن:', humanizeResult);

    // 5. فحص الانتحال
    const plagiarismResult = await plagiarismCheck({
        text: sampleText,
        checkSources: ['web', 'academic'],
        sensitivity: 'medium'
    });
    console.log('فحص الانتحال:', plagiarismResult);

    // 6. كشف المحتوى المولد بالذكاء الاصطناعي
    const aiDetectionResult = await detectAiContent({
        text: sampleText,
        model: 'advanced',
        confidence: 0.8
    });
    console.log('كشف الذكاء الاصطناعي:', aiDetectionResult);
}
```

### توليد المحتوى

```typescript
/**
 * مثال شامل لتدفقات توليد المحتوى
 */
async function contentGenerationExamples() {
    // 1. توليد نص عام
    const textResult = await generateText({
        prompt: 'اكتب مقال عن فوائد التمارين الرياضية',
        style: 'informative',
        length: 'medium',
        language: 'ar',
        tone: 'professional'
    });
    console.log('توليد النص:', textResult);

    // 2. توليد أفكار
    const ideasResult = await generateIdeas({
        topic: 'التكنولوجيا في التعليم',
        count: 5,
        creativity: 'high',
        targetAudience: 'educators'
    });
    console.log('توليد الأفكار:', ideasResult);

    // 3. توليد كود
    const codeResult = await generateCode({
        description: 'دالة لحساب المتوسط الحسابي لمصفوفة',
        language: 'javascript',
        style: 'clean',
        includeComments: true
    });
    console.log('توليد الكود:', codeResult);

    // 4. توليد قاعدة كود
    const codebaseResult = await generateCodebase({
        projectDescription: 'تطبيق إدارة المهام',
        techStack: ['React', 'Node.js', 'MongoDB'],
        features: ['authentication', 'task-management', 'notifications'],
        complexity: 'medium'
    });
    console.log('توليد قاعدة الكود:', codebaseResult);

    // 5. توليد مراجع
    const citationResult = await generateCitation({
        topic: 'الذكاء الاصطناعي',
        citationStyle: 'APA',
        count: 10,
        language: 'ar',
        includeDOI: true
    });
    console.log('توليد المراجع:', citationResult);

    // 6. توليد اختبار
    const quizResult = await generateQuiz({
        topic: 'البرمجة',
        difficulty: 'intermediate',
        questionCount: 5,
        questionTypes: ['multiple-choice', 'true-false'],
        language: 'ar'
    });
    console.log('توليد الاختبار:', quizResult);

    // 7. شرح موضوع
    const explanationResult = await topicExplainer({
        topic: 'الذكاء الاصطناعي',
        targetAudience: 'beginners',
        complexity: 'simple',
        examples: true,
        language: 'ar'
    });
    console.log('شرح الموضوع:', explanationResult);
}
```

### معالجة المستندات

```typescript
/**
 * مثال شامل لتدفقات معالجة المستندات
 */
async function documentProcessingExamples() {
    // 1. كتابة مستند
    const documentResult = await writeDocument({
        topic: 'أهمية التعليم الرقمي',
        documentType: 'research-paper',
        length: 'long',
        language: 'ar',
        includeReferences: true,
        targetAudience: 'academic'
    });
    console.log('كتابة المستند:', documentResult);

    // 2. توليد عرض تقديمي
    const presentationResult = await generatePresentation({
        topic: 'مستقبل التكنولوجيا',
        slides: 15,
        style: 'professional',
        language: 'ar',
        includeImages: true,
        targetAudience: 'business'
    });
    console.log('توليد العرض التقديمي:', presentationResult);

    // 3. توليد مخطط العرض التقديمي
    const outlineResult = await generatePresentationOutline({
        topic: 'الاستدامة البيئية',
        duration: 30, // دقيقة
        audience: 'general',
        language: 'ar',
        includeActivities: true
    });
    console.log('مخطط العرض التقديمي:', outlineResult);

    // 4. توليد خطة مشروع
    const projectPlanResult = await generateProjectPlan({
        projectName: 'تطبيق إدارة المكتبة',
        description: 'تطبيق ويب لإدارة مكتبة الجامعة',
        duration: 6, // أشهر
        teamSize: 5,
        budget: 50000,
        techStack: ['React', 'Node.js', 'PostgreSQL']
    });
    console.log('خطة المشروع:', projectPlanResult);

    // 5. تلخيص مستند
    const documentSummaryResult = await summarizeDocument({
        documentContent: 'محتوى مستند طويل...',
        summaryType: 'executive',
        maxLength: 200,
        language: 'ar',
        includeKeyPoints: true
    });
    console.log('تلخيص المستند:', documentSummaryResult);

    // 6. إعادة كتابة إلى Markdown
    const markdownResult = await rewriteToMarkdown({
        content: 'محتوى HTML أو نص عادي',
        format: 'html',
        style: 'github',
        includeTOC: true,
        language: 'ar'
    });
    console.log('تحويل إلى Markdown:', markdownResult);
}
```

### التحليل

```typescript
/**
 * مثال شامل لتدفقات التحليل
 */
async function analysisExamples() {
    // 1. تحليل السياق
    const contextAnalysisResult = await analyzeContext({
        prompt: 'حلل هذه الوثائق وقدم تقرير شامل',
        contextFiles: [
            {
                name: 'report1.pdf',
                content: 'محتوى التقرير الأول...',
                type: 'text'
            },
            {
                name: 'data.xlsx',
                content: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,...',
                type: 'media'
            }
        ],
        analysisType: 'comprehensive',
        language: 'ar'
    });
    console.log('تحليل السياق:', contextAnalysisResult);

    // 2. فحص الحقائق
    const factCheckResult = await factCheckText({
        text: 'الذكاء الاصطناعي اخترع في عام 1956',
        sources: ['wikipedia', 'academic'],
        language: 'ar',
        confidence: 0.9
    });
    console.log('فحص الحقائق:', factCheckResult);

    // 3. الباحث الذكي
    const researchResult = await aiResearcher({
        query: 'أحدث تطورات الذكاء الاصطناعي في التعليم',
        sources: ['academic', 'news', 'blogs'],
        language: 'ar',
        maxResults: 10,
        includeCitations: true
    });
    console.log('البحث الذكي:', researchResult);

    // 4. تقييم التقرير
    const evaluationResult = await evaluateReport({
        reportContent: 'محتوى التقرير...',
        criteria: ['accuracy', 'completeness', 'clarity'],
        language: 'ar',
        detailedFeedback: true
    });
    console.log('تقييم التقرير:', evaluationResult);

    // 5. استخراج النصوص من الصور
    const imageTextResult = await imageToText({
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        language: 'ar',
        ocrEngine: 'advanced',
        confidence: 0.8
    });
    console.log('استخراج النصوص:', imageTextResult);
}
```

### الأكاديمي

```typescript
/**
 * مثال شامل لتدفقات الأكاديمي
 */
async function academicExamples() {
    // 1. تحليل مستند أكاديمي
    const academicAnalysisResult = await analyzeAcademicDocument({
        documentContent: 'محتوى الامتحان أو الواجب...',
        documentType: 'exam',
        subject: 'الرياضيات',
        difficulty: 'intermediate',
        language: 'ar'
    });
    console.log('تحليل المستند الأكاديمي:', academicAnalysisResult);

    // 2. حل مستند أكاديمي
    const academicSolutionResult = await solveAcademicDocument({
        documentContent: 'محتوى الواجب...',
        documentType: 'homework',
        subject: 'الفيزياء',
        difficulty: 'advanced',
        showSteps: true,
        language: 'ar'
    });
    console.log('حل المستند الأكاديمي:', academicSolutionResult);

    // 3. توليد محاضرة نظرية
    const lectureResult = await generateTheoreticalLecture({
        lectureTopic: 'أساسيات البرمجة',
        subTopics: ['المتغيرات', 'الحلقات', 'الدوال'],
        professorNotes: 'التركيز على الأمثلة العملية',
        targetAudience: 'undergraduate',
        language: 'ar',
        duration: 90 // دقيقة
    });
    console.log('المحاضرة النظرية:', lectureResult);

    // 4. توليد خطة جلسة
    const sessionPlanResult = await generateSessionPlan({
        chapterContent: 'محتوى الفصل...',
        sessionDuration: 120, // دقيقة
        numActivities: 5,
        targetAudience: 'undergraduate',
        language: 'ar',
        includeAssessment: true
    });
    console.log('خطة الجلسة:', sessionPlanResult);

    // 5. إنشاء وحدة محاضرة كاملة
    const lectureUnitResult = await createLectureUnit({
        lectureTopic: 'قواعد البيانات',
        subTopics: ['SQL', 'Normalization', 'Indexing'],
        professorNotes: 'التركيز على التطبيق العملي',
        sessionDuration: 120,
        numActivities: 6,
        targetAudience: 'undergraduate',
        language: 'ar'
    });
    console.log('وحدة المحاضرة الكاملة:', lectureUnitResult);
}
```

### المرئي

```typescript
/**
 * مثال شامل لتدفقات المرئي
 */
async function visualExamples() {
    // 1. توليد مخطط
    const diagramResult = await generateDiagram({
        description: 'مخطط تدفق عملية التسجيل في النظام',
        diagramType: 'flowchart',
        style: 'modern',
        language: 'ar',
        includeLabels: true,
        colorScheme: 'professional'
    });
    console.log('توليد المخطط:', diagramResult);

    // 2. توليد PlantUML
    const plantUMLResult = await generatePlantUML({
        description: 'مخطط تسلسل عملية الدفع',
        diagramType: 'sequence',
        participants: ['المستخدم', 'النظام', 'قاعدة البيانات', 'بوابة الدفع'],
        language: 'ar',
        includeNotes: true,
        style: 'professional'
    });
    console.log('توليد PlantUML:', plantUMLResult);
}
```

## 🔍 أمثلة متقدمة

### 1. إنشاء تدفق مخصص

```typescript
/**
 * مثال: إنشاء تدفق مخصص لمعالجة النصوص العربية
 */
async function createCustomFlow() {
    // تعريف التدفق المخصص
    const customFlow = {
        name: 'arabic-text-processor',
        category: 'text-processing' as FlowCategory,
        description: 'معالج متقدم للنصوص العربية',
        inputSchema: z.object({
            text: z.string(),
            operations: z.array(z.enum(['normalize', 'tokenize', 'analyze'])),
            language: z.literal('ar')
        }),
        outputSchema: z.object({
            processedText: z.string(),
            tokens: z.array(z.string()),
            analysis: z.object({
                wordCount: z.number(),
                sentenceCount: z.number(),
                readabilityScore: z.number()
            })
        }),
        handler: async (input: any) => {
            // منطق المعالجة المخصص
            const { text, operations } = input;

            let processedText = text;
            const tokens: string[] = [];
            const analysis = {
                wordCount: 0,
                sentenceCount: 0,
                readabilityScore: 0
            };

            // تطبيق العمليات المطلوبة
            if (operations.includes('normalize')) {
                processedText = normalizeArabicText(text);
            }

            if (operations.includes('tokenize')) {
                tokens.push(...tokenizeArabicText(processedText));
            }

            if (operations.includes('analyze')) {
                analysis.wordCount = countWords(processedText);
                analysis.sentenceCount = countSentences(processedText);
                analysis.readabilityScore = calculateReadability(processedText);
            }

            return {
                processedText,
                tokens,
                analysis
            };
        }
    };

    // تسجيل التدفق
    FlowRegistry.register(customFlow);

    // استخدام التدفق المخصص
    const result = await UnifiedFlows.execute({
        flowName: 'arabic-text-processor',
        input: {
            text: 'هذا نص عربي للتحليل والمعالجة',
            operations: ['normalize', 'tokenize', 'analyze'],
            language: 'ar'
        }
    });

    console.log('نتيجة التدفق المخصص:', result);
}

// دوال مساعدة للتدفق المخصص
function normalizeArabicText(text: string): string {
    // تطبيع النص العربي
    return text.replace(/[إأآا]/g, 'ا')
               .replace(/[يى]/g, 'ي')
               .replace(/[ة]/g, 'ه');
}

function tokenizeArabicText(text: string): string[] {
    // تقسيم النص إلى كلمات
    return text.split(/\s+/).filter(word => word.length > 0);
}

function countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

function countSentences(text: string): number {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
}

function calculateReadability(text: string): number {
    // حساب درجة القراءة (مثال مبسط)
    const words = countWords(text);
    const sentences = countSentences(text);
    return words / sentences;
}
```

### 2. معالجة الأخطاء المتقدمة

```typescript
/**
 * مثال: معالجة شاملة للأخطاء مع إعادة المحاولة الذكية
 */
async function advancedErrorHandling() {
    const flows = [
        'grammar-checker',
        'summarize-text',
        'generate-text',
        'analyze-context'
    ];

    const input = {
        text: 'نص للتحليل والمعالجة',
        language: 'ar'
    };

    for (const flowName of flows) {
        console.log(`\n🔄 معالجة التدفق: ${flowName}`);

        try {
            // محاولة أولى
            let result = await UnifiedFlows.execute({
                flowName,
                input
            });

            // إذا فشلت المحاولة الأولى، جرب إعادة المحاولة
            if (!result.success) {
                console.log(`⚠️ فشلت المحاولة الأولى، جاري إعادة المحاولة...`);

                result = await UnifiedFlows.executeWithRetry(
                    { flowName, input },
                    2, // محاولات إضافية
                    1000 // تأخير ثانية
                );
            }

            if (result.success) {
                console.log(`✅ نجح التدفق: ${flowName}`);
                console.log(`⏱️ الوقت: ${result.executionTime}ms`);
                console.log(`📊 البيانات:`, result.data);
            } else {
                console.log(`❌ فشل التدفق: ${flowName}`);
                console.log(`🚨 الخطأ: ${result.error}`);

                // محاولة تدفق بديل
                const alternativeFlow = getAlternativeFlow(flowName);
                if (alternativeFlow) {
                    console.log(`🔄 جاري تجربة التدفق البديل: ${alternativeFlow}`);
                    const altResult = await UnifiedFlows.execute({
                        flowName: alternativeFlow,
                        input
                    });

                    if (altResult.success) {
                        console.log(`✅ نجح التدفق البديل: ${alternativeFlow}`);
                    }
                }
            }
        } catch (error) {
            console.error(`💥 خطأ غير متوقع في التدفق ${flowName}:`, error);
        }
    }
}

function getAlternativeFlow(flowName: string): string | null {
    const alternatives: Record<string, string> = {
        'grammar-checker': 'ai-proofread-document',
        'summarize-text': 'summarize-document',
        'generate-text': 'topic-explainer',
        'analyze-context': 'ai-researcher'
    };

    return alternatives[flowName] || null;
}
```

### 3. مراقبة الأداء

```typescript
/**
 * مثال: مراقبة أداء التدفقات وتحليل الإحصائيات
 */
async function performanceMonitoring() {
    console.log('📊 بدء مراقبة الأداء...');

    // الحصول على إحصائيات النظام
    const stats = await UnifiedFlows.getStats();
    console.log('إحصائيات النظام:', stats);

    // الحصول على التدفقات المتاحة
    const availableFlows = await UnifiedFlows.getAvailableFlows();
    console.log('التدفقات المتاحة:', availableFlows.length);

    // اختبار أداء كل فئة
    const categories = ['text-processing', 'content-generation', 'document-processing'];

    for (const category of categories) {
        console.log(`\n🔍 اختبار فئة: ${category}`);

        const categoryFlows = await UnifiedFlows.getFlowsByCategory(category as FlowCategory);
        console.log(`عدد التدفقات في الفئة: ${categoryFlows.length}`);

        // اختبار عينة من التدفقات
        const sampleFlows = categoryFlows.slice(0, 2); // أول تدفقين

        for (const flow of sampleFlows) {
            console.log(`\n⏱️ اختبار التدفق: ${flow.name}`);

            const startTime = Date.now();

            try {
                const result = await UnifiedFlows.execute({
                    flowName: flow.name,
                    input: getSampleInput(flow.name)
                });

                const executionTime = Date.now() - startTime;

                console.log(`✅ نجح التنفيذ`);
                console.log(`⏱️ الوقت: ${executionTime}ms`);
                console.log(`📈 نجاح النظام: ${result.success}`);

                if (executionTime > 5000) {
                    console.log(`⚠️ تحذير: التدفق بطيء (${executionTime}ms)`);
                }

            } catch (error) {
                console.log(`❌ فشل التنفيذ: ${error}`);
            }
        }
    }
}

function getSampleInput(flowName: string): any {
    const sampleInputs: Record<string, any> = {
        'grammar-checker': { text: 'نص للاختبار', language: 'ar' },
        'summarize-text': { text: 'نص طويل للاختبار...', maxLength: 100 },
        'generate-text': { prompt: 'اكتب نص قصير', length: 'short' },
        'analyze-context': { prompt: 'حلل هذا النص', contextFiles: [] },
        'write-document': { topic: 'موضوع للاختبار', documentType: 'article' }
    };

    return sampleInputs[flowName] || { text: 'نص للاختبار' };
}
```

## 🧪 أمثلة الاختبار

### اختبار وحدة

```typescript
/**
 * مثال: اختبار وحدة للتدفقات المصنفة
 */
describe('نظام التدفقات المصنف - اختبارات الوحدة', () => {
    beforeEach(() => {
        FlowRegistry.clear();
    });

    test('يجب أن يسجل التدفقات بشكل صحيح', () => {
        const mockFlow = {
            name: 'test-flow',
            category: 'text-processing' as FlowCategory,
            description: 'تدفق اختبار',
            inputSchema: z.object({ text: z.string() }),
            outputSchema: z.object({ result: z.string() }),
            handler: async (input: any) => ({ result: `processed: ${input.text}` })
        };

        FlowRegistry.register(mockFlow);
        expect(FlowRegistry.has('test-flow')).toBe(true);
        expect(FlowRegistry.get('test-flow')).toEqual(mockFlow);
    });

    test('يجب أن ينفذ التدفقات بشكل صحيح', async () => {
        const mockFlow = {
            name: 'test-flow',
            category: 'text-processing' as FlowCategory,
            description: 'تدفق اختبار',
            inputSchema: z.object({ text: z.string() }),
            outputSchema: z.object({ result: z.string() }),
            handler: async (input: any) => ({ result: `processed: ${input.text}` })
        };

        FlowRegistry.register(mockFlow);

        const result = await UnifiedFlows.execute({
            flowName: 'test-flow',
            input: { text: 'hello' }
        });

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ result: 'processed: hello' });
        expect(result.executionTime).toBeGreaterThan(0);
    });

    test('يجب أن يتعامل مع الأخطاء بشكل صحيح', async () => {
        const result = await UnifiedFlows.execute({
            flowName: 'non-existent-flow',
            input: { text: 'hello' }
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
    });
});
```

### اختبار التكامل

```typescript
/**
 * مثال: اختبار تكامل للتدفقات المصنفة
 */
describe('نظام التدفقات المصنف - اختبارات التكامل', () => {
    test('يجب أن يعمل التنفيذ المتعدد بشكل صحيح', async () => {
        // تسجيل تدفقات اختبار
        const flows = [
            {
                name: 'flow-1',
                category: 'text-processing' as FlowCategory,
                description: 'تدفق 1',
                inputSchema: z.object({ text: z.string() }),
                outputSchema: z.object({ result: z.string() }),
                handler: async (input: any) => ({ result: `flow1: ${input.text}` })
            },
            {
                name: 'flow-2',
                category: 'content-generation' as FlowCategory,
                description: 'تدفق 2',
                inputSchema: z.object({ text: z.string() }),
                outputSchema: z.object({ result: z.string() }),
                handler: async (input: any) => ({ result: `flow2: ${input.text}` })
            }
        ];

        flows.forEach(flow => FlowRegistry.register(flow));

        const results = await UnifiedFlows.executeMultiple([
            { flowName: 'flow-1', input: { text: 'test1' } },
            { flowName: 'flow-2', input: { text: 'test2' } }
        ]);

        expect(results).toHaveLength(2);
        expect(results[0].success).toBe(true);
        expect(results[0].data).toEqual({ result: 'flow1: test1' });
        expect(results[1].success).toBe(true);
        expect(results[1].data).toEqual({ result: 'flow2: test2' });
    });

    test('يجب أن يعمل إعادة المحاولة بشكل صحيح', async () => {
        let attemptCount = 0;

        const failingFlow = {
            name: 'failing-flow',
            category: 'text-processing' as FlowCategory,
            description: 'تدفق فاشل',
            inputSchema: z.object({}),
            outputSchema: z.object({ result: z.string() }),
            handler: async (input: any) => {
                attemptCount++;
                if (attemptCount < 3) {
                    throw new Error('Temporary failure');
                }
                return { result: 'success' };
            }
        };

        FlowRegistry.register(failingFlow);

        const result = await UnifiedFlows.executeWithRetry(
            { flowName: 'failing-flow', input: {} },
            3,
            10 // تأخير قصير للاختبار
        );

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ result: 'success' });
        expect(attemptCount).toBe(3);
    });
});
```

## 🎯 أفضل الممارسات

### 1. استخدام التدفقات المناسبة

```typescript
/**
 * مثال: اختيار التدفق المناسب للمهمة
 */
async function chooseAppropriateFlow() {
    const task = 'تحليل نص طويل وتلخيصه';

    // ✅ جيد - استخدام التدفقات المناسبة
    const analysisResult = await analyzeContext({
        prompt: 'حلل هذا النص',
        contextFiles: [{ name: 'text.txt', content: 'نص طويل...', type: 'text' }]
    });

    const summaryResult = await summarizeText({
        text: 'نص طويل للتلخيص',
        maxLength: 200
    });

    // ❌ تجنب - استخدام تدفق غير مناسب
    // const wrongResult = await generateText({
    //     prompt: 'حلل هذا النص' // هذا ليس الغرض من generateText
    // });
}
```

### 2. معالجة الأخطاء الشاملة

```typescript
/**
 * مثال: معالجة شاملة للأخطاء
 */
async function comprehensiveErrorHandling() {
    try {
        const result = await UnifiedFlows.execute({
            flowName: 'grammar-checker',
            input: { text: 'نص للفحص' }
        });

        if (result.success) {
            // معالجة النجاح
            console.log('النتيجة:', result.data);
            return result.data;
        } else {
            // معالجة فشل التدفق
            console.error('فشل التدفق:', result.error);

            // محاولة تدفق بديل
            const alternativeResult = await UnifiedFlows.execute({
                flowName: 'ai-proofread-document',
                input: { text: 'نص للفحص' }
            });

            if (alternativeResult.success) {
                console.log('نجح التدفق البديل');
                return alternativeResult.data;
            }

            throw new Error(`فشل جميع التدفقات: ${result.error}`);
        }
    } catch (error) {
        // معالجة الأخطاء غير المتوقعة
        console.error('خطأ غير متوقع:', error);
        throw error;
    }
}
```

### 3. تحسين الأداء

```typescript
/**
 * مثال: تحسين أداء التنفيذ المتعدد
 */
async function optimizePerformance() {
    // ✅ جيد - تنفيذ متوازي للتدفقات المستقلة
    const independentTasks = [
        { flowName: 'grammar-checker', input: { text: 'نص 1' } },
        { flowName: 'summarize-text', input: { text: 'نص 2' } },
        { flowName: 'generate-text', input: { prompt: 'مطالبة' } }
    ];

    const results = await UnifiedFlows.executeMultiple(independentTasks);

    // ✅ جيد - تنفيذ متسلسل للتدفقات المعتمدة
    const dependentTasks = [
        { flowName: 'analyze-context', input: { prompt: 'حلل', contextFiles: [] } },
        { flowName: 'summarize-text', input: { text: 'نتيجة التحليل' } }
    ];

    for (const task of dependentTasks) {
        const result = await UnifiedFlows.execute(task);
        if (!result.success) {
            console.error('فشل في السلسلة:', result.error);
            break;
        }
    }
}
```

## 📚 الخلاصة

هذه الأمثلة توضح كيفية استخدام نظام التدفقات المصنف الجديد بشكل فعال. النظام يوفر:

- **مرونة في الاستخدام**: يمكن استخدام التدفقات مباشرة أو عبر الواجهة الموحدة
- **معالجة شاملة للأخطاء**: مع إعادة المحاولة والتدفقات البديلة
- **مراقبة الأداء**: مع إحصائيات مفصلة ومراقبة الوقت
- **اختبار شامل**: مع أمثلة للاختبارات الوحدة والتكامل
- **أفضل الممارسات**: لضمان الاستخدام الأمثل للنظام

النظام الجديد يجعل التعامل مع تدفقات الذكاء الاصطناعي أكثر سهولة وموثوقية، مع الحفاظ على جميع الوظائف الموجودة وإضافة ميزات جديدة قوية.
