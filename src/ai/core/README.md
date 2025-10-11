# نظام الذكاء الاصطناعي المحسن - Enhanced AI Core System

## نظرة عامة

نظام الذكاء الاصطناعي المحسن هو قلب منصة Arkan، يوفر نظاماً ذكياً ومتكاملاً لتوليد المحتوى وتحليله وتحسينه باستخدام أحدث تقنيات الذكاء الاصطناعي. النظام مصمم ليكون قابلاً للتوسع وقابلاً للتخصيص مع مراقبة شاملة للأداء.

## المكونات الرئيسية

### 1. 🧠 تحليل السياق الذكي (Context Analyzer)
- **الملف**: `context-analyzer.ts`
- **الوظيفة**: تحليل شامل للمدخلات والسياق الخارجي
- **الميزات**:
  - تحديد نوع المحتوى المطلوب
  - تقييم مستوى التعقيد
  - تحديد الجمهور المستهدف
  - تحليل السياق الثقافي واللغوي
  - استخراج المتطلبات المحددة

### 2. 🎯 اختيار النماذج التكيفي (Adaptive Model Selector)
- **الملف**: `adaptive-model-selector.ts`
- **الوظيفة**: اختيار أفضل نموذج AI بناءً على المهمة والسياق
- **الميزات**:
  - تقييم النماذج المتاحة
  - تكوين المعاملات تلقائياً
  - دعم النماذج الاحتياطية
  - تحسين التكلفة والأداء

### 3. 📝 بناء المحفزات الذكي (Intelligent Prompt Builder)
- **الملف**: `intelligent-prompt-builder.ts`
- **الوظيفة**: بناء محفزات محسنة ومخصصة
- **الميزات**:
  - بناء محفزات ديناميكية
  - تخصيص حسب نوع المهمة
  - تنظيم السياق الخارجي
  - إضافة الأمثلة والقيود

### 4. 🔄 محرك التحسين التكراري (Iterative Improvement Engine)
- **الملف**: `iterative-improvement-engine.ts`
- **الوظيفة**: تحسين المخرجات تدريجياً من خلال عدة تكرارات
- **الميزات**:
  - تحسين تكراري ذكي
  - تقييم الجودة المستمر
  - تبديل النماذج عند الحاجة
  - تقارير مفصلة للتحسين

### 5. ✅ التحقق من جودة المخرجات (Output Quality Validator)
- **الملف**: `output-quality-validator.ts`
- **الوظيفة**: تقييم شامل لجودة المخرجات واقتراح التحسينات
- **الميزات**:
  - مقاييس جودة متعددة
  - تحديد المشاكل تلقائياً
  - اقتراحات التحسين
  - تقييم الدقة والشمولية

### 6. 📊 مراقب الأداء (Performance Monitor)
- **الملف**: `performance-monitor.ts`
- **الوظيفة**: مراقبة شاملة لأداء النظام
- **الميزات**:
  - تتبع أوقات التنفيذ
  - مراقبة استخدام الموارد
  - تحليل اتجاهات الأداء
  - تقارير مفصلة

### 7. 🛠️ معالج أخطاء الذكاء الاصطناعي (AI Error Handler)
- **الملف**: `ai-error-handler.ts`
- **الوظيفة**: معالجة متقدمة لأخطاء الذكاء الاصطناعي
- **الميزات**:
  - استراتيجيات تعافي متعددة
  - نماذج احتياطية
  - تبسيط المحفزات
  - تسجيل شامل للأخطاء

### 8. 🗂️ منظم السياقات (Context Organizer)
- **الملف**: `context-organizer.ts`
- **الوظيفة**: تنظيم ذكي للسياقات حسب المعرفة والأهمية
- **الميزات**:
  - تصنيف السياقات حسب نوع المعرفة
  - ترتيب حسب الأولوية
  - حساب الصلة بالمهمة
  - إحصائيات مفصلة

