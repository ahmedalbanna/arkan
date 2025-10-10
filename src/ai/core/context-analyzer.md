# Context Analyzer - تحليل السياق الذكي

## نظرة عامة

`ContextAnalyzer` هو مكون أساسي في نظام الذكاء الاصطناعي المحسن، يقوم بتحليل شامل للمدخلات والسياق الخارجي لتوفير فهم عميق للمتطلبات والسياق المطلوب للمهمة.

## الوظائف الرئيسية

### 1. تحليل نوع المحتوى
- تحديد نوع المحتوى المطلوب (تقني، تجاري، أكاديمي، إبداعي، مختلط)
- تحليل الكلمات المفتاحية والمصطلحات المتخصصة
- تصنيف المحتوى حسب المجال

### 2. تقييم مستوى التعقيد
- تحديد مستوى التعقيد المطلوب (أساسي، متوسط، متقدم، خبير)
- تحليل طول النص والمصطلحات المعقدة
- تقييم السياق الخارجي المتاح

### 3. تحديد الجمهور المستهدف
- تحديد الجمهور المستهدف (عام، تقني، تنفيذي، أكاديمي، طلاب)
- تحليل اللغة والمصطلحات المستخدمة
- تخصيص المحتوى حسب الجمهور

### 4. تحليل السياق الثقافي واللغوي
- تحديد اللغة الأساسية (عربي، إنجليزي)
- تحليل السياق الثقافي (شرق أوسطي، غربي، عالمي)
- تخصيص المحتوى حسب الثقافة

### 5. استخراج المتطلبات المحددة
- استخراج المتطلبات من النص باستخدام أنماط محددة
- دمج الإرشادات الخارجية
- تنظيم المتطلبات حسب الأولوية

### 6. تحليل السياق المتاح
- تحليل الملفات الخارجية المتاحة
- حساب صلة كل ملف بالمهمة
- تنظيم السياقات حسب الأهمية

### 7. توصية النموذج المناسب
- اختيار النموذج الأمثل حسب نوع المحتوى ومستوى التعقيد
- تحديد النموذج الاحتياطي
- تبرير الاختيار

## API Reference

### ContextAnalyzer.analyzeContext()

```typescript
/**
 * تحليل شامل للسياق والمتطلبات مع تنظيم السياقات حسب المعرفة
 * @param input - المدخلات المطلوب تحليلها
 * @param input.userInput - النص المدخل من المستخدم
 * @param input.projectType - نوع المشروع (اختياري)
 * @param input.externalContext - السياق الخارجي (اختياري)
 * @param input.guidelines - الإرشادات (اختياري)
 * @param input.previousOutput - المخرجات السابقة (اختياري)
 * @param input.targetSection - القسم المستهدف (اختياري)
 * @returns Promise<ContextAnalysisResult> - نتيجة التحليل الشاملة
 * @throws {Error} عند فشل التحليل
 * @example
 * ```typescript
 * const analysis = await ContextAnalyzer.analyzeContext({
 *   userInput: "أنشئ خطة عمل لمشروع تقني",
 *   projectType: "business",
 *   externalContext: [
 *     {
 *       fileName: "requirements.txt",
 *       content: "متطلبات المشروع...",
 *       type: "context"
 *     }
 *   ],
 *   guidelines: ["يجب أن يكون المحتوى مهنياً", "استخدم اللغة العربية"]
 * });
 *
 * console.log(analysis.contentType); // "business"
 * console.log(analysis.complexityLevel); // "intermediate"
 * console.log(analysis.targetAudience); // "executive"
 * ```
 */
static async analyzeContext(input: {
  userInput: string;
  projectType?: string;
  externalContext?: Array<{ fileName: string; content: string; type: string }>;
  guidelines?: string[];
  previousOutput?: string;
  targetSection?: string;
}): Promise<ContextAnalysisResult>
```

## أنواع البيانات

### ContextAnalysisResult

