# Output Quality Validator - التحقق من جودة المخرجات

## نظرة عامة

`OutputQualityValidator` هو مكون متقدم لتقييم جودة المخرجات واقتراح التحسينات. يستخدم مقاييس متعددة لتقييم الجودة ويوفر تحليلاً شاملاً للمشاكل والتحسينات المطلوبة.

## الوظائف الرئيسية

### 1. تقييم شامل لجودة المخرجات
- مقاييس جودة متعددة (الاكتمال، الدقة، الصلة، الوضوح، الهيكل)
- حساب نقاط الجودة الإجمالية
- تحديد المشاكل والتحسينات المطلوبة
- إنتاج تقرير مفصل

### 2. تحديد مشاكل الجودة
- المحتوى المفقود
- اللغة غير الواضحة
- مشاكل الهيكل
- المحتوى غير ذي الصلة
- الأخطاء الواقعية

### 3. اقتراح التحسينات
- اقتراحات محددة حسب نوع المشاكل
- إرشادات للتحسين
- أولويات التحسين
- خطط العمل المقترحة

### 4. إنتاج محفزات التحسين
- محفزات مخصصة للتحسين
- تعليمات محددة للمشاكل
- إرشادات للتحسين
- قوالب التحسين

## API Reference

### OutputQualityValidator.validateOutput()

```typescript
/**
 * تقييم شامل لجودة المخرجات
 * @param output - المخرجات المراد تقييمها
 * @param originalInput - المدخل الأصلي
 * @param contextAnalysis - نتيجة تحليل السياق
 * @param expectedSchema - المخطط المتوقع (اختياري)
 * @returns Promise<ValidationResult> - نتيجة التقييم الشاملة
 * @throws {Error} عند فشل التقييم
 * @example
 * ```typescript
 * import { OutputQualityValidator, ContextAnalyzer } from '@/ai/core';
 *
 * const contextAnalysis = await ContextAnalyzer.analyzeContext({
 *   userInput: "أنشئ خطة عمل لمشروع تقني"
 * });
 *
 * const validation = await OutputQualityValidator.validateOutput(
 *   "هذه خطة عمل بسيطة...",
 *   "أنشئ خطة عمل لمشروع تقني",
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
  contextAnalysis: ContextAnalysisResult,
  expectedSchema?: any
): Promise<ValidationResult>
```

## أنواع البيانات

### ValidationResult

```typescript
/**
 * نتيجة التقييم الشاملة
 */
export interface ValidationResult {
  /** هل المخرجات صالحة */
  isValid: boolean;

  /** مقاييس الجودة */
  metrics: QualityMetrics;

  /** المشاكل المكتشفة */
  issues: QualityIssue[];

  /** الاقتراحات للتحسين */
  suggestions: string[];

  /** هل يحتاج تحسين */
  needsImprovement: boolean;

  /** محفز التحسين (اختياري) */
  improvementPrompt?: string;
}
```

### QualityMetrics

```typescript
/**
 * مقاييس الجودة
 */
export interface QualityMetrics {
  /** الاكتمال (0-100) */
  completeness: number;

  /** الدقة (0-100) */
  accuracy: number;

  /** الصلة (0-100) */
  relevance: number;

  /** الوضوح (0-100) */
  clarity: number;

  /** الهيكل (0-100) */
  structure: number;

  /** الإجمالي (0-100) */
  overall: number;
}
```

### QualityIssue

```typescript
/**
 * مشكلة جودة
 */
export interface QualityIssue {
  /** نوع المشكلة */
  type: 'missing_content' | 'unclear_language' | 'poor_structure' | 'irrelevant_content' | 'factual_error';

  /** شدة المشكلة */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** وصف المشكلة */
  description: string;

  /** الحل المقترح */
  suggestion: string;

  /** موقع المشكلة (اختياري) */
  location?: string;
}
```

## مقاييس الجودة

### 1. الاكتمال (Completeness)

```typescript
/**
 * تقييم اكتمال المحتوى
 * @param output - المخرجات
 * @param originalInput - المدخل الأصلي
 * @param contextAnalysis - تحليل السياق
 * @returns نقاط الاكتمال (0-100)
 */