### 9. ⚡ المساعدات السريعة (Quick Helpers)
- **الملف**: `quick-helpers.ts`
- **الوظيفة**: واجهات مبسطة للمهام البسيطة التي لا تحتاج تحليل معقد
- **الميزات**:
  - تحليل سريع للمحتوى
  - تقييم سريع للجودة
  - اقتراح النموذج المناسب
  - تلخيص سريع
  - فحص الحقائق السريع
  - بحث سريع
  - تحسين النص السريع
  - ترجمة سريعة
  - معالجة شاملة للأخطاء
  - مراقبة وقت التنفيذ

## الواجهة الموحدة

### IntelligentAISystem
الواجهة الرئيسية التي توحد جميع المكونات:

```typescript
import { IntelligentAISystem } from '@/ai/core';

// تشغيل تدفق ذكي كامل
const result = await IntelligentAISystem.runIntelligentFlow({
  userInput: "أنشئ خطة عمل لمشروع تقني",
  taskType: "generation",
  domain: "business",
  externalContext: [...],
  guidelines: [...],
  qualityThreshold: 85,
  maxIterations: 3,
  enableIterativeImprovement: true,
  enablePerformanceMonitoring: true
});
```

## أمثلة الاستخدام

### 1. استخدام التدفق الذكي البسيط

```typescript
import { IntelligentAISystem } from '@/ai/core';

async function generateSimpleContent() {
  try {
    const result = await IntelligentAISystem.runIntelligentFlow({
      userInput: "أنشئ خطة عمل بسيطة لمشروع تقني",
      taskType: "generation",
      domain: "business",
      qualityThreshold: 80,
      maxIterations: 2,
      enableIterativeImprovement: true,
      enablePerformanceMonitoring: true
    });

    console.log('المخرجات:', result.output);
    console.log('نقاط الجودة:', result.qualityScore);
    console.log('عدد التكرارات:', result.iterations);
    console.log('النموذج المستخدم:', result.modelUsed);

    return result;
  } catch (error) {
    console.error('خطأ في التوليد:', error.message);
    throw error;
  }
}
```

### 2. استخدام المساعدات السريعة للمهام البسيطة

```typescript
import { QuickHelpers } from '@/ai/core';

async function quickOperations() {
  try {
    // تحليل سريع للنص
    const analysis = await QuickHelpers.analyze("أنشئ نظام إدارة قاعدة بيانات متقدم");

    if (analysis.success) {
      console.log('نوع المحتوى:', analysis.data.contentType);
      console.log('مستوى التعقيد:', analysis.data.complexity);
      console.log('الجمهور المستهدف:', analysis.data.audience);
      console.log('النموذج المقترح:', analysis.data.recommendedModel);
    }

    // تقييم سريع للجودة
    const validation = await QuickHelpers.validate(output, input);

    if (validation.success) {
      console.log('نقاط الجودة:', validation.data.score);
      console.log('هل الجودة جيدة:', validation.data.isGood);
      console.log('المشاكل الرئيسية:', validation.data.mainIssues);
    }

    // تلخيص سريع
    const summary = await QuickHelpers.summarize(longText, 'medium');

    if (summary.success) {
      console.log('الملخص:', summary.data.summary);
      console.log('نسبة الضغط:', summary.data.compressionRatio, '%');
    }

    // فحص الحقائق السريع
    const factCheck = await QuickHelpers.factCheck(textToCheck);

    if (factCheck.success) {
      console.log('نقاط الأصالة:', factCheck.data.originalityScore);
      console.log('التقييم العام:', factCheck.data.overallAssessment);
    }

    // بحث سريع
    const research = await QuickHelpers.research("الذكاء الاصطناعي في الرعاية الصحية");

    if (research.success) {
      console.log('ملخص البحث:', research.data.summary);
      console.log('النقاط الرئيسية:', research.data.keyPoints);
      console.log('المصادر:', research.data.sources);
    }

    // تحسين النص السريع
    const improvement = await QuickHelpers.improve(textToImprove, 'clarity');

    if (improvement.success) {
      console.log('النص المحسن:', improvement.data.improvedText);
      console.log('التحسينات المطبقة:', improvement.data.improvements);
    }

    // ترجمة سريعة
    const translation = await QuickHelpers.translate("Hello world", 'ar');

    if (translation.success) {
      console.log('النص المترجم:', translation.data.translatedText);
      console.log('جودة الترجمة:', translation.data.translationQuality);
    }

  } catch (error) {
    console.error('خطأ في العمليات السريعة:', error.message);
  }
}
```

