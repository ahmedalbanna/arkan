# Intelligent AI System - النظام الذكي الموحد

## نظرة عامة

`IntelligentAISystem` هو الواجهة الموحدة الرئيسية لنظام الذكاء الاصطناعي المحسن. يوفر واجهة بسيطة ومتكاملة لجميع مكونات النظام الذكي مع مراقبة شاملة للأداء.

## الوظائف الرئيسية

### 1. تشغيل التدفق الذكي الكامل
- تحليل السياق تلقائياً
- اختيار النموذج الأمثل
- بناء المحفزات الذكية
- التحسين التكراري
- مراقبة الأداء الشاملة

### 2. واجهات مساعدة سريعة
- تحليل سريع للسياق
- اختيار النموذج المناسب
- تقييم جودة المحتوى
- بناء المحفزات الذكية

### 3. مراقبة الأداء
- تقارير الأداء الشاملة
- إحصائيات سريعة
- تصدير البيانات
- إدارة البيانات

## API Reference

### IntelligentAISystem.runIntelligentFlow()

```typescript
/**
 * تشغيل تدفق ذكي كامل لتوليد المحتوى مع مراقبة الأداء
 * @param config - تكوين التدفق الذكي
 * @param config.userInput - المدخل من المستخدم
 * @param config.taskType - نوع المهمة
 * @param config.domain - المجال أو التخصص
 * @param config.externalContext - السياق الخارجي (اختياري)
 * @param config.guidelines - الإرشادات (اختياري)
 * @param config.qualityThreshold - حد الجودة المطلوبة (افتراضي: 85)
 * @param config.maxIterations - الحد الأقصى للتكرارات (افتراضي: 3)
 * @param config.enableIterativeImprovement - تفعيل التحسين التكراري (افتراضي: true)
 * @param config.enablePerformanceMonitoring - تفعيل مراقبة الأداء (افتراضي: true)
 * @returns Promise<any> - نتيجة التدفق الذكي
 * @throws {Error} عند فشل التدفق الذكي
 * @example
 * ```typescript
 * import { IntelligentAISystem } from '@/ai/core';
 *
 * const result = await IntelligentAISystem.runIntelligentFlow({
 *   userInput: "أنشئ خطة عمل لمشروع تقني",
 *   taskType: "generation",
 *   domain: "business",
 *   externalContext: [
 *     {
 *       fileName: "requirements.txt",
 *       content: "متطلبات المشروع...",
 *       type: "context"
 *     }
 *   ],
 *   guidelines: [
 *     "يجب أن يكون المحتوى مهنياً",
 *     "استخدم اللغة العربية الفصحى"
 *   ],
 *   qualityThreshold: 85,
 *   maxIterations: 3,
 *   enableIterativeImprovement: true,
 *   enablePerformanceMonitoring: true
 * });
 *
 * console.log(result.output); // المخرجات النهائية
 * console.log(result.qualityScore); // نقاط الجودة
 * console.log(result.iterations); // عدد التكرارات
 * console.log(result.modelUsed); // النموذج المستخدم
 * console.log(result.performanceMetrics); // مقاييس الأداء
 * ```
 */
static async runIntelligentFlow(config: {
  userInput: string;
  taskType: 'generation' | 'analysis' | 'translation' | 'improvement';
  domain: string;
  externalContext?: Array<{ fileName: string; content: string; type: string }>;
  guidelines?: string[];
  qualityThreshold?: number;
  maxIterations?: number;
  enableIterativeImprovement?: boolean;
  enablePerformanceMonitoring?: boolean;
})
```

### IntelligentAISystem.analyzeContext()

```typescript
/**
 * تحليل سريع للسياق فقط
 * @param userInput - المدخل من المستخدم
 * @param externalContext - السياق الخارجي (اختياري)
 * @returns Promise<ContextAnalysisResult> - نتيجة تحليل السياق
 * @example
 * ```typescript
 * const analysis = await IntelligentAISystem.analyzeContext(
 *   "أنشئ خطة عمل لمشروع تقني",
 *   [
 *     {
 *       fileName: "requirements.txt",
 *       content: "متطلبات المشروع...",
 *       type: "context"
 *     }
 *   ]
 * );
 *
 * console.log(analysis.contentType); // "business"
 * console.log(analysis.complexityLevel); // "intermediate"
 * console.log(analysis.targetAudience); // "executive"
 * console.log(analysis.language); // "ar"
 * ```
 */
static async analyzeContext(
  userInput: string,
  externalContext?: Array<{ fileName: string; content: string; type: string }>
)
```