private static assessCompleteness(
  output: string,
  originalInput: string,
  contextAnalysis: ContextAnalysisResult
): number
```

**عوامل التقييم:**
- طول المحتوى
- تغطية المتطلبات
- العناصر المطلوبة حسب نوع المحتوى
- الشمولية

**أمثلة:**
- محتوى قصير جداً: -30 نقطة
- محتوى طويل: +10 نقاط
- تغطية كاملة للمتطلبات: +30 نقطة

### 2. الدقة (Accuracy)

```typescript
/**
 * تقييم دقة المحتوى
 * @param output - المخرجات
 * @param contextAnalysis - تحليل السياق
 * @returns نقاط الدقة (0-100)
 */
private static assessAccuracy(output: string, contextAnalysis: ContextAnalysisResult): number
```

**عوامل التقييم:**
- التناقضات الداخلية
- صحة المصطلحات التقنية
- تناسق التواريخ والأرقام
- الدقة الواقعية

**أمثلة:**
- تناقضات داخلية: -20 نقطة
- مصطلحات تقنية خاطئة: -15 نقطة
- تواريخ غير متناسقة: -10 نقاط

### 3. الصلة (Relevance)

```typescript
/**
 * تقييم صلة المحتوى
 * @param output - المخرجات
 * @param originalInput - المدخل الأصلي
 * @param contextAnalysis - تحليل السياق
 * @returns نقاط الصلة (0-100)
 */
private static assessRelevance(
  output: string,
  originalInput: string,
  contextAnalysis: ContextAnalysisResult
): number
```

**عوامل التقييم:**
- الكلمات المفتاحية المشتركة
- الانحراف عن الموضوع
- الصلة بالسياق
- التطابق مع المتطلبات

**أمثلة:**
- كلمات مفتاحية مشتركة: +20 نقطة
- انحراف عن الموضوع: -15 نقطة
- صلة عالية بالسياق: +10 نقاط

### 4. الوضوح (Clarity)

```typescript
/**
 * تقييم وضوح المحتوى
 * @param output - المخرجات
 * @param contextAnalysis - تحليل السياق
 * @returns نقاط الوضوح (0-100)
 */
private static assessClarity(output: string, contextAnalysis: ContextAnalysisResult): number
```

**عوامل التقييم:**
- طول الجمل
- استخدام المصطلحات المعقدة
- التنظيم والهيكل
- الوضوح اللغوي

**أمثلة:**
- جمل طويلة جداً: -10 نقاط
- مصطلحات معقدة للجمهور الأساسي: -15 نقطة
- هيكل جيد: +10 نقاط

### 5. الهيكل (Structure)

```typescript
/**
 * تقييم هيكل المحتوى
 * @param output - المخرجات
 * @param contextAnalysis - تحليل السياق
 * @returns نقاط الهيكل (0-100)
 */
private static assessStructure(output: string, contextAnalysis: ContextAnalysisResult): number
```

**عوامل التقييم:**
- وجود العناوين
- تنظيم الفقرات
- وجود القوائم
- التدفق المنطقي

**أمثلة:**
- وجود عناوين: +15 نقطة
- فقرات منظمة: +10 نقاط
- وجود قوائم: +10 نقاط
- تدفق منطقي: +15 نقطة

## أمثلة الاستخدام

### 1. تقييم أساسي

```typescript
import { OutputQualityValidator, ContextAnalyzer } from '@/ai/core';

const contextAnalysis = await ContextAnalyzer.analyzeContext({
  userInput: "أنشئ خطة عمل لمشروع تقني"
});

const validation = await OutputQualityValidator.validateOutput(
  "هذه خطة عمل بسيطة تتضمن الأهداف والجدول الزمني.",
  "أنشئ خطة عمل لمشروع تقني",
  contextAnalysis
);

console.log(validation.metrics);
// {
//   completeness: 60,
//   accuracy: 85,
//   relevance: 70,
//   clarity: 80,
//   structure: 50,
//   overall: 69
// }