```typescript
/**
 * نتيجة تحليل السياق الشاملة
 */
export interface ContextAnalysisResult {
  /** نوع المحتوى المطلوب */
  contentType: 'technical' | 'business' | 'academic' | 'creative' | 'mixed';

  /** مستوى التعقيد المطلوب */
  complexityLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';

  /** الجمهور المستهدف */
  targetAudience: 'general' | 'technical' | 'executive' | 'academic' | 'student';

  /** اللغة والثقافة */
  language: 'ar' | 'en';
  culturalContext: 'middle-east' | 'western' | 'global';

  /** المتطلبات المحددة */
  specificRequirements: string[];

  /** السياق الخارجي المتاح */
  availableContext: {
    files: Array<{ name: string; type: string; relevance: number }>;
    previousSections: string[];
    guidelines: string[];
    organizedContext?: OrganizedContext;
  };

  /** التوصيات للنموذج */
  modelRecommendation: {
    primary: string;
    fallback: string;
    reasoning: string;
  };
}
```

## أمثلة الاستخدام

### 1. تحليل نص تقني

```typescript
import { ContextAnalyzer } from '@/ai/core';

const technicalAnalysis = await ContextAnalyzer.analyzeContext({
  userInput: "أنشئ نظام إدارة قاعدة بيانات باستخدام PostgreSQL مع واجهة ويب حديثة",
  projectType: "technical"
});

console.log(technicalAnalysis);
// {
//   contentType: "technical",
//   complexityLevel: "advanced",
//   targetAudience: "technical",
//   language: "ar",
//   culturalContext: "middle-east",
//   specificRequirements: [
//     "يجب أن يكون النظام يستخدم PostgreSQL",
//     "يجب أن تكون الواجهة حديثة"
//   ],
//   modelRecommendation: {
//     primary: "googleai/gemini-1.5-pro",
//     fallback: "googleai/gemini-2.0-flash",
//     reasoning: "Complex technical content requires advanced reasoning capabilities"
//   }
// }
```

### 2. تحليل نص تجاري

```typescript
const businessAnalysis = await ContextAnalyzer.analyzeContext({
  userInput: "أريد إنشاء خطة تسويقية لشركة ناشئة في مجال التكنولوجيا المالية",
  externalContext: [
    {
      fileName: "market-research.pdf",
      content: "دراسة السوق تشير إلى نمو 25% سنوياً...",
      type: "textbook"
    }
  ],
  guidelines: [
    "ركز على الجوانب المالية",
    "استخدم بيانات السوق المتاحة"
  ]
});

console.log(businessAnalysis.contentType); // "business"
console.log(businessAnalysis.targetAudience); // "executive"
```

### 3. تحليل نص أكاديمي

```typescript
const academicAnalysis = await ContextAnalyzer.analyzeContext({
  userInput: "اكتب بحثاً عن تأثير الذكاء الاصطناعي على التعليم العالي",
  projectType: "academic",
  guidelines: [
    "استخدم منهجية علمية",
    "قدم مراجع ومصادر",
    "اتبع المعايير الأكاديمية"
  ]
});

console.log(academicAnalysis.contentType); // "academic"
console.log(academicAnalysis.complexityLevel); // "expert"
console.log(academicAnalysis.targetAudience); // "academic"
```

## الدوال المساعدة

### detectLanguage()

```typescript
/**
 * تحديد اللغة بناءً على المحتوى
 * @param content - المحتوى المراد تحليله
 * @returns 'ar' | 'en' - اللغة المكتشفة
 * @example
 * ```typescript
 * const language = ContextAnalyzer.detectLanguage("مرحباً بك في النظام");
 * console.log(language); // "ar"
 * ```
 */
private static detectLanguage(content: string): 'ar' | 'en'
```

### detectContentType()

```typescript
/**
 * تحديد نوع المحتوى بناءً على الكلمات المفتاحية
 * @param input - النص المدخل
 * @returns نوع المحتوى المكتشف
 * @example
 * ```typescript
 * const type = ContextAnalyzer.detectContentType("أنشئ API للمستخدمين");
 * console.log(type); // "technical"
 * ```
 */
private static detectContentType(input: string): ContextAnalysisResult['contentType']
```

### assessComplexity()

```typescript
/**
 * تقييم مستوى التعقيد بناءً على عدة عوامل
 * @param input - النص المدخل
 * @param externalContext - السياق الخارجي
 * @returns مستوى التعقيد المقدر
 * @example
 * ```typescript
 * const complexity = ContextAnalyzer.assessComplexity(
 *   "أنشئ نظام معقد",
 *   [{ fileName: "docs.pdf", content: "...", type: "textbook" }]
 * );
 * console.log(complexity); // "advanced"
 * ```
 */
private static assessComplexity(
  input: string,
  externalContext?: Array<{ fileName: string; content: string; type: string }>
): ContextAnalysisResult['complexityLevel']
```

