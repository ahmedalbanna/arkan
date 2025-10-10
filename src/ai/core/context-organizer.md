# Context Organizer - منظم السياقات

## نظرة عامة

`ContextOrganizer` هو مكون متقدم لتنظيم وترتيب السياقات المختلفة حسب المعرفة والأهمية. يقوم بتحليل السياقات وتجميعها وترتيبها في المطالبة بناءً على نوع المعرفة ومستوى الأهمية.

## الوظائف الرئيسية

### 1. تنظيم السياقات حسب المعرفة
- تصنيف السياقات حسب نوع المعرفة (أساسية، مفاهيمية، إجرائية، ما وراء معرفية)
- ترتيب السياقات حسب الأولوية المعرفية
- حساب درجات السياق الإجمالية

### 2. تحليل خصائص السياق
- تحديد مستوى المعرفة لكل سياق
- حساب صلة السياق بالمهمة المطلوبة
- تقييم تعقيد المحتوى
- استخراج المجال واللغة

### 3. تجميع وترتيب السياقات
- تجميع السياقات حسب نوع المعرفة
- ترتيب السياقات حسب الأولوية
- حساب الإحصائيات التفصيلية

### 4. إنتاج مطالبات منظمة
- إنشاء مطالبات منظمة من السياقات
- ترتيب المحتوى حسب الأهمية
- إضافة إحصائيات السياق

## API Reference

### ContextOrganizer.organizeContexts()

```typescript
/**
 * تنظيم السياقات حسب المعرفة والأهمية
 * @param contexts - السياقات المراد تنظيمها
 * @param targetSection - القسم المستهدف (اختياري)
 * @param userRequirements - متطلبات المستخدم (اختياري)
 * @returns OrganizedContext - السياقات المنظمة
 * @throws {Error} عند فشل التنظيم
 * @example
 * ```typescript
 * import { ContextOrganizer } from '@/ai/core';
 *
 * const contexts = [
 *   {
 *     fileName: "requirements.txt",
 *     content: "متطلبات المشروع...",
 *     type: "context"
 *   },
 *   {
 *     fileName: "example.pdf",
 *     content: "مثال على التطبيق...",
 *     type: "example"
 *   },
 *   {
 *     fileName: "guidelines.md",
 *     content: "إرشادات التطوير...",
 *     type: "guidelines"
 *   }
 * ];
 *
 * const organizedContext = ContextOrganizer.organizeContexts(
 *   contexts,
 *   "تطوير النظام",
 *   ["يجب أن يكون النظام آمناً", "يجب أن يكون سريعاً"]
 * );
 *
 * console.log(organizedContext.foundational.length); // السياقات الأساسية
 * console.log(organizedContext.conceptual.length); // السياقات المفاهيمية
 * console.log(organizedContext.procedural.length); // السياقات الإجرائية
 * console.log(organizedContext.statistics.totalItems); // إجمالي العناصر
 * ```
 */
static organizeContexts(
  contexts: ContextItem[],
  targetSection?: string,
  userRequirements?: string[]
): OrganizedContext
```

### createOrganizedPrompt()

```typescript
/**
 * دالة مساعدة لإنشاء مطالبة منظمة من السياقات المنظمة
 * @param organizedContext - السياقات المنظمة
 * @returns string - المطالبة المنظمة
 * @example
 * ```typescript
 * import { createOrganizedPrompt } from '@/ai/core';
 *
 * const organizedContext = ContextOrganizer.organizeContexts(contexts);
 * const organizedPrompt = createOrganizedPrompt(organizedContext);
 *
 * console.log(organizedPrompt);
 * // "## 📋 الإرشادات والتوجيهات
 * //
 * // ### إرشاد 1: guidelines.md
 * // إرشادات التطوير...
 * //
 * // ## 🏗️ المعرفة الأساسية
 * //
 * // ### requirements.txt
 * // متطلبات المشروع...
 * // ..."
 * ```
 */
export function createOrganizedPrompt(organizedContext: OrganizedContext): string
```

## أنواع البيانات

### ContextItem

