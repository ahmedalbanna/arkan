# Adaptive Model Selector - اختيار النماذج التكيفي

## نظرة عامة

`AdaptiveModelSelector` هو مكون ذكي يختار أفضل نموذج AI بناءً على نوع المهمة والسياق والمتطلبات. يوفر تكويناً تلقائياً للمعاملات ويضمن أفضل أداء وجودة للمخرجات.

## الوظائف الرئيسية

### 1. اختيار النموذج الأمثل
- تقييم النماذج المتاحة حسب المهمة
- حساب نقاط لكل نموذج بناءً على المعايير
- اختيار النموذج الأعلى نقاطاً

### 2. تكوين المعاملات التلقائي
- ضبط درجة الحرارة حسب نوع المهمة
- تحديد عدد الرموز المطلوبة
- تكوين معاملات التنويع

### 3. دعم النماذج الاحتياطية
- تحديد النماذج الاحتياطية لكل نموذج
- تبديل تلقائي عند الحاجة
- ضمان الاستمرارية

### 4. تحسين التكلفة والأداء
- موازنة بين الجودة والتكلفة
- اختيار النماذج الأكثر كفاءة
- تحسين استخدام الموارد

## API Reference

### AdaptiveModelSelector.selectOptimalModel()

```typescript
/**
 * اختيار النموذج الأمثل بناءً على السياق والمتطلبات
 * @param contextAnalysis - نتيجة تحليل السياق
 * @param taskType - نوع المهمة المطلوبة
 * @param additionalCriteria - معايير إضافية (اختياري)
 * @returns ModelConfig - تكوين النموذج المختار
 * @throws {Error} عند فشل اختيار النموذج
 * @example
 * ```typescript
 * import { AdaptiveModelSelector, ContextAnalyzer } from '@/ai/core';
 *
 * const contextAnalysis = await ContextAnalyzer.analyzeContext({
 *   userInput: "أنشئ خطة عمل لمشروع تقني"
 * });
 *
 * const modelConfig = AdaptiveModelSelector.selectOptimalModel(
 *   contextAnalysis,
 *   'generation'
 * );
 *
 * console.log(modelConfig.modelId); // "googleai/gemini-1.5-pro"
 * console.log(modelConfig.temperature); // 0.7
 * console.log(modelConfig.maxOutputTokens); // 8192
 * console.log(modelConfig.reasoning); // "تم اختيار النموذج للأسباب التالية: ..."
 * ```
 */
static selectOptimalModel(
  contextAnalysis: ContextAnalysisResult,
  taskType: ModelSelectionCriteria['taskType'],
  additionalCriteria?: Partial<ModelSelectionCriteria>
): ModelConfig
```

### AdaptiveModelSelector.getDefaultConfig()

```typescript
/**
 * الحصول على تكوين النموذج الافتراضي
 * @returns ModelConfig - التكوين الافتراضي
 * @example
 * ```typescript
 * const defaultConfig = AdaptiveModelSelector.getDefaultConfig();
 * console.log(defaultConfig);
 * // {
 * //   modelId: "googleai/gemini-2.0-flash",
 * //   temperature: 0.7,
 * //   maxOutputTokens: 8192,
 * //   topP: 0.9,
 * //   topK: 40,
 * //   reasoning: "تكوين افتراضي للمهام العامة"
 * // }
 * ```
 */
static getDefaultConfig(): ModelConfig
```

### AdaptiveModelSelector.adaptConfigBasedOnResults()

```typescript
/**
 * تحديث تكوين النموذج بناءً على النتائج السابقة
 * @param currentConfig - التكوين الحالي
 * @param qualityScore - نقاط الجودة المحققة
 * @param issues - المشاكل المكتشفة
 * @returns ModelConfig - التكوين المحدث
 * @example
 * ```typescript
 * const updatedConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
 *   currentConfig,
 *   65, // جودة منخفضة
 *   ['incomplete_content', 'unclear_language']
 * );
 *
 * console.log(updatedConfig.temperature); // أقل من السابق
 * console.log(updatedConfig.maxOutputTokens); // أكثر من السابق
 * ```
 */
static adaptConfigBasedOnResults(
  currentConfig: ModelConfig,
  qualityScore: number,
  issues: string[]
): ModelConfig
```

## أنواع البيانات

### ModelConfig

