# Iterative Improvement Engine - محرك التحسين التكراري

## نظرة عامة

`IterativeImprovementEngine` هو مكون متقدم يحسن المخرجات تدريجياً من خلال عدة تكرارات ذكية. يستخدم تقييم الجودة المستمر وتبديل النماذج لضمان الحصول على أفضل النتائج الممكنة.

## الوظائف الرئيسية

### 1. تشغيل جلسة تحسين تكرارية
- تنفيذ عدة تكرارات للتحسين
- تقييم الجودة في كل تكرار
- تبديل النماذج عند الحاجة
- تتبع التقدم والتحسين

### 2. تقييم الجودة المستمر
- تقييم شامل لجودة المخرجات
- تحديد المشاكل والتحسينات المطلوبة
- حساب نقاط الجودة الإجمالية
- مقارنة النتائج بين التكرارات

### 3. تحسين تكراري ذكي
- استخدام نتائج التقييم للتحسين
- تطبيق استراتيجيات تحسين مختلفة
- تعديل معاملات النموذج
- إنتاج محفزات تحسين مخصصة

### 4. إدارة الجلسات
- تتبع جلسات التحسين
- حفظ واسترجاع الجلسات
- إنتاج تقارير مفصلة
- تحليل اتجاهات التحسين

## API Reference

### IterativeImprovementEngine.runImprovementSession()

```typescript
/**
 * تشغيل جلسة تحسين تكرارية كاملة
 * @param originalInput - المدخل الأصلي
 * @param taskType - نوع المهمة المطلوبة
 * @param domain - المجال أو التخصص
 * @param externalContext - السياق الخارجي (اختياري)
 * @param config - تكوين التحسين
 * @param config.maxIterations - الحد الأقصى للتكرارات (افتراضي: 3)
 * @param config.qualityThreshold - حد الجودة المطلوبة (افتراضي: 85)
 * @param config.improvementStrategy - استراتيجية التحسين (افتراضي: 'balanced')
 * @param config.focusAreas - مجالات التركيز (اختياري)
 * @param config.allowModelSwitching - السماح بتبديل النماذج (افتراضي: true)
 * @returns Promise<ImprovementSession> - جلسة التحسين المكتملة
 * @throws {Error} عند فشل جلسة التحسين
 * @example
 * ```typescript
 * import { IterativeImprovementEngine } from '@/ai/core';
 *
 * const session = await IterativeImprovementEngine.runImprovementSession(
 *   "أنشئ خطة عمل لمشروع تقني",
 *   'generation',
 *   'business',
 *   [
 *     {
 *       fileName: "requirements.txt",
 *       content: "متطلبات المشروع...",
 *       type: "context"
 *     }
 *   ],
 *   {
 *     maxIterations: 3,
 *     qualityThreshold: 85,
 *     improvementStrategy: 'balanced',
 *     allowModelSwitching: true
 *   }
 * );
 *
 * console.log(session.finalOutput); // المخرجات النهائية
 * console.log(session.iterations.length); // عدد التكرارات
 * console.log(session.totalImprovementScore); // نقاط التحسين الإجمالية
 * ```
 */
static async runImprovementSession(
  originalInput: string,
  taskType: 'generation' | 'analysis' | 'translation' | 'improvement',
  domain: string,
  externalContext?: Array<{ fileName: string; content: string; type: string }>,
  config: ImprovementConfig = {}
): Promise<ImprovementSession>
```

### IterativeImprovementEngine.analyzeImprovementTrend()

```typescript
/**
 * تحليل اتجاه التحسين
 * @param session - جلسة التحسين المراد تحليلها
 * @returns تحليل اتجاه التحسين مع التوصيات
 * @example
 * ```typescript
 * const trendAnalysis = IterativeImprovementEngine.analyzeImprovementTrend(session);
 *
 * console.log(trendAnalysis.trend); // 'improving' | 'declining' | 'stable'
 * console.log(trendAnalysis.averageImprovement); // متوسط التحسين
 * console.log(trendAnalysis.bestIteration); // أفضل تكرار
 * console.log(trendAnalysis.recommendations); // التوصيات
 * ```
 */
static analyzeImprovementTrend(session: ImprovementSession): {
  trend: 'improving' | 'declining' | 'stable';
  averageImprovement: number;
  bestIteration: number;
  recommendations: string[];
}
```

