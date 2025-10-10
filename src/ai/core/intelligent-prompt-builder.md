# Intelligent Prompt Builder - بناء المحفزات الذكي

## نظرة عامة

`IntelligentPromptBuilder` هو مكون متقدم لبناء محفزات ذكية ومخصصة للذكاء الاصطناعي. يقوم بتحليل السياق والمتطلبات لإنشاء محفزات محسنة تنتج مخرجات عالية الجودة.

## الوظائف الرئيسية

### 1. بناء System Prompt محسن
- تخصيص حسب نوع المحتوى
- تكييف حسب مستوى التعقيد
- تخصيص حسب الجمهور المستهدف
- مراعاة السياق الثقافي

### 2. تنظيم قسم السياق
- إضافة المتطلبات المحددة
- تنظيم السياق الخارجي
- إضافة المخرجات السابقة للتحسين
- ترتيب حسب الأهمية

### 3. بناء التعليمات المفصلة
- تعليمات حسب نوع المهمة
- معايير الجودة المطلوبة
- إرشادات التنسيق
- قيود ومحددات

### 4. إضافة الأمثلة والقيود
- أمثلة محددة حسب المجال
- قيود حسب مستوى التعقيد
- قيود حسب الجمهور
- إرشادات التنسيق

## API Reference

### IntelligentPromptBuilder.buildPrompt()