```typescript
/**
 * تكوين النموذج المختار
 */
export interface ModelConfig {
  /** معرف النموذج */
  modelId: string;

  /** درجة الحرارة (0-1) */
  temperature: number;

  /** الحد الأقصى لعدد الرموز المخرجة */
  maxOutputTokens: number;

  /** معامل التنويع (0-1) */
  topP?: number;

  /** عدد الخيارات الأعلى */
  topK?: number;

  /** تبرير اختيار النموذج */
  reasoning: string;
}
```

### ModelSelectionCriteria

```typescript
/**
 * معايير اختيار النموذج
 */
export interface ModelSelectionCriteria {
  /** نوع المهمة */
  taskType: 'generation' | 'analysis' | 'translation' | 'improvement' | 'creative' | 'technical';

  /** تعقيد المحتوى */
  contentComplexity: 'low' | 'medium' | 'high' | 'expert';

  /** طول المخرجات المتوقع */
  outputLength: 'short' | 'medium' | 'long' | 'very_long';

  /** متطلبات الدقة */
  accuracyRequirement: 'standard' | 'high' | 'critical';

  /** متطلبات السرعة */
  speedRequirement: 'fast' | 'balanced' | 'quality_first';

  /** حجم السياق */
  contextSize: number;

  /** متطلبات اللغة */
  languageRequirement: 'ar' | 'en' | 'multilingual';
}
```

## النماذج المدعومة

### 1. Gemini 2.0 Flash
- **المعرف**: `gemini-2.0-flash`
- **الاسم**: Gemini 2.0 Flash
- **نقاط القوة**: السرعة، الكفاءة، الأغراض العامة
- **نقاط الضعف**: التفكير المعقد
- **الحد الأقصى للرموز**: 8192
- **اللغات**: عربي، إنجليزي، متعدد اللغات
- **كفاءة التكلفة**: عالية

### 2. Gemini 1.5 Pro
- **المعرف**: `gemini-1.5-pro`
- **الاسم**: Gemini 1.5 Pro
- **نقاط القوة**: التفكير المعقد، الدقة، المهام الإبداعية، السياق الطويل
- **نقاط الضعف**: السرعة، التكلفة
- **الحد الأقصى للرموز**: 32768
- **اللغات**: عربي، إنجليزي، متعدد اللغات
- **كفاءة التكلفة**: متوسطة

### 3. Gemini Image Generation
- **المعرف**: `gemini-2.0-flash-preview-image-generation`
- **الاسم**: Gemini Image Generation
- **نقاط القوة**: توليد الصور، المحتوى المرئي
- **نقاط الضعف**: المهام النصية فقط
- **الحد الأقصى للرموز**: 4096
- **اللغات**: إنجليزي
- **كفاءة التكلفة**: متوسطة

## أمثلة الاستخدام

### 1. اختيار نموذج للمهمات الإبداعية

```typescript
import { AdaptiveModelSelector, ContextAnalyzer } from '@/ai/core';

const contextAnalysis = await ContextAnalyzer.analyzeContext({
  userInput: "اكتب قصة قصيرة عن المستقبل"
});

const modelConfig = AdaptiveModelSelector.selectOptimalModel(
  contextAnalysis,
  'creative'
);

console.log(modelConfig);
// {
//   modelId: "googleai/gemini-1.5-pro",
//   temperature: 0.9,
//   maxOutputTokens: 8192,
//   topP: 0.95,
//   topK: 40,
//   reasoning: "تم اختيار Gemini 1.5 Pro للأسباب التالية: دقة عالية مطلوبة، تعامل مع المحتوى المعقد"
// }
```

### 2. اختيار نموذج للمهام التقنية

```typescript
const technicalAnalysis = await ContextAnalyzer.analyzeContext({
  userInput: "أنشئ نظام إدارة قاعدة بيانات متقدم"
});

const modelConfig = AdaptiveModelSelector.selectOptimalModel(
  technicalAnalysis,
  'technical',
  {
    accuracyRequirement: 'critical',
    outputLength: 'very_long'
  }
);

console.log(modelConfig);
// {
//   modelId: "googleai/gemini-1.5-pro",
//   temperature: 0.3,
//   maxOutputTokens: 16384,
//   topP: 0.8,
//   topK: 20,
//   reasoning: "تم اختيار Gemini 1.5 Pro للأسباب التالية: دقة عالية مطلوبة، تعامل مع المحتوى المعقد، دعم المخرجات الطويلة"
// }
```

### 3. اختيار نموذج للمهام السريعة