console.log(validation.issues);
// [
//   {
//     type: 'missing_content',
//     severity: 'high',
//     description: 'المحتوى يفتقر للتفاصيل المطلوبة',
//     suggestion: 'أضف المزيد من التفاصيل لتغطية جميع جوانب الموضوع'
//   }
// ]
```

### 2. تقييم متقدم

```typescript
const advancedValidation = await OutputQualityValidator.validateOutput(
  `# خطة عمل لمشروع تقني

## الأهداف
- تطوير نظام إدارة قاعدة بيانات
- إنشاء واجهة ويب حديثة
- تطبيق معايير الأمان

## الجدول الزمني
- المرحلة الأولى: 3 أشهر
- المرحلة الثانية: 2 شهر
- المرحلة الثالثة: 1 شهر

## الميزانية
- التطوير: 50,000 ريال
- البنية التحتية: 20,000 ريال
- الصيانة: 10,000 ريال

## المخاطر
- تأخير في التطوير
- مشاكل تقنية
- تجاوز الميزانية`,
  "أنشئ خطة عمل لمشروع تقني",
  contextAnalysis
);

console.log(advancedValidation.metrics);
// {
//   completeness: 90,
//   accuracy: 95,
//   relevance: 95,
//   clarity: 85,
//   structure: 95,
//   overall: 92
// }

console.log(advancedValidation.isValid); // true
console.log(advancedValidation.needsImprovement); // false
```

### 3. تقييم مع مخطط متوقع

```typescript
const expectedSchema = {
  type: 'object',
  required: ['objectives', 'timeline', 'budget', 'risks'],
  properties: {
    objectives: { type: 'array' },
    timeline: { type: 'object' },
    budget: { type: 'object' },
    risks: { type: 'array' }
  }
};

const validationWithSchema = await OutputQualityValidator.validateOutput(
  output,
  originalInput,
  contextAnalysis,
  expectedSchema
);
```

## أنواع المشاكل

### 1. المحتوى المفقود (Missing Content)

```typescript
/**
 * تحديد المحتوى المفقود
 * @param output - المخرجات
 * @param originalInput - المدخل الأصلي
 * @param contextAnalysis - تحليل السياق
 * @returns قائمة مشاكل المحتوى المفقود
 */
private static findMissingContent(
  output: string,
  originalInput: string,
  contextAnalysis: ContextAnalysisResult
): QualityIssue[]
```

**أمثلة:**
- متطلبات غير مغطاة
- عناصر مطلوبة مفقودة
- تفاصيل غير مكتملة

### 2. اللغة غير الواضحة (Unclear Language)

```typescript
/**
 * تحديد اللغة غير الواضحة
 * @param output - المخرجات
 * @param contextAnalysis - تحليل السياق
 * @returns قائمة مشاكل اللغة غير الواضحة
 */
private static findUnclearLanguage(output: string, contextAnalysis: ContextAnalysisResult): QualityIssue[]
```

**أمثلة:**
- جمل طويلة جداً
- مصطلحات معقدة غير مناسبة
- تعبيرات غامضة

### 3. مشاكل الهيكل (Structure Issues)

```typescript
/**
 * تحديد مشاكل الهيكل
 * @param output - المخرجات
 * @returns قائمة مشاكل الهيكل
 */
private static findStructureIssues(output: string): QualityIssue[]
```

**أمثلة:**
- عدم وجود عناوين
- فقرات غير منظمة
- عدم وجود قوائم

### 4. المحتوى غير ذي الصلة (Irrelevant Content)

```typescript
/**
 * تحديد المحتوى غير ذي الصلة
 * @param output - المخرجات
 * @param originalInput - المدخل الأصلي
 * @returns قائمة مشاكل المحتوى غير ذي الصلة
 */