```typescript
/**
 * عنصر سياق واحد
 */
export interface ContextItem {
  /** اسم الملف */
  fileName: string;

  /** محتوى السياق */
  content: string;

  /** نوع السياق */
  type: ContextType;

  /** صلة السياق (اختياري) */
  relevance?: number;

  /** مستوى المعرفة (اختياري) */
  knowledgeLevel?: KnowledgeLevel;

  /** أولوية السياق (اختياري) */
  priority?: ContextPriority;

  /** بيانات إضافية (اختياري) */
  metadata?: {
    wordCount?: number;
    complexity?: 'low' | 'medium' | 'high';
    domain?: string;
    language?: 'ar' | 'en';
  };
}
```

### OrganizedContext

```typescript
/**
 * السياقات المنظمة
 */
export interface OrganizedContext {
  /** السياقات الأساسية (الأولوية العالية) */
  foundational: ContextItem[];

  /** السياقات المفاهيمية (الأولوية المتوسطة) */
  conceptual: ContextItem[];

  /** السياقات الإجرائية (الأولوية المتوسطة) */
  procedural: ContextItem[];

  /** السياقات المرجعية (الأولوية المنخفضة) */
  reference: ContextItem[];

  /** السياقات الإرشادية (أولوية خاصة) */
  guidelines: ContextItem[];

  /** إحصائيات التنظيم */
  statistics: {
    totalItems: number;
    byType: Record<ContextType, number>;
    byPriority: Record<ContextPriority, number>;
    averageRelevance: number;
  };
}
```

### ContextType

```typescript
/**
 * أنواع السياق المختلفة
 */
export type ContextType = 'context' | 'example' | 'question' | 'textbook' | 'guidelines';
```

### KnowledgeLevel

```typescript
/**
 * مستويات المعرفة
 */
export type KnowledgeLevel = 'foundational' | 'conceptual' | 'procedural' | 'metacognitive';
```

### ContextPriority

```typescript
/**
 * أولويات السياق
 */
export type ContextPriority = 'critical' | 'important' | 'supporting' | 'reference';
```

## أنواع السياق وأوزانها

### 1. الإرشادات (Guidelines)
- **الوزن**: 0.95 (الأعلى)
- **الأولوية**: حرجة
- **الوصف**: الإرشادات والتوجيهات المطلوبة

### 2. الكتب المرجعية (Textbook)
- **الوزن**: 0.85
- **الأولوية**: مهمة
- **الوصف**: المعرفة الأساسية والمفاهيم

### 3. السياق العام (Context)
- **الوزن**: 0.75
- **الأولوية**: داعمة
- **الوصف**: السياق العام والمعلومات الأساسية

### 4. الأمثلة (Example)
- **الوزن**: 0.65
- **الأولوية**: داعمة
- **الوصف**: أمثلة تطبيقية وعملية

### 5. الأسئلة (Question)
- **الوزن**: 0.55
- **الأولوية**: مرجعية
- **الوصف**: أسئلة واستفسارات

## مستويات المعرفة

### 1. المعرفة الأساسية (Foundational)
- **الوزن**: 0.9 (الأعلى)
- **الوصف**: التعريفات والمفاهيم الأساسية
- **المؤشرات**: تعريفات، مفاهيم أساسية، مصطلحات

### 2. المعرفة المفاهيمية (Conceptual)
- **الوزن**: 0.8
- **الوصف**: النظريات والمبادئ
- **المؤشرات**: نظريات، مبادئ، أطر عمل، نماذج

### 3. المعرفة الإجرائية (Procedural)
- **الوزن**: 0.7
- **الوصف**: الخطوات والإجراءات
- **المؤشرات**: خطوات، عمليات، إجراءات، طرق

### 4. المعرفة ما وراء المعرفية (Metacognitive)
- **الوزن**: 0.6
- **الوصف**: التفكير والتحليل
- **المؤشرات**: تحليل، تقييم، نقد، تفكير

## أمثلة الاستخدام

### 1. تنظيم أساسي