```typescript
const quickAnalysis = await ContextAnalyzer.analyzeContext({
  userInput: "ترجم هذه الجملة إلى الإنجليزية"
});

const modelConfig = AdaptiveModelSelector.selectOptimalModel(
  quickAnalysis,
  'translation',
  {
    speedRequirement: 'fast',
    outputLength: 'short'
  }
);

console.log(modelConfig);
// {
//   modelId: "googleai/gemini-2.0-flash",
//   temperature: 0.2,
//   maxOutputTokens: 2048,
//   topP: 0.7,
//   topK: 40,
//   reasoning: "تم اختيار Gemini 2.0 Flash للأسباب التالية: سرعة في التنفيذ"
// }
```

### 4. تحديث التكوين بناءً على النتائج

```typescript
let currentConfig = AdaptiveModelSelector.getDefaultConfig();

// بعد الحصول على نتائج منخفضة الجودة
const updatedConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
  currentConfig,
  60, // جودة منخفضة
  ['incomplete_content', 'unclear_language']
);

console.log(updatedConfig);
// {
//   modelId: "googleai/gemini-2.0-flash",
//   temperature: 0.5, // تم تقليلها من 0.7
//   maxOutputTokens: 12288, // تم زيادتها من 8192
//   reasoning: "تكوين افتراضي للمهام العامة (تم تقليل الحرارة لتحسين الدقة) (تم زيادة طول المخرجات)"
// }
```

## خوارزمية الاختيار

### 1. حساب النقاط

```typescript
/**
 * تسجيل النموذج بناءً على المعايير
 * @param model - النموذج المراد تقييمه
 * @param criteria - معايير الاختيار
 * @returns number - نقاط النموذج
 */
private static scoreModel(model: any, criteria: ModelSelectionCriteria): number
```

#### عوامل التقييم:

1. **نوع المهمة** (30 نقطة)
   - إبداعية: نقاط إضافية للنماذج الإبداعية
   - تقنية: نقاط إضافية للنماذج التحليلية
   - ترجمة: نقاط إضافية للنماذج متعددة اللغات

2. **تعقيد المحتوى** (25 نقطة)
   - خبير/عالي: نقاط إضافية للنماذج المعقدة
   - أساسي/متوسط: نقاط إضافية للنماذج العامة

3. **متطلبات الدقة** (30 نقطة)
   - حرجة: نقاط إضافية للنماذج الدقيقة
   - عالية: نقاط إضافية للنماذج الدقيقة
   - معيارية: نقاط إضافية للنماذج العامة

4. **متطلبات السرعة** (25 نقطة)
   - سريعة: نقاط إضافية للنماذج السريعة
   - متوازنة: نقاط إضافية للنماذج الكفؤة
   - الجودة أولاً: نقاط إضافية للنماذج الدقيقة

5. **طول المخرجات** (20 نقطة)
   - طويل جداً: نقاط إضافية للنماذج ذات السياق الطويل
   - طويل: نقاط إضافية للنماذج ذات السعة العالية

6. **حجم السياق** (20 نقطة)
   - سياق كبير: نقاط إضافية للنماذج ذات السياق الطويل

7. **متطلبات اللغة** (15 نقطة)
   - متعدد اللغات: نقاط إضافية للنماذج متعددة اللغات
   - لغة محددة: نقاط إضافية للنماذج المدعومة

8. **كفاءة التكلفة** (10 نقاط)
   - عالية: نقاط إضافية للنماذج الكفؤة
   - متوسطة: نقاط إضافية للنماذج المتوسطة

### 2. تكوين المعاملات

```typescript
/**
 * تكوين النموذج المختار
 * @param model - النموذج المختار
 * @param criteria - معايير الاختيار
 * @returns ModelConfig - التكوين النهائي
 */
private static configureModel(model: any, criteria: ModelSelectionCriteria): ModelConfig
```

#### قواعد التكوين:

1. **درجة الحرارة**:
   - إبداعية: 0.9
   - تحليلية/تقنية: 0.3
   - ترجمة: 0.2
   - تحسين: 0.5
   - افتراضية: 0.7

2. **معامل التنويع**:
   - إبداعية: 0.95
   - تحليلية/تقنية: 0.8
   - ترجمة: 0.7
   - تحسين: 0.85
   - افتراضية: 0.9

3. **عدد الخيارات الأعلى**:
   - تحليلية/تقنية: 20
   - افتراضية: 40

4. **عدد الرموز المخرجة**:
   - قصيرة: 2048
   - متوسطة: 4096
   - طويلة: 8192
   - طويلة جداً: 16384