private static findIrrelevantContent(output: string, originalInput: string): QualityIssue[]
```

**أمثلة:**
- انحراف عن الموضوع
- معلومات غير ذات صلة
- تفاصيل زائدة

## اقتراحات التحسين

### 1. اقتراحات عامة

```typescript
/**
 * إنتاج اقتراحات التحسين
 * @param issues - المشاكل المكتشفة
 * @param metrics - مقاييس الجودة
 * @returns قائمة الاقتراحات
 */
private static generateSuggestions(issues: QualityIssue[], metrics: QualityMetrics): string[]
```

**أمثلة الاقتراحات:**
- "أضف المزيد من التفاصيل لتغطية جميع جوانب الموضوع"
- "استخدم جملاً أقصر وأوضح"
- "نظم المحتوى بعناوين وفقرات واضحة"
- "استخدم القوائم لتنظيم المعلومات"

### 2. اقتراحات محددة حسب المشاكل

```typescript
// اقتراحات حسب نوع المشكلة
const suggestions = {
  missing_content: "أضف المحتوى المفقود",
  unclear_language: "حسن الوضوح اللغوي",
  poor_structure: "حسن التنظيم والهيكل",
  irrelevant_content: "ركز على الموضوع الأساسي",
  factual_error: "صحح المعلومات الخاطئة"
};
```

## محفزات التحسين

### 1. إنتاج محفز التحسين

```typescript
/**
 * إنتاج محفز للتحسين
 * @param output - المخرجات الحالية
 * @param issues - المشاكل المكتشفة
 * @param contextAnalysis - تحليل السياق
 * @returns محفز التحسين
 */
private static generateImprovementPrompt(
  output: string,
  issues: QualityIssue[],
  contextAnalysis: ContextAnalysisResult
): string
```

**مثال محفز التحسين:**

```
يرجى تحسين المحتوى التالي بناءً على المشاكل المحددة:

**المشاكل المحددة:**
1. المحتوى يفتقر للتفاصيل المطلوبة
   الحل المقترح: أضف المزيد من التفاصيل لتغطية جميع جوانب الموضوع

2. الجملة رقم 1 طويلة جداً (35 كلمة)
   الحل المقترح: قسم الجملة إلى جمل أقصر وأوضح

**المحتوى الحالي:**
هذا نص يحتاج تحسين...

**التعليمات:**
- احتفظ بالمعلومات الصحيحة الموجودة
- أضف المحتوى المفقود
- حسن الوضوح والتنظيم
- تأكد من الدقة والصلة بالموضوع
```

## أفضل الممارسات

### 1. استخدام التقييم المستمر

```typescript
// ✅ جيد - تقييم مستمر
let output = "محتوى أولي";
let validation = await OutputQualityValidator.validateOutput(output, input, contextAnalysis);

while (validation.needsImprovement && validation.improvementPrompt) {
  // تحسين المحتوى
  output = await improveContent(output, validation.improvementPrompt);

  // إعادة التقييم
  validation = await OutputQualityValidator.validateOutput(output, input, contextAnalysis);
}

// ❌ سيء - تقييم واحد فقط
const validation = await OutputQualityValidator.validateOutput(output, input, contextAnalysis);
```

### 2. استخدام المقاييس المتعددة

```typescript
// ✅ جيد - تحليل المقاييس المختلفة
const validation = await OutputQualityValidator.validateOutput(output, input, contextAnalysis);

console.log(`الاكتمال: ${validation.metrics.completeness}`);
console.log(`الدقة: ${validation.metrics.accuracy}`);
console.log(`الصلة: ${validation.metrics.relevance}`);
console.log(`الوضوح: ${validation.metrics.clarity}`);
console.log(`الهيكل: ${validation.metrics.structure}`);

// تحديد المجالات التي تحتاج تحسين
if (validation.metrics.completeness < 70) {
  console.log("يحتاج المزيد من التفاصيل");
}

if (validation.metrics.clarity < 70) {
  console.log("يحتاج تحسين الوضوح");
}
```

### 3. معالجة المشاكل حسب الأولوية

```typescript
// ✅ جيد - معالجة المشاكل حسب الأولوية
const criticalIssues = validation.issues.filter(issue => issue.severity === 'critical');
const highIssues = validation.issues.filter(issue => issue.severity === 'high');