### IterativeImprovementEngine.getBestOutput()

```typescript
/**
 * الحصول على أفضل مخرجات من الجلسة
 * @param session - جلسة التحسين
 * @returns أفضل مخرجات مع تفاصيلها
 * @example
 * ```typescript
 * const bestOutput = IterativeImprovementEngine.getBestOutput(session);
 *
 * console.log(bestOutput.output); // أفضل مخرجات
 * console.log(bestOutput.iterationNumber); // رقم التكرار
 * console.log(bestOutput.qualityScore); // نقاط الجودة
 * ```
 */
static getBestOutput(session: ImprovementSession): {
  output: string;
  iterationNumber: number;
  qualityScore: number;
}
```

### IterativeImprovementEngine.generateSessionReport()

```typescript
/**
 * إنتاج تقرير مفصل عن الجلسة
 * @param session - جلسة التحسين
 * @returns تقرير مفصل بصيغة Markdown
 * @example
 * ```typescript
 * const report = IterativeImprovementEngine.generateSessionReport(session);
 * console.log(report);
 * // "# تقرير جلسة التحسين التكراري
 * //
 * // **معرف الجلسة:** session_1234567890_abc123
 * // **الحالة:** completed
 * // **عدد التكرارات:** 3
 * // ..."
 * ```
 */
static generateSessionReport(session: ImprovementSession): string
```

## أنواع البيانات

### ImprovementSession

```typescript
/**
 * جلسة التحسين التكراري
 */
export interface ImprovementSession {
  /** معرف الجلسة الفريد */
  sessionId: string;

  /** المدخل الأصلي */
  originalInput: string;

  /** نتيجة تحليل السياق */
  contextAnalysis: ContextAnalysisResult;

  /** التكرارات المنفذة */
  iterations: ImprovementIteration[];

  /** المخرجات النهائية */
  finalOutput: string;

  /** نقاط التحسين الإجمالية */
  totalImprovementScore: number;

  /** حالة الجلسة */
  status: 'in_progress' | 'completed' | 'failed';

  /** الحد الأقصى للتكرارات */
  maxIterations: number;

  /** حد الجودة المطلوبة */
  qualityThreshold: number;
}
```

### ImprovementIteration

```typescript
/**
 * تكرار واحد في جلسة التحسين
 */
export interface ImprovementIteration {
  /** رقم التكرار */
  iterationNumber: number;

  /** المدخل لهذا التكرار */
  input: string;

  /** المخرجات لهذا التكرار */
  output: string;

  /** نقاط الجودة المحققة */
  qualityScore: number;

  /** المشاكل المكتشفة */
  issues: string[];

  /** التحسينات المقترحة */
  improvements: string[];

  /** النموذج المستخدم */
  modelUsed: string;

  /** وقت التنفيذ */
  timestamp: Date;
}
```

### ImprovementConfig

```typescript
/**
 * تكوين التحسين التكراري
 */
export interface ImprovementConfig {
  /** الحد الأقصى للتكرارات (افتراضي: 3) */
  maxIterations?: number;

  /** حد الجودة المطلوبة (افتراضي: 85) */
  qualityThreshold?: number;

  /** استراتيجية التحسين */
  improvementStrategy?: 'aggressive' | 'balanced' | 'conservative';

  /** مجالات التركيز */
  focusAreas?: Array<'completeness' | 'accuracy' | 'clarity' | 'structure' | 'relevance'>;

  /** السماح بتبديل النماذج (افتراضي: true) */
  allowModelSwitching?: boolean;
}
```

## أمثلة الاستخدام

### 1. جلسة تحسين أساسية

```typescript
import { IterativeImprovementEngine } from '@/ai/core';

const session = await IterativeImprovementEngine.runImprovementSession(
  "أنشئ خطة عمل لمشروع تقني",
  'generation',
  'business',
  undefined, // بدون سياق خارجي
  {
    maxIterations: 3,
    qualityThreshold: 80,
    improvementStrategy: 'balanced'
  }
);

console.log(`تم إكمال ${session.iterations.length} تكرارات`);
console.log(`نقاط الجودة النهائية: ${session.iterations[session.iterations.length - 1].qualityScore}`);
console.log(`نقاط التحسين الإجمالية: ${session.totalImprovementScore}`);
```

### 2. جلسة تحسين متقدمة