```typescript
import { ContextOrganizer } from '@/ai/core';

const contexts = [
  {
    fileName: "project-requirements.txt",
    content: "متطلبات المشروع: نظام إدارة المستخدمين، واجهة ويب حديثة، قاعدة بيانات آمنة",
    type: "context" as const
  },
  {
    fileName: "user-management-example.md",
    content: "مثال على إدارة المستخدمين: تسجيل الدخول، إنشاء حساب، إدارة الصلاحيات",
    type: "example" as const
  },
  {
    fileName: "development-guidelines.md",
    content: "إرشادات التطوير: استخدم TypeScript، اتبع معايير الأمان، اختبر الكود",
    type: "guidelines" as const
  }
];

const organizedContext = ContextOrganizer.organizeContexts(contexts);

console.log(`إجمالي العناصر: ${organizedContext.statistics.totalItems}`);
console.log(`السياقات الأساسية: ${organizedContext.foundational.length}`);
console.log(`السياقات المفاهيمية: ${organizedContext.conceptual.length}`);
console.log(`السياقات الإجرائية: ${organizedContext.procedural.length}`);
console.log(`الإرشادات: ${organizedContext.guidelines.length}`);
```

### 2. تنظيم مع متطلبات محددة

```typescript
const contextsWithRequirements = [
  {
    fileName: "database-schema.sql",
    content: "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100));",
    type: "textbook" as const
  },
  {
    fileName: "api-example.json",
    content: '{"endpoint": "/api/users", "method": "GET", "response": {"users": []}}',
    type: "example" as const
  },
  {
    fileName: "security-guidelines.md",
    content: "إرشادات الأمان: تشفير كلمات المرور، التحقق من الصلاحيات، حماية من SQL Injection",
    type: "guidelines" as const
  }
];

const organizedContext = ContextOrganizer.organizeContexts(
  contextsWithRequirements,
  "تطوير API للمستخدمين",
  [
    "يجب أن يكون API آمناً",
    "يجب أن يدعم CRUD operations",
    "يجب أن يكون سريعاً"
  ]
);

console.log(`متوسط الصلة: ${organizedContext.statistics.averageRelevance}`);
console.log(`التوزيع حسب النوع:`, organizedContext.statistics.byType);
console.log(`التوزيع حسب الأولوية:`, organizedContext.statistics.byPriority);
```

### 3. إنشاء مطالبة منظمة

```typescript
import { createOrganizedPrompt } from '@/ai/core';

const organizedContext = ContextOrganizer.organizeContexts(contexts);
const organizedPrompt = createOrganizedPrompt(organizedContext);

console.log(organizedPrompt);
```

**مثال المخرجات:**

```
## 📋 الإرشادات والتوجيهات

### إرشاد 1: security-guidelines.md
إرشادات الأمان: تشفير كلمات المرور، التحقق من الصلاحيات، حماية من SQL Injection

## 🏗️ المعرفة الأساسية

### database-schema.sql
CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100));

## 💡 المعرفة المفاهيمية

### project-requirements.txt
متطلبات المشروع: نظام إدارة المستخدمين، واجهة ويب حديثة، قاعدة بيانات آمنة

## ⚙️ المعرفة الإجرائية

### user-management-example.md
مثال على إدارة المستخدمين: تسجيل الدخول، إنشاء حساب، إدارة الصلاحيات

### api-example.json
{"endpoint": "/api/users", "method": "GET", "response": {"users": []}}

## 📚 المراجع الإضافية

### development-guidelines.md
إرشادات التطوير: استخدم TypeScript، اتبع معايير الأمان، اختبر الكود

## 📊 إحصائيات السياق

- إجمالي العناصر: 6
- متوسط الصلة: 0.75
- التوزيع حسب النوع: context: 1, example: 2, textbook: 1, guidelines: 2, question: 0
```

### 4. تنظيم مع تحليل متقدم