### IntelligentAISystem.selectModel()

```typescript
/**
 * اختيار النموذج المناسب
 * @param contextAnalysis - نتيجة تحليل السياق
 * @param taskType - نوع المهمة
 * @returns ModelConfig - تكوين النموذج المختار
 * @example
 * ```typescript
 * const contextAnalysis = await IntelligentAISystem.analyzeContext("أنشئ خطة عمل");
 * const modelConfig = IntelligentAISystem.selectModel(contextAnalysis, 'generation');
 *
 * console.log(modelConfig.modelId); // "googleai/gemini-1.5-pro"
 * console.log(modelConfig.temperature); // 0.7
 * console.log(modelConfig.maxOutputTokens); // 8192
 * console.log(modelConfig.reasoning); // "تم اختيار النموذج للأسباب التالية: ..."
 * ```
 */
static selectModel(
  contextAnalysis: ContextAnalysisResult,
  taskType: 'generation' | 'analysis' | 'translation' | 'improvement'
)
```

### IntelligentAISystem.validateOutput()

```typescript
/**
 * تقييم جودة المحتوى
 * @param output - المخرجات المراد تقييمها
 * @param originalInput - المدخل الأصلي
 * @param contextAnalysis - تحليل السياق
 * @returns Promise<ValidationResult> - نتيجة التقييم
 * @example
 * ```typescript
 * const contextAnalysis = await IntelligentAISystem.analyzeContext("أنشئ خطة عمل");
 * const validation = await IntelligentAISystem.validateOutput(
 *   "هذه خطة عمل بسيطة...",
 *   "أنشئ خطة عمل",
 *   contextAnalysis
 * );
 *
 * console.log(validation.metrics.overall); // 75
 * console.log(validation.isValid); // true
 * console.log(validation.needsImprovement); // true
 * console.log(validation.issues.length); // 3
 * console.log(validation.suggestions); // ["أضف المزيد من التفاصيل..."]
 * ```
 */
static async validateOutput(
  output: string,
  originalInput: string,
  contextAnalysis: ContextAnalysisResult
)
```

### IntelligentAISystem.buildSmartPrompt()

```typescript
/**
 * بناء prompt ذكي
 * @param config - تكوين بناء المحفز
 * @param config.taskType - نوع المهمة
 * @param config.domain - المجال أو التخصص
 * @param config.contextAnalysis - تحليل السياق
 * @param config.userInput - المدخل من المستخدم
 * @param config.externalContext - السياق الخارجي (اختياري)
 * @returns string - المحفز الذكي المبني
 * @example
 * ```typescript
 * const contextAnalysis = await IntelligentAISystem.analyzeContext("أنشئ خطة عمل");
 * const smartPrompt = IntelligentAISystem.buildSmartPrompt({
 *   taskType: 'generation',
 *   domain: 'business',
 *   contextAnalysis,
 *   userInput: "أنشئ خطة عمل لمشروع تقني",
 *   externalContext: [
 *     {
 *       fileName: "requirements.txt",
 *       content: "متطلبات المشروع...",
 *       type: "context"
 *     }
 *   ]
 * });
 *
 * console.log(smartPrompt);
 * // "أنت خبير متخصص في business ومساعد ذكي متقدم...
 * // --- السياق والمعلومات المتاحة ---
 * // ..."
 * ```
 */
static buildSmartPrompt(config: {
  taskType: 'generation' | 'analysis' | 'translation' | 'improvement';
  domain: string;
  contextAnalysis: ContextAnalysisResult;
  userInput: string;
  externalContext?: Array<{ fileName: string; content: string; type: string }>;
})
```

## مساعدات سريعة

### AIHelpers.quickAnalyze()

```typescript
/**
 * تحليل سريع لنوع المحتوى
 * @param text - النص المراد تحليله
 * @returns Promise<{contentType: string; complexity: string; audience: string; language: string; recommendedModel: string}> - تحليل سريع
 * @example
 * ```typescript
 * import { AIHelpers } from '@/ai/core';
 *
 * const analysis = await AIHelpers.quickAnalyze("أنشئ نظام إدارة قاعدة بيانات");
 *
 * console.log(analysis);
 * // {
 * //   contentType: "technical",
 * //   complexity: "intermediate",
 * //   audience: "technical",
 * //   language: "ar",
 * //   recommendedModel: "googleai/gemini-1.5-pro"
 * // }
 * ```
 */
async quickAnalyze(text: string)
```