```typescript
const advancedSession = await IterativeImprovementEngine.runImprovementSession(
  "أنشئ نظام إدارة قاعدة بيانات متقدم",
  'generation',
  'software_engineering',
  [
    {
      fileName: "database-schema.sql",
      content: "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));",
      type: "context"
    },
    {
      fileName: "requirements.txt",
      content: "متطلبات النظام...",
      type: "guidelines"
    }
  ],
  {
    maxIterations: 5,
    qualityThreshold: 90,
    improvementStrategy: 'aggressive',
    focusAreas: ['completeness', 'accuracy', 'structure'],
    allowModelSwitching: true
  }
);
```

### 3. تحليل اتجاه التحسين

```typescript
const trendAnalysis = IterativeImprovementEngine.analyzeImprovementTrend(session);

console.log(`اتجاه التحسين: ${trendAnalysis.trend}`);
console.log(`متوسط التحسين: ${trendAnalysis.averageImprovement}`);
console.log(`أفضل تكرار: ${trendAnalysis.bestIteration}`);

trendAnalysis.recommendations.forEach((recommendation, index) => {
  console.log(`${index + 1}. ${recommendation}`);
});
```

### 4. الحصول على أفضل مخرجات

```typescript
const bestOutput = IterativeImprovementEngine.getBestOutput(session);

console.log(`أفضل مخرجات من التكرار ${bestOutput.iterationNumber}:`);
console.log(bestOutput.output);
console.log(`نقاط الجودة: ${bestOutput.qualityScore}`);
```

### 5. إنتاج تقرير مفصل

```typescript
const report = IterativeImprovementEngine.generateSessionReport(session);
console.log(report);

// حفظ التقرير في ملف
import { writeFileSync } from 'fs';
writeFileSync('improvement-report.md', report);
```

## استراتيجيات التحسين

### 1. استراتيجية عدوانية (Aggressive)

```typescript
const aggressiveSession = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    improvementStrategy: 'aggressive',
    maxIterations: 5,
    qualityThreshold: 95
  }
);
```

**الخصائص:**
- إعادة كتابة المحتوى بالكامل
- إضافة المزيد من التفاصيل والأمثلة
- تحسين الهيكل والتنظيم بشكل جذري
- استخدام نماذج أقوى
- تكرارات أكثر

### 2. استراتيجية متوازنة (Balanced)

```typescript
const balancedSession = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    improvementStrategy: 'balanced',
    maxIterations: 3,
    qualityThreshold: 85
  }
);
```

**الخصائص:**
- تحسين الوضوح والتنظيم
- إضافة المعلومات المفقودة
- جعل اللغة أكثر دقة
- موازنة بين الجودة والسرعة
- تكرارات معتدلة

### 3. استراتيجية محافظة (Conservative)

```typescript
const conservativeSession = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    improvementStrategy: 'conservative',
    maxIterations: 2,
    qualityThreshold: 75
  }
);
```

**الخصائص:**
- تحسينات طفيفة
- التركيز على تصحيح الأخطاء الواضحة
- الحفاظ على الهيكل الأساسي
- سرعة عالية
- تكرارات قليلة

## مجالات التركيز

### 1. الاكتمال (Completeness)
```typescript
const completenessSession = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    focusAreas: ['completeness'],
    qualityThreshold: 90
  }
);
```

### 2. الدقة (Accuracy)
```typescript
const accuracySession = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    focusAreas: ['accuracy'],
    qualityThreshold: 95
  }
);
```

### 3. الوضوح (Clarity)
```typescript
const claritySession = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    focusAreas: ['clarity'],
    qualityThreshold: 85
  }
);
```

### 4. الهيكل (Structure)
```typescript
const structureSession = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    focusAreas: ['structure'],
    qualityThreshold: 80
  }
);
```

### 5. الصلة (Relevance)
```typescript
const relevanceSession = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    focusAreas: ['relevance'],
    qualityThreshold: 85
  }
);
```

## أفضل الممارسات

### 1. اختيار الاستراتيجية المناسبة
```typescript
// ✅ جيد - استراتيجية مناسبة للمهمة
const session = await IterativeImprovementEngine.runImprovementSession(
  "أنشئ نظام معقد",
  'generation',
  'software_engineering',
  externalContext,
  {
    improvementStrategy: 'aggressive', // مناسب للمهام المعقدة
    maxIterations: 5,
    qualityThreshold: 95
  }
);

// ❌ سيء - استراتيجية غير مناسبة
const session = await IterativeImprovementEngine.runImprovementSession(
  "ترجم هذه الجملة",
  'translation',
  'language',
  externalContext,
  {
    improvementStrategy: 'aggressive', // مفرط للمهام البسيطة
    maxIterations: 5
  }
);
```