// معالجة المشاكل الحرجة أولاً
criticalIssues.forEach(issue => {
  console.log(`مشكلة حرجة: ${issue.description}`);
  console.log(`الحل: ${issue.suggestion}`);
});

// ثم المشاكل العالية
highIssues.forEach(issue => {
  console.log(`مشكلة عالية: ${issue.description}`);
  console.log(`الحل: ${issue.suggestion}`);
});
```

## معالجة الأخطاء

### 1. أخطاء التقييم

```typescript
try {
  const validation = await OutputQualityValidator.validateOutput(
    output,
    input,
    contextAnalysis
  );
} catch (error) {
  console.error('خطأ في تقييم الجودة:', error.message);
  // استخدام تقييم افتراضي
  const fallbackValidation = {
    isValid: false,
    metrics: { overall: 0 },
    issues: [],
    suggestions: ['خطأ في التقييم'],
    needsImprovement: true
  };
}
```

### 2. أخطاء المدخلات

```typescript
try {
  const validation = await OutputQualityValidator.validateOutput(
    "", // مخرجات فارغة
    input,
    contextAnalysis
  );
} catch (error) {
  console.error('خطأ في المدخلات:', error.message);
}
```

## الاختبار

### 1. اختبار التقييم الأساسي

```typescript
import { OutputQualityValidator, ContextAnalyzer } from '@/ai/core';

describe('OutputQualityValidator', () => {
  test('should validate output correctly', async () => {
    const contextAnalysis = await ContextAnalyzer.analyzeContext({
      userInput: 'أنشئ خطة عمل'
    });

    const validation = await OutputQualityValidator.validateOutput(
      "هذه خطة عمل بسيطة",
      "أنشئ خطة عمل",
      contextAnalysis
    );

    expect(validation.isValid).toBeDefined();
    expect(validation.metrics.overall).toBeGreaterThanOrEqual(0);
    expect(validation.metrics.overall).toBeLessThanOrEqual(100);
    expect(validation.issues).toBeInstanceOf(Array);
    expect(validation.suggestions).toBeInstanceOf(Array);
  });

  test('should detect quality issues', async () => {
    const contextAnalysis = await ContextAnalyzer.analyzeContext({
      userInput: 'أنشئ خطة عمل مفصلة'
    });

    const validation = await OutputQualityValidator.validateOutput(
      "خطة بسيطة", // محتوى قصير جداً
      "أنشئ خطة عمل مفصلة",
      contextAnalysis
    );

    expect(validation.metrics.completeness).toBeLessThan(70);
    expect(validation.needsImprovement).toBe(true);
    expect(validation.issues.length).toBeGreaterThan(0);
  });
});
```

### 2. اختبار المقاييس المختلفة

```typescript
test('should assess different quality metrics', async () => {
  const contextAnalysis = await ContextAnalyzer.analyzeContext({
    userInput: 'أنشئ تقرير تقني'
  });

  const validation = await OutputQualityValidator.validateOutput(
    `# تقرير تقني

    ## المقدمة
    هذا تقرير تقني شامل.

    ## النتائج
    - النتيجة الأولى
    - النتيجة الثانية

    ## الخلاصة
    هذه خلاصة التقرير.`,
    "أنشئ تقرير تقني",
    contextAnalysis
  );

  expect(validation.metrics.structure).toBeGreaterThan(80); // هيكل جيد
  expect(validation.metrics.completeness).toBeGreaterThan(70); // محتوى مكتمل
  expect(validation.metrics.clarity).toBeGreaterThan(70); // واضح
});
```

## التطوير المستقبلي

### 1. تحسينات مقترحة
- دعم مقاييس جودة مخصصة
- تحسين خوارزمية التقييم
- دعم التقييم المتوازي
- تحليل الاتجاهات التاريخية

### 2. إضافة مكونات جديدة
- محلل الجودة المتقدم
- محسن التقييم
- نظام التوصيات الذكي
- محلل الاتجاهات

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Output Quality Validator