### AIHelpers.quickValidate()

```typescript
/**
 * تقييم سريع للجودة
 * @param output - المخرجات المراد تقييمها
 * @param input - المدخل الأصلي
 * @returns Promise<{score: number; isGood: boolean; needsImprovement: boolean; mainIssues: string[]}> - تقييم سريع
 * @example
 * ```typescript
 * const validation = await AIHelpers.quickValidate(
 *   "هذه خطة عمل بسيطة...",
 *   "أنشئ خطة عمل مفصلة"
 * );
 *
 * console.log(validation);
 * // {
 * //   score: 65,
 * //   isGood: false,
 * //   needsImprovement: true,
 * //   mainIssues: ["محتوى غير مكتمل", "يحتاج المزيد من التفاصيل"]
 * // }
 * ```
 */
async quickValidate(output: string, input: string)
```

### AIHelpers.suggestModel()

```typescript
/**
 * اقتراح النموذج المناسب
 * @param text - النص المراد تحليله
 * @param taskType - نوع المهمة
 * @returns Promise<{model: string; reasoning: string; temperature: number; maxTokens: number}> - اقتراح النموذج
 * @example
 * ```typescript
 * const suggestion = await AIHelpers.suggestModel(
 *   "أنشئ نظام إدارة قاعدة بيانات متقدم",
 *   "generation"
 * );
 *
 * console.log(suggestion);
 * // {
 * //   model: "googleai/gemini-1.5-pro",
 * //   reasoning: "Complex technical content requires advanced reasoning capabilities",
 * //   temperature: 0.3,
 * //   maxTokens: 8192
 * // }
 * ```
 */
async suggestModel(text: string, taskType: 'generation' | 'analysis' | 'translation' | 'improvement')
```

## أمثلة الاستخدام

### 1. استخدام التدفق الذكي الكامل

```typescript
import { IntelligentAISystem } from '@/ai/core';

const result = await IntelligentAISystem.runIntelligentFlow({
  userInput: "أنشئ خطة عمل لمشروع تقني",
  taskType: "generation",
  domain: "business",
  externalContext: [
    {
      fileName: "requirements.txt",
      content: "متطلبات المشروع: نظام إدارة المستخدمين، واجهة ويب حديثة، قاعدة بيانات آمنة",
      type: "context"
    },
    {
      fileName: "market-analysis.pdf",
      content: "تحليل السوق يشير إلى نمو 25% سنوياً في مجال التكنولوجيا المالية",
      type: "textbook"
    }
  ],
  guidelines: [
    "يجب أن يكون المحتوى مهنياً",
    "استخدم اللغة العربية الفصحى",
    "ركز على الجوانب المالية",
    "قدم جدول زمني واقعي"
  ],
  qualityThreshold: 85,
  maxIterations: 3,
  enableIterativeImprovement: true,
  enablePerformanceMonitoring: true
});

console.log(`المخرجات: ${result.output}`);
console.log(`نقاط الجودة: ${result.qualityScore}`);
console.log(`عدد التكرارات: ${result.iterations}`);
console.log(`النموذج المستخدم: ${result.modelUsed}`);
console.log(`وقت التنفيذ: ${result.performanceMetrics?.executionTime}ms`);
```

### 2. استخدام التحليل السريع

```typescript
import { AIHelpers } from '@/ai/core';

// تحليل سريع
const analysis = await AIHelpers.quickAnalyze("أنشئ نظام إدارة قاعدة بيانات متقدم");
console.log(`نوع المحتوى: ${analysis.contentType}`);
console.log(`مستوى التعقيد: ${analysis.complexity}`);
console.log(`الجمهور المستهدف: ${analysis.audience}`);
console.log(`اللغة: ${analysis.language}`);
console.log(`النموذج المقترح: ${analysis.recommendedModel}`);

// تقييم سريع
const validation = await AIHelpers.quickValidate(
  "هذه خطة عمل بسيطة تتضمن الأهداف والجدول الزمني.",
  "أنشئ خطة عمل مفصلة لمشروع تقني"
);
console.log(`نقاط الجودة: ${validation.score}`);
console.log(`هل الجودة جيدة: ${validation.isGood}`);
console.log(`يحتاج تحسين: ${validation.needsImprovement}`);
console.log(`المشاكل الرئيسية: ${validation.mainIssues.join(', ')}`);

// اقتراح النموذج
const suggestion = await AIHelpers.suggestModel(
  "أنشئ نظام إدارة قاعدة بيانات متقدم",
  "generation"
);
console.log(`النموذج المقترح: ${suggestion.model}`);
console.log(`السبب: ${suggestion.reasoning}`);
console.log(`درجة الحرارة: ${suggestion.temperature}`);
console.log(`الحد الأقصى للرموز: ${suggestion.maxTokens}`);
```