## أفضل الممارسات

### 1. اختيار نوع المهمة المناسب
```typescript
// ✅ جيد - نوع مهمة محدد
const modelConfig = AdaptiveModelSelector.selectOptimalModel(
  contextAnalysis,
  'technical' // نوع محدد
);

// ❌ سيء - نوع مهمة عام
const modelConfig = AdaptiveModelSelector.selectOptimalModel(
  contextAnalysis,
  'generation' // عام جداً
);
```

### 2. استخدام المعايير الإضافية
```typescript
// ✅ جيد - معايير إضافية محددة
const modelConfig = AdaptiveModelSelector.selectOptimalModel(
  contextAnalysis,
  'analysis',
  {
    accuracyRequirement: 'critical',
    outputLength: 'very_long',
    speedRequirement: 'quality_first'
  }
);

// ❌ سيء - بدون معايير إضافية
const modelConfig = AdaptiveModelSelector.selectOptimalModel(
  contextAnalysis,
  'analysis'
);
```

### 3. مراقبة النتائج وتحديث التكوين
```typescript
// ✅ جيد - تحديث التكوين بناءً على النتائج
let config = AdaptiveModelSelector.getDefaultConfig();

// بعد الحصول على نتائج
const qualityScore = 70;
const issues = ['incomplete_content'];

config = AdaptiveModelSelector.adaptConfigBasedOnResults(
  config,
  qualityScore,
  issues
);
```

## معالجة الأخطاء

### 1. أخطاء اختيار النموذج
```typescript
try {
  const modelConfig = AdaptiveModelSelector.selectOptimalModel(
    contextAnalysis,
    'invalid_task_type' // نوع مهمة غير صحيح
  );
} catch (error) {
  console.error('خطأ في اختيار النموذج:', error.message);
  // استخدام التكوين الافتراضي
  const fallbackConfig = AdaptiveModelSelector.getDefaultConfig();
}
```

### 2. أخطاء تحديث التكوين
```typescript
try {
  const updatedConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
    currentConfig,
    -1, // نقاط جودة غير صحيحة
    []
  );
} catch (error) {
  console.error('خطأ في تحديث التكوين:', error.message);
  // الاحتفاظ بالتكوين الحالي
}
```

## الاختبار

### 1. اختبار اختيار النموذج
```typescript
import { AdaptiveModelSelector, ContextAnalyzer } from '@/ai/core';

describe('AdaptiveModelSelector', () => {
  test('should select appropriate model for technical tasks', async () => {
    const contextAnalysis = await ContextAnalyzer.analyzeContext({
      userInput: 'أنشئ نظام إدارة قاعدة بيانات'
    });

    const modelConfig = AdaptiveModelSelector.selectOptimalModel(
      contextAnalysis,
      'technical'
    );

    expect(modelConfig.modelId).toBe('googleai/gemini-1.5-pro');
    expect(modelConfig.temperature).toBeLessThanOrEqual(0.3);
  });

  test('should select appropriate model for creative tasks', async () => {
    const contextAnalysis = await ContextAnalyzer.analyzeContext({
      userInput: 'اكتب قصة قصيرة'
    });

    const modelConfig = AdaptiveModelSelector.selectOptimalModel(
      contextAnalysis,
      'creative'
    );

    expect(modelConfig.temperature).toBeGreaterThanOrEqual(0.9);
    expect(modelConfig.topP).toBeGreaterThanOrEqual(0.95);
  });
});
```

### 2. اختبار تحديث التكوين
```typescript
test('should adapt config based on quality results', () => {
  const initialConfig = AdaptiveModelSelector.getDefaultConfig();

  const updatedConfig = AdaptiveModelSelector.adaptConfigBasedOnResults(
    initialConfig,
    60, // جودة منخفضة
    ['incomplete_content']
  );

  expect(updatedConfig.temperature).toBeLessThan(initialConfig.temperature);
  expect(updatedConfig.maxOutputTokens).toBeGreaterThan(initialConfig.maxOutputTokens);
});
```

## التطوير المستقبلي

### 1. تحسينات مقترحة
- دعم نماذج إضافية
- تحسين خوارزمية الاختيار
- دعم التكلفة الديناميكية
- تحليل الأداء التاريخي

### 2. إضافة مكونات جديدة
- محلل التكلفة
- محلل الأداء
- محلل الجودة المتوقع
- محلل السياق الزمني

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Adaptive Model Selector