## أفضل الممارسات

### 1. تقديم سياق مفصل
```typescript
// ✅ جيد - سياق مفصل
const analysis = await ContextAnalyzer.analyzeContext({
  userInput: "أنشئ خطة عمل",
  projectType: "business",
  externalContext: [
    {
      fileName: "market-analysis.pdf",
      content: "تحليل السوق...",
      type: "textbook"
    }
  ],
  guidelines: [
    "ركز على الجوانب المالية",
    "استخدم البيانات المتاحة"
  ]
});

// ❌ سيء - سياق محدود
const analysis = await ContextAnalyzer.analyzeContext({
  userInput: "أنشئ خطة عمل"
});
```

### 2. استخدام الإرشادات المناسبة
```typescript
// ✅ جيد - إرشادات محددة
const guidelines = [
  "يجب أن يكون المحتوى مهنياً",
  "استخدم اللغة العربية الفصحى",
  "ركز على الجوانب العملية",
  "قدم أمثلة واقعية"
];

// ❌ سيء - إرشادات عامة
const guidelines = [
  "اكتب جيداً",
  "كن واضحاً"
];
```

### 3. تنظيم السياق الخارجي
```typescript
// ✅ جيد - تنظيم واضح
const externalContext = [
  {
    fileName: "requirements.txt",
    content: "متطلبات المشروع...",
    type: "context"
  },
  {
    fileName: "example.pdf",
    content: "مثال على التطبيق...",
    type: "example"
  },
  {
    fileName: "guidelines.md",
    content: "إرشادات التطوير...",
    type: "guidelines"
  }
];
```

## معالجة الأخطاء

### 1. أخطاء المدخلات
```typescript
try {
  const analysis = await ContextAnalyzer.analyzeContext({
    userInput: "", // نص فارغ
    externalContext: []
  });
} catch (error) {
  console.error('خطأ في تحليل السياق:', error.message);
  // معالجة الخطأ
}
```

### 2. أخطاء السياق الخارجي
```typescript
try {
  const analysis = await ContextAnalyzer.analyzeContext({
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

### 1. اختبار تحليل نوع المحتوى
```typescript
import { ContextAnalyzer } from '@/ai/core';

describe('ContextAnalyzer', () => {
  test('should detect technical content', async () => {
    const result = await ContextAnalyzer.analyzeContext({
      userInput: 'أنشئ API للمستخدمين باستخدام Node.js'
    });

    expect(result.contentType).toBe('technical');
    expect(result.targetAudience).toBe('technical');
  });

  test('should detect business content', async () => {
    const result = await ContextAnalyzer.analyzeContext({
      userInput: 'أنشئ خطة تسويقية لزيادة المبيعات'
    });

    expect(result.contentType).toBe('business');
    expect(result.targetAudience).toBe('executive');
  });
});
```

### 2. اختبار تحليل التعقيد
```typescript
test('should assess complexity correctly', async () => {
  const simpleResult = await ContextAnalyzer.analyzeContext({
    userInput: 'اكتب مقالاً قصيراً'
  });

  const complexResult = await ContextAnalyzer.analyzeContext({
    userInput: 'أنشئ نظام إدارة متكامل مع واجهة ويب حديثة وقاعدة بيانات متقدمة',
    externalContext: [
      { fileName: 'docs.pdf', content: 'محتوى معقد...', type: 'textbook' }
    ]
  });

  expect(simpleResult.complexityLevel).toBe('basic');
  expect(complexResult.complexityLevel).toBe('advanced');
});
```

## التطوير المستقبلي

### 1. تحسينات مقترحة
- دعم لغات إضافية
- تحليل المشاعر
- تحليل الكلمات المفتاحية المتقدمة
- دعم الملفات الصوتية والمرئية

### 2. إضافة مكونات جديدة
- محلل المشاعر
- محلل الكلمات المفتاحية
- محلل الجودة اللغوية
- محلل السياق الزمني

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Context Analyzer