### 3. استخدام المكونات الفردية

```typescript
// تحليل السياق
const contextAnalysis = await IntelligentAISystem.analyzeContext(
  "أنشئ خطة عمل لمشروع تقني",
  [
    {
      fileName: "requirements.txt",
      content: "متطلبات المشروع...",
      type: "context"
    }
  ]
);

// اختيار النموذج
const modelConfig = IntelligentAISystem.selectModel(contextAnalysis, 'generation');

// بناء المحفز الذكي
const smartPrompt = IntelligentAISystem.buildSmartPrompt({
  taskType: 'generation',
  domain: 'business',
  contextAnalysis,
  userInput: "أنشئ خطة عمل لمشروع تقني",
  externalContext: [
    {
      fileName: "requirements.txt",
      content: "متطلبات المشروع...",
      type: "context"
    }
  ]
});

// تقييم الجودة
const validation = await IntelligentAISystem.validateOutput(
  "هذه خطة عمل بسيطة...",
  "أنشئ خطة عمل لمشروع تقني",
  contextAnalysis
);
```

### 4. مراقبة الأداء

```typescript
// الحصول على تقرير الأداء
const report = IntelligentAISystem.getPerformanceReport();
console.log(`إجمالي الجلسات: ${report.totalSessions}`);
console.log(`متوسط وقت التنفيذ: ${report.averageExecutionTime}ms`);
console.log(`متوسط نقاط الجودة: ${report.averageQualityScore}`);
console.log(`معدل النجاح: ${report.successRate}%`);

// إحصائيات سريعة
const stats = IntelligentAISystem.getQuickPerformanceStats();
console.log(`الجلسات النشطة: ${stats.activeSessions}`);
console.log(`الجلسات المكتملة: ${stats.completedSessions}`);
console.log(`متوسط الجودة اليوم: ${stats.avgQualityToday}`);
console.log(`متوسط وقت التنفيذ اليوم: ${stats.avgExecutionTimeToday}ms`);

// تصدير البيانات
const jsonData = IntelligentAISystem.exportPerformanceData('json');
const csvData = IntelligentAISystem.exportPerformanceData('csv');

// مسح البيانات القديمة
const removedCount = IntelligentAISystem.clearOldPerformanceData(30);
console.log(`تم حذف ${removedCount} جلسة قديمة`);
```

## أفضل الممارسات

### 1. استخدام التدفق الذكي للمهام المعقدة

```typescript
// ✅ جيد - استخدام التدفق الذكي للمهام المعقدة
const result = await IntelligentAISystem.runIntelligentFlow({
  userInput: "أنشئ خطة عمل شاملة لمشروع تقني معقد",
  taskType: "generation",
  domain: "business",
  externalContext: [
    {
      fileName: "requirements.txt",
      content: "متطلبات المشروع...",
      type: "context"
    },
    {
      fileName: "market-analysis.pdf",
      content: "تحليل السوق...",
      type: "textbook"
    }
  ],
  guidelines: [
    "يجب أن يكون المحتوى مهنياً",
    "استخدم اللغة العربية الفصحى"
  ],
  qualityThreshold: 85,
  maxIterations: 3,
  enableIterativeImprovement: true,
  enablePerformanceMonitoring: true
});

// ❌ سيء - استخدام التحليل السريع للمهام المعقدة
const analysis = await AIHelpers.quickAnalyze("أنشئ خطة عمل شاملة لمشروع تقني معقد");
```

### 2. استخدام المساعدات السريعة للمهام البسيطة

```typescript
// ✅ جيد - استخدام المساعدات السريعة للمهام البسيطة
const analysis = await AIHelpers.quickAnalyze("ترجم هذه الجملة");
const validation = await AIHelpers.quickValidate(output, input);
const suggestion = await AIHelpers.suggestModel(text, "translation");

// ❌ سيء - استخدام التدفق الذكي للمهام البسيطة
const result = await IntelligentAISystem.runIntelligentFlow({
  userInput: "ترجم هذه الجملة",
  taskType: "translation",
  domain: "language",
  qualityThreshold: 85,
  maxIterations: 3,
  enableIterativeImprovement: true,
  enablePerformanceMonitoring: true
});
```

### 3. مراقبة الأداء بانتظام