```typescript
/**
 * بناء prompt محسن بناءً على تحليل السياق
 * @param config - تكوين بناء المحفز
 * @param config.taskType - نوع المهمة المطلوبة
 * @param config.domain - المجال أو التخصص
 * @param config.contextAnalysis - نتيجة تحليل السياق
 * @param config.userInput - المدخل من المستخدم
 * @param config.externalContext - السياق الخارجي (اختياري)
 * @param config.previousOutput - المخرجات السابقة (اختياري)
 * @param config.iterationCount - رقم التكرار (اختياري)
 * @returns PromptTemplate - قالب المحفز المبني
 * @throws {Error} عند فشل بناء المحفز
 * @example
 * ```typescript
 * import { IntelligentPromptBuilder, ContextAnalyzer } from '@/ai/core';
 *
 * const contextAnalysis = await ContextAnalyzer.analyzeContext({
 *   userInput: "أنشئ خطة عمل لمشروع تقني"
 * });
 *
 * const promptTemplate = IntelligentPromptBuilder.buildPrompt({
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
 * console.log(promptTemplate.system); // System prompt محسن
 * console.log(promptTemplate.context); // قسم السياق
 * console.log(promptTemplate.instructions); // التعليمات المفصلة
 * ```
 */
static buildPrompt(config: PromptBuildingConfig): PromptTemplate
```

### IntelligentPromptBuilder.compilePrompt()

```typescript
/**
 * دمج جميع أجزاء الـ prompt في نص واحد
 * @param template - قالب المحفز المبني
 * @returns string - المحفز المدمج جاهز للاستخدام
 * @example
 * ```typescript
 * const promptTemplate = IntelligentPromptBuilder.buildPrompt(config);
 * const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);
 *
 * console.log(compiledPrompt);
 * // "أنت خبير متخصص في business ومساعد ذكي متقدم...
 * // --- السياق والمعلومات المتاحة ---
 * // **المتطلبات المحددة:**
 * // 1. يجب أن يكون المحتوى مهنياً
 * // ..."
 * ```
 */
static compilePrompt(template: PromptTemplate): string
```

## أنواع البيانات

### PromptTemplate

```typescript
/**
 * قالب المحفز المبني
 */
export interface PromptTemplate {
  /** System prompt محسن */
  system: string;

  /** قسم السياق والمعلومات */
  context: string;

  /** التعليمات المفصلة */
  instructions: string;

  /** الأمثلة للإرشاد (اختياري) */
  examples?: string;

  /** القيود والمحددات (اختياري) */
  constraints?: string;

  /** تنسيق المخرجات المطلوب (اختياري) */
  outputFormat?: string;
}
```

### PromptBuildingConfig

```typescript
/**
 * تكوين بناء المحفز
 */
export interface PromptBuildingConfig {
  /** نوع المهمة */
  taskType: 'generation' | 'analysis' | 'translation' | 'improvement';

  /** المجال أو التخصص */
  domain: string;

  /** نتيجة تحليل السياق */
  contextAnalysis: ContextAnalysisResult;

  /** المدخل من المستخدم */
  userInput: string;

  /** السياق الخارجي (اختياري) */
  externalContext?: Array<{ fileName: string; content: string; type: string }>;

  /** المخرجات السابقة (اختياري) */
  previousOutput?: string;

  /** رقم التكرار (اختياري) */
  iterationCount?: number;
}
```

## أمثلة الاستخدام

### 1. بناء محفز للمهام الإبداعية

```typescript
import { IntelligentPromptBuilder, ContextAnalyzer } from '@/ai/core';

const contextAnalysis = await ContextAnalyzer.analyzeContext({
  userInput: "اكتب قصة قصيرة عن المستقبل"
});

const promptTemplate = IntelligentPromptBuilder.buildPrompt({
  taskType: 'generation',
  domain: 'creative_writing',
  contextAnalysis,
  userInput: "اكتب قصة قصيرة عن المستقبل",
  guidelines: [
    "استخدم الخيال العلمي",
    "اجعل القصة مشوقة",
    "استخدم اللغة العربية الفصحى"
  ]
});

const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);
console.log(compiledPrompt);
```

### 2. بناء محفز للمهام التقنية

```typescript
const technicalAnalysis = await ContextAnalyzer.analyzeContext({
  userInput: "أنشئ نظام إدارة قاعدة بيانات"
});

const promptTemplate = IntelligentPromptBuilder.buildPrompt({
  taskType: 'generation',
  domain: 'software_engineering',
  contextAnalysis: technicalAnalysis,
  userInput: "أنشئ نظام إدارة قاعدة بيانات",
  externalContext: [
    {
      fileName: "database-schema.sql",
      content: "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));",
      type: "context"
    }
  ]
});

const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);
```

### 3. بناء محفز للتحليل

```typescript
const analysisTemplate = IntelligentPromptBuilder.buildPrompt({
  taskType: 'analysis',
  domain: 'business',
  contextAnalysis: await ContextAnalyzer.analyzeContext({
    userInput: "حلل بيانات المبيعات"
  }),
  userInput: "حلل بيانات المبيعات",
  externalContext: [
    {
      fileName: "sales-data.csv",
      content: "تاريخ,منتج,كمية,سعر\n2024-01-01,منتج أ,100,50",
      type: "context"
    }
  ]
});
```

### 4. بناء محفز للتحسين التكراري

```typescript
const improvementTemplate = IntelligentPromptBuilder.buildPrompt({
  taskType: 'improvement',
  domain: 'content_writing',
  contextAnalysis: await ContextAnalyzer.analyzeContext({
    userInput: "حسن هذا النص"
  }),
  userInput: "حسن هذا النص",
  previousOutput: "هذا نص يحتاج تحسين...",
  iterationCount: 2
});
```

## مكونات المحفز

### 1. System Prompt

```typescript
/**
 * بناء System Prompt محسن
 * @param contextAnalysis - نتيجة تحليل السياق
 * @param taskType - نوع المهمة
 * @param domain - المجال
 * @returns string - System prompt محسن
 */
private static buildSystemPrompt(
  contextAnalysis: ContextAnalysisResult,
  taskType: string,
  domain: string
): string
```

#### أمثلة System Prompts:

**للمهام التقنية:**
```
أنت خبير متخصص في software_engineering ومساعد ذكي متقدم.
لديك خبرة عميقة في التقنيات الحديثة والهندسة المعمارية للأنظمة.
تتعامل مع المفاهيم المعقدة والتحليلات المتقدمة بسهولة.
تقدم تفاصيل تقنية دقيقة ومفيدة للمطورين والمهندسين.
مهمتك هي إنتاج محتوى أصلي وعالي الجودة يلبي المتطلبات بدقة.
```

**للمهام الإبداعية:**
```
أنت خبير متخصص في creative_writing ومساعد ذكي متقدم.
لديك قدرات إبداعية عالية ومهارات في الكتابة الإبداعية.
تقدم شروحات واضحة ومفصلة.
تقدم محتوى مفهوم للجمهور العام.
مهمتك هي إنتاج محتوى أصلي وعالي الجودة يلبي المتطلبات بدقة.
```

### 2. قسم السياق

```typescript
/**
 * بناء قسم السياق
 * @param config - تكوين بناء المحفز
 * @returns string - قسم السياق المبني
 */
private static buildContextSection(config: PromptBuildingConfig): string
```

#### مثال قسم السياق:

```
--- السياق والمعلومات المتاحة ---

**المتطلبات المحددة:**
1. يجب أن يكون المحتوى مهنياً
2. استخدم اللغة العربية الفصحى
3. ركز على الجوانب العملية

**الملفات والمراجع المتاحة:**
--- requirements.txt (context) ---
متطلبات المشروع:
- نظام إدارة المستخدمين
- واجهة ويب حديثة
- قاعدة بيانات آمنة
---

**المخرجات السابقة للمراجعة:**
هذا نص يحتاج تحسين...
```

### 3. التعليمات المفصلة

```typescript
/**
 * بناء قسم التعليمات
 * @param config - تكوين بناء المحفز
 * @returns string - التعليمات المبينة
 */
private static buildInstructionsSection(config: PromptBuildingConfig): string
```

#### مثال التعليمات:

```
--- التعليمات المفصلة ---

**المهمة الأساسية:** أنشئ نظام إدارة قاعدة بيانات

**تعليمات التوليد:**
- قدم تفاصيل تقنية دقيقة
- استخدم المصطلحات التقنية المناسبة
- أضف أمثلة عملية عند الحاجة

**معايير الجودة:**
- تأكد من الدقة والشمولية
- استخدم مصادر موثوقة
- اتبع أفضل الممارسات في المجال
- راجع المخرجات قبل التسليم
```

### 4. القيود والمحددات

```typescript
/**
 * بناء قسم القيود
 * @param contextAnalysis - نتيجة تحليل السياق
 * @returns string - القيود المبينة
 */
private static buildConstraintsSection(contextAnalysis: ContextAnalysisResult): string
```

#### مثال القيود:

```
--- القيود والمحددات ---

- يمكن استخدام المصطلحات المتخصصة
- قدم تحليلات معمقة
- ركز على النتائج والتأثير
- كن موجزاً ومباشراً
```

### 5. تنسيق المخرجات

```typescript
/**
 * بناء قسم تنسيق المخرجات
 * @param contextAnalysis - نتيجة تحليل السياق
 * @param taskType - نوع المهمة
 * @returns string - تنسيق المخرجات
 */
private static buildOutputFormatSection(contextAnalysis: ContextAnalysisResult, taskType: string): string
```

#### مثال تنسيق المخرجات:

```
--- تنسيق المخرجات المطلوب ---

قدم المحتوى في تنسيق Markdown منظم مع:
- عناوين واضحة
- فقرات منطقية
- قوائم عند الحاجة
- تنسيق مناسب للمحتوى
```

## أفضل الممارسات

### 1. تقديم سياق مفصل
```typescript
// ✅ جيد - سياق مفصل
const promptTemplate = IntelligentPromptBuilder.buildPrompt({
  taskType: 'generation',
  domain: 'business',
  contextAnalysis,
  userInput: "أنشئ خطة عمل",
  externalContext: [
    {
      fileName: "market-analysis.pdf",
      content: "تحليل السوق...",
      type: "textbook"
    },
    {
      fileName: "competitors.xlsx",
      content: "بيانات المنافسين...",
      type: "context"
    }
  ],
  guidelines: [
    "ركز على الجوانب المالية",
    "استخدم البيانات المتاحة",
    "قدم جدول زمني واقعي"
  ]
});

// ❌ سيء - سياق محدود
const promptTemplate = IntelligentPromptBuilder.buildPrompt({
  taskType: 'generation',
  domain: 'business',
  contextAnalysis,
  userInput: "أنشئ خطة عمل"
});
```

### 2. استخدام المجال المناسب
```typescript
// ✅ جيد - مجال محدد
const promptTemplate = IntelligentPromptBuilder.buildPrompt({
  taskType: 'generation',
  domain: 'software_engineering', // مجال محدد
  contextAnalysis,
  userInput: "أنشئ نظام إدارة"
});

// ❌ سيء - مجال عام
const promptTemplate = IntelligentPromptBuilder.buildPrompt({
  taskType: 'generation',
  domain: 'general', // مجال عام جداً
  contextAnalysis,
  userInput: "أنشئ نظام إدارة"
});
```

### 3. استخدام التحسين التكراري
```typescript
// ✅ جيد - تحسين تكراري
const promptTemplate = IntelligentPromptBuilder.buildPrompt({
  taskType: 'improvement',
  domain: 'content_writing',
  contextAnalysis,
  userInput: "حسن هذا النص",
  previousOutput: "النص الحالي...",
  iterationCount: 2
});
```

## معالجة الأخطاء

### 1. أخطاء المدخلات
```typescript
try {
  const promptTemplate = IntelligentPromptBuilder.buildPrompt({
    taskType: 'invalid_type', // نوع مهمة غير صحيح
    domain: 'business',
    contextAnalysis,
    userInput: "نص صحيح"
  });
} catch (error) {
  console.error('خطأ في بناء المحفز:', error.message);
  // استخدام محفز افتراضي
}
```

### 2. أخطاء السياق الخارجي
```typescript
try {
  const promptTemplate = IntelligentPromptBuilder.buildPrompt({
    taskType: 'generation',
    domain: 'business',
    contextAnalysis,
    userInput: "نص صحيح",
    externalContext: [
      {
        fileName: "file.txt",
        content: null, // محتوى فارغ
        type: "context"
      }
    ]
  });
} catch (error) {
  console.error('خطأ في معالجة السياق الخارجي:', error.message);
}
```

## الاختبار

### 1. اختبار بناء المحفز
```typescript
import { IntelligentPromptBuilder, ContextAnalyzer } from '@/ai/core';

describe('IntelligentPromptBuilder', () => {
  test('should build prompt for generation task', async () => {
    const contextAnalysis = await ContextAnalyzer.analyzeContext({
      userInput: 'أنشئ خطة عمل'
    });

    const promptTemplate = IntelligentPromptBuilder.buildPrompt({
      taskType: 'generation',
      domain: 'business',
      contextAnalysis,
      userInput: 'أنشئ خطة عمل'
    });

    expect(promptTemplate.system).toContain('خبير متخصص');
    expect(promptTemplate.context).toContain('السياق والمعلومات المتاحة');
    expect(promptTemplate.instructions).toContain('المهمة الأساسية');
  });

  test('should compile prompt correctly', () => {
    const promptTemplate = {
      system: 'System prompt',
      context: 'Context section',
      instructions: 'Instructions section',
      examples: 'Examples section',
      constraints: 'Constraints section',
      outputFormat: 'Output format section'
    };

    const compiledPrompt = IntelligentPromptBuilder.compilePrompt(promptTemplate);

    expect(compiledPrompt).toContain('System prompt');
    expect(compiledPrompt).toContain('Context section');
    expect(compiledPrompt).toContain('Instructions section');
  });
});
```

### 2. اختبار التخصيص حسب نوع المهمة
```typescript
test('should customize prompt based on task type', async () => {
  const contextAnalysis = await ContextAnalyzer.analyzeContext({
    userInput: 'حلل البيانات'
  });

  const generationTemplate = IntelligentPromptBuilder.buildPrompt({
    taskType: 'generation',
    domain: 'data_analysis',
    contextAnalysis,
    userInput: 'حلل البيانات'
  });

  const analysisTemplate = IntelligentPromptBuilder.buildPrompt({
    taskType: 'analysis',
    domain: 'data_analysis',
    contextAnalysis,
    userInput: 'حلل البيانات'
  });

  expect(generationTemplate.instructions).toContain('إنتاج محتوى');
  expect(analysisTemplate.instructions).toContain('تحليل المعلومات');
});
```

## التطوير المستقبلي

### 1. تحسينات مقترحة
- دعم محفزات متعددة اللغات
- تحسين تخصيص المحفزات
- دعم المحفزات الديناميكية
- تحليل فعالية المحفزات

### 2. إضافة مكونات جديدة
- محلل فعالية المحفزات
- مولد المحفزات التلقائي
- محسن المحفزات
- محلل جودة المحفزات

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Intelligent Prompt Builder