### 3. استخدام المساعدات السريعة في مكونات React

```typescript
import React, { useState } from 'react';
import { QuickHelpers } from '@/ai/core';

export function QuickAnalyzer() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const analysis = await QuickHelpers.analyze(text);
      setResult(analysis);
    } catch (error) {
      console.error('خطأ في التحليل:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">التحليل السريع للمحتوى</h3>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="أدخل النص المراد تحليله..."
        className="w-full p-3 border rounded mb-4"
        rows={4}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || !text.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'جاري التحليل...' : 'تحليل'}
      </button>

      {result && result.success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <h4 className="font-bold text-green-800">نتائج التحليل:</h4>
          <p><strong>نوع المحتوى:</strong> {result.data.contentType}</p>
          <p><strong>مستوى التعقيد:</strong> {result.data.complexity}</p>
          <p><strong>الجمهور المستهدف:</strong> {result.data.audience}</p>
          <p><strong>النموذج المقترح:</strong> {result.data.recommendedModel}</p>
          <p><strong>وقت التنفيذ:</strong> {result.executionTime}ms</p>
        </div>
      )}

      {result && !result.success && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">خطأ: {result.error}</p>
        </div>
      )}
    </div>
  );
}
```

### 4. استخدام المساعدات السريعة في API Routes

```typescript
// src/app/api/quick-summarize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { QuickHelpers } from '@/ai/core';

export async function POST(request: NextRequest) {
  try {
    const { text, length = 'medium' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'النص مطلوب'
      }, { status: 400 });
    }

    const result = await QuickHelpers.summarize(text, length);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'خطأ في التلخيص'
    }, { status: 500 });
  }
}
```

## التكوين والإعداد

### 1. تكوين النماذج
```typescript
// في src/ai/config/models.ts
export const defaultModel = 'googleai/gemini-2.0-flash';
export const proModel = 'googleai/gemini-1.5-pro';
export const imageGenerationModel = 'googleai/gemini-2.0-flash-preview-image-generation';
```

### 2. تكوين معايير الجودة
```typescript
const config = {
  qualityThreshold: 85,        // الحد الأدنى للجودة المقبولة
  maxIterations: 3,            // الحد الأقصى للتكرارات
  enableIterativeImprovement: true,
  enablePerformanceMonitoring: true
};
```

## مراقبة الأداء

### 1. الحصول على تقرير الأداء
```typescript
const report = IntelligentAISystem.getPerformanceReport();
console.log(report);
// {
//   totalSessions: 150,
//   averageExecutionTime: 2500,
//   averageQualityScore: 87,
//   successRate: 94,
//   recommendations: [...]
// }
```

### 2. إحصائيات سريعة
```typescript
const stats = IntelligentAISystem.getQuickPerformanceStats();
console.log(stats);
// {
//   activeSessions: 3,
//   completedSessions: 147,
//   avgQualityToday: 89,
//   avgExecutionTimeToday: 2100
// }
```

## أفضل الممارسات

## أفضل الممارسات

### 1. اختيار الأداة المناسبة
- **استخدم `IntelligentAISystem.runIntelligentFlow()` للمهام المعقدة** التي تحتاج تحليل شامل وتحسين تكراري
- **استخدم `QuickHelpers` للمهام البسيطة** التي لا تحتاج تحليل معقد
- **استخدم `AIHelpers` للتوافق مع الإصدارات السابقة** (مُهمل)

### 2. استخدام المساعدات السريعة
- **استخدم المساعدات السريعة للمهام البسيطة** مثل التلخيص، الترجمة، فحص الحقائق
- **تحقق من نجاح العملية** باستخدام `result.success` قبل الوصول للبيانات
- **راقب وقت التنفيذ** باستخدام `result.executionTime` لتحسين الأداء
- **استخدم معالجة الأخطاء المناسبة** للتعامل مع الأخطاء المحتملة