```typescript
// ✅ جيد - مراقبة منتظمة للأداء
const report = IntelligentAISystem.getPerformanceReport();

if (report.averageExecutionTime > 10000) {
  console.warn('الأداء بطيء - فكر في التحسين');
}

if (report.averageQualityScore < 70) {
  console.warn('جودة المخرجات منخفضة - راجع النماذج');
}

if (report.successRate < 0.9) {
  console.warn('معدل النجاح منخفض - راجع معالجة الأخطاء');
}

// تطبيق التوصيات
report.recommendations.forEach(recommendation => {
  console.log(`توصية: ${recommendation}`);
});
```

## معالجة الأخطاء

### 1. أخطاء التدفق الذكي

```typescript
try {
  const result = await IntelligentAISystem.runIntelligentFlow(config);
  return result;
} catch (error) {
  console.error('خطأ في التدفق الذكي:', error.message);

  // محاولة استخدام المساعدات السريعة كبديل
  try {
    const analysis = await AIHelpers.quickAnalyze(config.userInput);
    const suggestion = await AIHelpers.suggestModel(config.userInput, config.taskType);

    return {
      output: "تم إنتاج محتوى بديل",
      qualityScore: 60,
      iterations: 1,
      modelUsed: suggestion.model,
      fallbackUsed: true
    };
  } catch (fallbackError) {
    console.error('فشل البديل:', fallbackError.message);
    throw error;
  }
}
```

### 2. أخطاء المساعدات السريعة

```typescript
try {
  const analysis = await AIHelpers.quickAnalyze(text);
  return analysis;
} catch (error) {
  console.error('خطأ في التحليل السريع:', error.message);

  // استخدام قيم افتراضية
  return {
    contentType: "mixed",
    complexity: "intermediate",
    audience: "general",
    language: "ar",
    recommendedModel: "googleai/gemini-2.0-flash"
  };
}
```

## الاختبار

### 1. اختبار التدفق الذكي

```typescript
import { IntelligentAISystem } from '@/ai/core';

describe('IntelligentAISystem', () => {
  test('should run intelligent flow successfully', async () => {
    const result = await IntelligentAISystem.runIntelligentFlow({
      userInput: "أنشئ خطة عمل بسيطة",
      taskType: "generation",
      domain: "business",
      qualityThreshold: 70,
      maxIterations: 2,
      enableIterativeImprovement: false,
      enablePerformanceMonitoring: false
    });

    expect(result.output).toBeDefined();
    expect(result.qualityScore).toBeGreaterThan(0);
    expect(result.iterations).toBeGreaterThan(0);
    expect(result.modelUsed).toBeDefined();
  });

  test('should analyze context correctly', async () => {
    const analysis = await IntelligentAISystem.analyzeContext(
      "أنشئ نظام إدارة قاعدة بيانات"
    );

    expect(analysis.contentType).toBeDefined();
    expect(analysis.complexityLevel).toBeDefined();
    expect(analysis.targetAudience).toBeDefined();
    expect(analysis.language).toBeDefined();
  });
});
```

### 2. اختبار المساعدات السريعة

```typescript
import { AIHelpers } from '@/ai/core';

describe('AIHelpers', () => {
  test('should analyze text quickly', async () => {
    const analysis = await AIHelpers.quickAnalyze("أنشئ نظام إدارة");

    expect(analysis.contentType).toBeDefined();
    expect(analysis.complexity).toBeDefined();
    expect(analysis.audience).toBeDefined();
    expect(analysis.language).toBeDefined();
    expect(analysis.recommendedModel).toBeDefined();
  });

  test('should validate output quickly', async () => {
    const validation = await AIHelpers.quickValidate(
      "محتوى بسيط",
      "أنشئ محتوى مفصل"
    );

    expect(validation.score).toBeGreaterThanOrEqual(0);
    expect(validation.score).toBeLessThanOrEqual(100);
    expect(validation.isGood).toBeDefined();
    expect(validation.needsImprovement).toBeDefined();
    expect(validation.mainIssues).toBeInstanceOf(Array);
  });
});
```

## التطوير المستقبلي

### 1. تحسينات مقترحة
- دعم مهام إضافية
- تحسين خوارزمية الاختيار
- دعم التخصيص المتقدم
- تحليل الاتجاهات التاريخية

### 2. إضافة مكونات جديدة
- محلل الأداء المتقدم
- نظام التوصيات الذكي
- محلل التكلفة
- نظام التخصيص

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Intelligent AI System