```typescript
const advancedContexts = [
  {
    fileName: "architecture-overview.md",
    content: "نظرة عامة على المعمارية: استخدام Microservices، قاعدة بيانات موزعة، API Gateway",
    type: "textbook" as const,
    metadata: {
      wordCount: 150,
      complexity: "high" as const,
      domain: "software_architecture",
      language: "ar" as const
    }
  },
  {
    fileName: "deployment-steps.md",
    content: "خطوات النشر: 1. بناء التطبيق 2. تشغيل الاختبارات 3. نشر في البيئة المستهدفة",
    type: "example" as const,
    metadata: {
      wordCount: 80,
      complexity: "medium" as const,
      domain: "devops",
      language: "ar" as const
    }
  },
  {
    fileName: "code-review-questions.md",
    content: "أسئلة مراجعة الكود: هل الكود قابل للقراءة؟ هل الاختبارات شاملة؟ هل يتبع المعايير؟",
    type: "question" as const,
    metadata: {
      wordCount: 60,
      complexity: "low" as const,
      domain: "code_quality",
      language: "ar" as const
    }
  }
];

const organizedContext = ContextOrganizer.organizeContexts(
  advancedContexts,
  "تطوير نظام متقدم",
  [
    "يجب أن يكون النظام قابل للتوسع",
    "يجب أن يكون آمناً",
    "يجب أن يكون سهل الصيانة"
  ]
);

// تحليل النتائج
console.log('السياقات الأساسية:');
organizedContext.foundational.forEach(context => {
  console.log(`- ${context.fileName}: ${context.metadata?.domain} (${context.metadata?.complexity})`);
});

console.log('السياقات المفاهيمية:');
organizedContext.conceptual.forEach(context => {
  console.log(`- ${context.fileName}: ${context.metadata?.domain} (${context.metadata?.complexity})`);
});

console.log('السياقات الإجرائية:');
organizedContext.procedural.forEach(context => {
  console.log(`- ${context.fileName}: ${context.metadata?.domain} (${context.metadata?.complexity})`);
});
```

## خوارزمية التنظيم

### 1. تحليل السياق

```typescript
/**
 * تحليل سياق واحد وتحديد خصائصه المعرفية
 * @param context - السياق المراد تحليله
 * @param targetSection - القسم المستهدف
 * @param userRequirements - متطلبات المستخدم
 * @returns ContextItem - السياق المحلل
 */
private static analyzeContext(
  context: ContextItem,
  targetSection?: string,
  userRequirements?: string[]
): ContextItem
```

**خطوات التحليل:**
1. حساب صلة السياق بالمهمة
2. تحديد مستوى المعرفة
3. تحديد أولوية السياق
4. تحليل البيانات الإضافية

### 2. حساب درجة السياق

```typescript
/**
 * حساب درجة السياق الإجمالية
 * @param context - السياق المراد تقييمه
 * @returns number - درجة السياق
 */
private static calculateContextScore(context: ContextItem): number
```

**عوامل التقييم:**
- وزن نوع السياق (30%)
- وزن مستوى المعرفة (30%)
- وزن الصلة (25%)
- وزن الأولوية (15%)

### 3. ترتيب السياقات

```typescript
/**
 * ترتيب السياقات حسب الأولوية المعرفية
 * @param analyzedContexts - السياقات المحللة
 * @returns ContextItem[] - السياقات المرتبة
 */
private static sortContextsByPriority(analyzedContexts: ContextItem[]): ContextItem[]
```

### 4. تجميع السياقات

```typescript
/**
 * تجميع السياقات حسب نوع المعرفة
 * @param sortedContexts - السياقات المرتبة
 * @returns OrganizedContext - السياقات المجمعة
 */
private static groupByKnowledgeType(sortedContexts: ContextItem[]): OrganizedContext
```

## أفضل الممارسات

### 1. تنظيم السياقات حسب الأهمية

```typescript
// ✅ جيد - تنظيم واضح
const contexts = [
  {
    fileName: "requirements.txt",
    content: "متطلبات المشروع...",
    type: "context"
  },
  {
    fileName: "guidelines.md",
    content: "إرشادات التطوير...",
    type: "guidelines"
  },
  {
    fileName: "example.md",
    content: "مثال على التطبيق...",
    type: "example"
  }
];

// ❌ سيء - تنظيم غير واضح
const contexts = [
  {
    fileName: "file1.txt",
    content: "محتوى غير محدد...",
    type: "context"
  },
  {
    fileName: "file2.txt",
    content: "محتوى آخر...",
    type: "context"
  }
];
```

### 2. استخدام البيانات الإضافية

```typescript
// ✅ جيد - بيانات إضافية مفيدة
const context = {
  fileName: "architecture.md",
  content: "معمارية النظام...",
  type: "textbook",
  metadata: {
    wordCount: 500,
    complexity: "high",
    domain: "software_architecture",
    language: "ar"
  }
};

// ❌ سيء - بدون بيانات إضافية
const context = {
  fileName: "file.txt",
  content: "محتوى...",
  type: "context"
};
```