### 3. إدارة السياق
- قدم سياق خارجي مفصل للمهام المعقدة
- استخدم الإرشادات لتوجيه النموذج
- نظم السياقات حسب الأهمية

### 4. تحسين الجودة
- استخدم التحسين التكراري للمهام المهمة
- راقب مقاييس الجودة بانتظام
- اضبط المعايير حسب احتياجاتك

### 5. معالجة الأخطاء
- استخدم معالج الأخطاء المدمج
- راقب الأخطاء الشائعة
- استخدم النماذج الاحتياطية
- تحقق من نجاح العمليات السريعة قبل الوصول للبيانات

## التطوير والصيانة

### 1. إضافة نموذج جديد
```typescript
// في adaptive-model-selector.ts
private static getAvailableModels() {
  return [
    // ... النماذج الموجودة
    {
      id: 'new-model-id',
      name: 'New Model Name',
      strengths: ['new_capability'],
      weaknesses: ['limitation'],
      maxTokens: 16000,
      languages: ['ar', 'en'],
      costEfficiency: 'high'
    }
  ];
}
```

### 2. إضافة مقياس جودة جديد
```typescript
// في output-quality-validator.ts
private static async calculateQualityMetrics(...) {
  // ... المقاييس الموجودة
  const newMetric = this.assessNewMetric(output, contextAnalysis);

  const overall = Math.round(
    // ... المقاييس الموجودة
    (newMetric * 0.1)  // إضافة المقياس الجديد
  );
}
```

### 3. إضافة استراتيجية تحسين جديدة
```typescript
// في iterative-improvement-engine.ts
private static generateFallbackImprovementPrompt(...) {
  switch (strategy) {
    case 'new_strategy':
      prompt += '- استراتيجية جديدة للتحسين\n';
      break;
    // ... الاستراتيجيات الموجودة
  }
}
```

## الاختبار

### 1. اختبار المكونات الفردية
```typescript
import { ContextAnalyzer } from '@/ai/core';

describe('ContextAnalyzer', () => {
  test('should analyze context correctly', async () => {
    const result = await ContextAnalyzer.analyzeContext({
      userInput: 'test input',
      externalContext: []
    });

    expect(result.contentType).toBeDefined();
    expect(result.complexityLevel).toBeDefined();
  });
});
```

### 2. اختبار التدفق الكامل
```typescript
import { IntelligentAISystem } from '@/ai/core';

describe('IntelligentAISystem', () => {
  test('should run complete flow', async () => {
    const result = await IntelligentAISystem.runIntelligentFlow({
      userInput: 'test input',
      taskType: 'generation',
      domain: 'test'
    });

    expect(result.output).toBeDefined();
    expect(result.qualityScore).toBeGreaterThan(0);
  });
});
```

## استكشاف الأخطاء

### 1. مشاكل الأداء
- تحقق من تقرير الأداء
- راقب استخدام الذاكرة
- اضبط عدد التكرارات

### 2. مشاكل الجودة
- راجع معايير الجودة
- تحقق من السياق المقدم
- جرب نماذج مختلفة

### 3. مشاكل الأخطاء
- راجع سجل الأخطاء
- تحقق من النماذج الاحتياطية
- راقب معدل النجاح

## المساهمة

للمساهمة في تطوير النظام:

1. اقرأ التوثيق الحالي
2. فهم المعمارية والأنماط
3. اكتب اختبارات شاملة
4. اتبع معايير الكود
5. قدم توثيقاً مفصلاً

## الدعم

للحصول على الدعم:
- راجع التوثيق المفصل لكل مكون
- تحقق من أمثلة الاستخدام
- راجع سجل الأخطاء
- تواصل مع فريق التطوير

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المشروع**: Arkan - منصة إنشاء المستندات المدعومة بالذكاء الاصطناعي