### 2. تحديد حد الجودة المناسب
```typescript
// ✅ جيد - حد جودة مناسب
const session = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    qualityThreshold: 85, // مناسب للمهام العامة
    maxIterations: 3
  }
);

// ❌ سيء - حد جودة غير واقعي
const session = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    qualityThreshold: 99, // غير واقعي
    maxIterations: 10
  }
);
```

### 3. استخدام مجالات التركيز
```typescript
// ✅ جيد - مجالات تركيز محددة
const session = await IterativeImprovementEngine.runImprovementSession(
  originalInput,
  taskType,
  domain,
  externalContext,
  {
    focusAreas: ['completeness', 'accuracy'], // مجالات محددة
    improvementStrategy: 'balanced'
  }
);
```

## معالجة الأخطاء

### 1. أخطاء الجلسة
```typescript
try {
  const session = await IterativeImprovementEngine.runImprovementSession(
    originalInput,
    'invalid_task_type', // نوع مهمة غير صحيح
    domain,
    externalContext
  );
} catch (error) {
  console.error('خطأ في جلسة التحسين:', error.message);
  // معالجة الخطأ
}
```

### 2. أخطاء التقييم
```typescript
try {
  const session = await IterativeImprovementEngine.runImprovementSession(
    originalInput,
    taskType,
    domain,
    externalContext,
    {
      qualityThreshold: -1 // حد جودة غير صحيح
    }
  );
} catch (error) {
  console.error('خطأ في تكوين التحسين:', error.message);
}
```

## الاختبار

### 1. اختبار الجلسة الأساسية
```typescript
import { IterativeImprovementEngine } from '@/ai/core';

describe('IterativeImprovementEngine', () => {
  test('should run improvement session successfully', async () => {
    const session = await IterativeImprovementEngine.runImprovementSession(
      "أنشئ خطة عمل",
      'generation',
      'business',
      undefined,
      {
        maxIterations: 2,
        qualityThreshold: 80
      }
    );

    expect(session.sessionId).toBeDefined();
    expect(session.iterations.length).toBeGreaterThan(0);
    expect(session.status).toBe('completed');
    expect(session.finalOutput).toBeDefined();
  });

  test('should improve quality over iterations', async () => {
    const session = await IterativeImprovementEngine.runImprovementSession(
      "أنشئ نص قصير",
      'generation',
      'content_writing',
      undefined,
      {
        maxIterations: 3,
        qualityThreshold: 70
      }
    );

    if (session.iterations.length > 1) {
      const firstScore = session.iterations[0].qualityScore;
      const lastScore = session.iterations[session.iterations.length - 1].qualityScore;
      expect(lastScore).toBeGreaterThanOrEqual(firstScore);
    }
  });
});
```

### 2. اختبار تحليل الاتجاه
```typescript
test('should analyze improvement trend correctly', async () => {
  const session = await IterativeImprovementEngine.runImprovementSession(
    "أنشئ محتوى",
    'generation',
    'content_writing',
    undefined,
    {
      maxIterations: 3,
      qualityThreshold: 80
    }
  );

  const trendAnalysis = IterativeImprovementEngine.analyzeImprovementTrend(session);

  expect(trendAnalysis.trend).toMatch(/^(improving|declining|stable)$/);
  expect(trendAnalysis.averageImprovement).toBeDefined();
  expect(trendAnalysis.bestIteration).toBeGreaterThan(0);
  expect(trendAnalysis.recommendations).toBeInstanceOf(Array);
});
```

## التطوير المستقبلي

### 1. تحسينات مقترحة
- دعم استراتيجيات تحسين مخصصة
- تحسين خوارزمية تقييم الجودة
- دعم التحسين المتوازي
- تحليل الأداء التاريخي

### 2. إضافة مكونات جديدة
- محلل الاتجاهات المتقدم
- محسن الاستراتيجيات
- محلل التكلفة والفائدة
- نظام التوصيات الذكي

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Iterative Improvement Engine