### 3. تحديد المتطلبات بوضوح

```typescript
// ✅ جيد - متطلبات محددة
const userRequirements = [
  "يجب أن يكون النظام آمناً",
  "يجب أن يدعم المستخدمين المتعددين",
  "يجب أن يكون سريعاً"
];

// ❌ سيء - متطلبات عامة
const userRequirements = [
  "يجب أن يكون جيداً",
  "يجب أن يعمل بشكل صحيح"
];
```

## معالجة الأخطاء

### 1. أخطاء المدخلات

```typescript
try {
  const organizedContext = ContextOrganizer.organizeContexts(contexts);
} catch (error) {
  console.error('خطأ في تنظيم السياقات:', error.message);
  // معالجة الخطأ
}
```

### 2. أخطاء البيانات الإضافية

```typescript
try {
  const context = {
    fileName: "file.txt",
    content: "محتوى...",
    type: "context",
    metadata: {
      wordCount: -1, // قيمة غير صحيحة
      complexity: "invalid" // قيمة غير صحيحة
    }
  };

  const organizedContext = ContextOrganizer.organizeContexts([context]);
} catch (error) {
  console.error('خطأ في البيانات الإضافية:', error.message);
}
```

## الاختبار

### 1. اختبار التنظيم الأساسي

```typescript
import { ContextOrganizer } from '@/ai/core';

describe('ContextOrganizer', () => {
  test('should organize contexts correctly', () => {
    const contexts = [
      {
        fileName: "requirements.txt",
        content: "متطلبات المشروع",
        type: "context" as const
      },
      {
        fileName: "guidelines.md",
        content: "إرشادات التطوير",
        type: "guidelines" as const
      },
      {
        fileName: "example.md",
        content: "مثال على التطبيق",
        type: "example" as const
      }
    ];

    const organizedContext = ContextOrganizer.organizeContexts(contexts);

    expect(organizedContext.statistics.totalItems).toBe(3);
    expect(organizedContext.guidelines.length).toBe(1);
    expect(organizedContext.foundational.length).toBeGreaterThanOrEqual(0);
    expect(organizedContext.conceptual.length).toBeGreaterThanOrEqual(0);
    expect(organizedContext.procedural.length).toBeGreaterThanOrEqual(0);
  });

  test('should prioritize guidelines correctly', () => {
    const contexts = [
      {
        fileName: "guidelines.md",
        content: "إرشادات التطوير",
        type: "guidelines" as const
      },
      {
        fileName: "example.md",
        content: "مثال على التطبيق",
        type: "example" as const
      }
    ];

    const organizedContext = ContextOrganizer.organizeContexts(contexts);

    expect(organizedContext.guidelines.length).toBe(1);
    expect(organizedContext.guidelines[0].fileName).toBe("guidelines.md");
  });
});
```

### 2. اختبار إنشاء المطالبة المنظمة

```typescript
import { createOrganizedPrompt } from '@/ai/core';

test('should create organized prompt correctly', () => {
  const contexts = [
    {
      fileName: "guidelines.md",
      content: "إرشادات التطوير",
      type: "guidelines" as const
    },
    {
      fileName: "requirements.txt",
      content: "متطلبات المشروع",
      type: "context" as const
    }
  ];

  const organizedContext = ContextOrganizer.organizeContexts(contexts);
  const organizedPrompt = createOrganizedPrompt(organizedContext);

  expect(organizedPrompt).toContain('## 📋 الإرشادات والتوجيهات');
  expect(organizedPrompt).toContain('## 🏗️ المعرفة الأساسية');
  expect(organizedPrompt).toContain('## 📊 إحصائيات السياق');
  expect(organizedPrompt).toContain('إجمالي العناصر: 2');
});
```

## التطوير المستقبلي

### 1. تحسينات مقترحة
- دعم أنواع سياق إضافية
- تحسين خوارزمية التقييم
- دعم التنظيم المتوازي
- تحليل الاتجاهات التاريخية

### 2. إضافة مكونات جديدة
- محلل السياق المتقدم
- محسن التنظيم
- نظام التوصيات الذكي
- محلل الاتجاهات

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Context Organizer
