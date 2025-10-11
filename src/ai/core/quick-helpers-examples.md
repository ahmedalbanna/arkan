# أمثلة استخدام المساعدات السريعة - Quick Helpers Examples

## نظرة عامة

المساعدات السريعة توفر واجهات مبسطة للمهام البسيطة التي لا تحتاج تحليل معقد. هذه المساعدات مصممة للاستخدام السريع والفعال مع معالجة شاملة للأخطاء.

## الاستيراد والاستخدام الأساسي

```typescript
import { QuickHelpers, QuickAIHelpers } from '@/ai/core';

// أو استخدام الواجهة المبسطة
import { QuickHelpers } from '@/ai/core';
```

## أمثلة الاستخدام

### 1. التحليل السريع للمحتوى

```typescript
import { QuickHelpers } from '@/ai/core';

async function analyzeContent() {
  try {
    const result = await QuickHelpers.analyze("أنشئ نظام إدارة قاعدة بيانات متقدم");

    if (result.success) {
      console.log('نوع المحتوى:', result.data.contentType);
      console.log('مستوى التعقيد:', result.data.complexity);
      console.log('الجمهور المستهدف:', result.data.audience);
      console.log('اللغة:', result.data.language);
      console.log('النموذج المقترح:', result.data.recommendedModel);
      console.log('وقت التنفيذ:', result.executionTime, 'ms');
    } else {
      console.error('خطأ في التحليل:', result.error);
    }
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

// استخدام الدالة
analyzeContent();
```

### 2. التقييم السريع للجودة

```typescript
async function validateContent() {
  try {
    const output = "هذه خطة عمل بسيطة تتضمن الأهداف والجدول الزمني.";
    const input = "أنشئ خطة عمل مفصلة لمشروع تقني";

    const result = await QuickHelpers.validate(output, input);

    if (result.success) {
      console.log('نقاط الجودة:', result.data.score);
      console.log('هل الجودة جيدة:', result.data.isGood);
      console.log('يحتاج تحسين:', result.data.needsImprovement);
      console.log('المشاكل الرئيسية:', result.data.mainIssues);
      console.log('المقاييس التفصيلية:', result.data.metrics);
      console.log('الاقتراحات:', result.data.suggestions);
    } else {
      console.error('خطأ في التقييم:', result.error);
    }
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

validateContent();
```

### 3. اقتراح النموذج المناسب

```typescript
async function suggestModel() {
  try {
    const result = await QuickHelpers.suggestModel(
      "أنشئ نظام إدارة قاعدة بيانات متقدم",
      "generation"
    );

    if (result.success) {
      console.log('النموذج المقترح:', result.data.model);
      console.log('التبرير:', result.data.reasoning);
      console.log('درجة الحرارة:', result.data.temperature);
      console.log('الحد الأقصى للرموز:', result.data.maxTokens);
      console.log('نوع المهمة:', result.data.taskType);
      console.log('مستوى التعقيد:', result.data.complexity);
    } else {
      console.error('خطأ في الاقتراح:', result.error);
    }
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

suggestModel();
```

### 4. التلخيص السريع

```typescript
async function summarizeText() {
  try {
    const longText = `
    الذكاء الاصطناعي هو مجال من مجالات علوم الحاسوب يهدف إلى إنشاء أنظمة قادرة على أداء مهام تتطلب ذكاءً بشرياً.
    يشمل الذكاء الاصطناعي عدة فروع مثل التعلم الآلي، معالجة اللغة الطبيعية، الرؤية الحاسوبية، والروبوتات.
    يتم استخدام الذكاء الاصطناعي في العديد من التطبيقات مثل السيارات ذاتية القيادة، المساعدات الافتراضية،
    أنظمة التوصية، والتشخيص الطبي. مع تطور التكنولوجيا، أصبح الذكاء الاصطناعي جزءاً لا يتجزأ من حياتنا اليومية.
    `;

    const result = await QuickHelpers.summarize(longText, 'medium');

    if (result.success) {
      console.log('الملخص:', result.data.summary);
      console.log('الطول الأصلي:', result.data.originalLength, 'حرف');
      console.log('طول الملخص:', result.data.summaryLength, 'حرف');
      console.log('نسبة الضغط:', result.data.compressionRatio, '%');
      console.log('الطول المطلوب:', result.data.length);
    } else {
      console.error('خطأ في التلخيص:', result.error);
    }
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

summarizeText();
```

### 5. فحص الحقائق السريع

```typescript
async function factCheckText() {
  try {
    const textToCheck = `
    الذكاء الاصطناعي تم اختراعه في عام 1956 من قبل جون مكارثي.
    أول روبوت تم إنشاؤه في عام 1961.
    الذكاء الاصطناعي يمكنه التفكير مثل البشر تماماً.
    `;

    const result = await QuickHelpers.factCheck(textToCheck);

    if (result.success) {
      console.log('الادعاءات:', result.data.claims);
      console.log('نقاط الأصالة:', result.data.originalityScore);
      console.log('التقييم العام:', result.data.overallAssessment);
      console.log('التوصيات:', result.data.recommendations);
    } else {
      console.error('خطأ في فحص الحقائق:', result.error);
    }
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

factCheckText();
```

### 6. البحث السريع

```typescript
async function researchTopic() {
  try {
    const result = await QuickHelpers.research("الذكاء الاصطناعي في الرعاية الصحية");

    if (result.success) {
      console.log('ملخص البحث:', result.data.summary);
      console.log('النقاط الرئيسية:', result.data.keyPoints);
      console.log('المصادر:', result.data.sources);
      console.log('الموضوع:', result.data.topic);
      console.log('عمق البحث:', result.data.researchDepth);
    } else {
      console.error('خطأ في البحث:', result.error);
    }
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

researchTopic();
```

### 7. تحسين النص السريع

```typescript
async function improveText() {
  try {
    const textToImprove = `
    هذا نص يحتاج تحسين. النص غير واضح. النص يحتاج تنظيم أفضل.
    النص يحتاج تحسين في الأسلوب والوضوح.
    `;

    const result = await QuickHelpers.improve(textToImprove, 'clarity');

    if (result.success) {
      console.log('النص المحسن:', result.data.improvedText);
      console.log('النص الأصلي:', result.data.originalText);
      console.log('التحسينات المطبقة:', result.data.improvements);
      console.log('منطقة التركيز:', result.data.focusArea);
      console.log('نسبة التحسين:', result.data.improvementRatio, '%');
    } else {
      console.error('خطأ في التحسين:', result.error);
    }
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

improveText();
```

### 8. الترجمة السريعة

```typescript
async function translateText() {
  try {
    const textToTranslate = "Artificial Intelligence is transforming the world.";

    const result = await QuickHelpers.translate(textToTranslate, 'ar');

    if (result.success) {
      console.log('النص المترجم:', result.data.translatedText);
      console.log('النص الأصلي:', result.data.originalText);
      console.log('اللغة المستهدفة:', result.data.targetLanguage);
      console.log('جودة الترجمة:', result.data.translationQuality);
      console.log('عدد الكلمات:', result.data.wordCount);
    } else {
      console.error('خطأ في الترجمة:', result.error);
    }
  } catch (error) {
    console.error('خطأ عام:', error);
  }
}

translateText();
```

## الاستخدام في مكونات React

### 1. مكون تحليل سريع

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

### 2. مكون تلخيص سريع

```typescript
import React, { useState } from 'react';
import { QuickHelpers } from '@/ai/core';

export function QuickSummarizer() {
  const [text, setText] = useState('');
  const [length, setLength] = useState('medium');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const summary = await QuickHelpers.summarize(text, length);
      setResult(summary);
    } catch (error) {
      console.error('خطأ في التلخيص:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">التلخيص السريع</h3>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="أدخل النص المراد تلخيصه..."
        className="w-full p-3 border rounded mb-4"
        rows={6}
      />

      <div className="mb-4">
        <label className="block mb-2">طول الملخص:</label>
        <select
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="short">قصير</option>
          <option value="medium">متوسط</option>
          <option value="long">طويل</option>
        </select>
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading || !text.trim()}
        className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'جاري التلخيص...' : 'تلخيص'}
      </button>

      {result && result.success && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-bold text-blue-800">الملخص:</h4>
          <p className="mb-2">{result.data.summary}</p>
          <div className="text-sm text-gray-600">
            <p>الطول الأصلي: {result.data.originalLength} حرف</p>
            <p>طول الملخص: {result.data.summaryLength} حرف</p>
            <p>نسبة الضغط: {result.data.compressionRatio}%</p>
          </div>
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

## الاستخدام في API Routes

### 1. API للتلخيص السريع

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

### 2. API للتحليل السريع

```typescript
// src/app/api/quick-analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { QuickHelpers } from '@/ai/core';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'النص مطلوب'
      }, { status: 400 });
    }

    const result = await QuickHelpers.analyze(text);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'خطأ في التحليل'
    }, { status: 500 });
  }
}
```

## أفضل الممارسات

### 1. معالجة الأخطاء

```typescript
// ✅ جيد - معالجة شاملة للأخطاء
async function safeQuickOperation() {
  try {
    const result = await QuickHelpers.analyze(text);

    if (result.success) {
      // استخدام النتيجة
      console.log(result.data);
    } else {
      // معالجة خطأ المساعد
      console.error('خطأ في المساعد:', result.error);
    }
  } catch (error) {
    // معالجة خطأ عام
    console.error('خطأ عام:', error);
  }
}

// ❌ سيء - عدم معالجة الأخطاء
async function unsafeQuickOperation() {
  const result = await QuickHelpers.analyze(text);
  console.log(result.data); // قد يفشل إذا كان result.success = false
}
```

### 2. استخدام الوقت المناسب

```typescript
// ✅ جيد - استخدام المساعدات السريعة للمهام البسيطة
const quickAnalysis = await QuickHelpers.analyze("ترجم هذه الجملة");
const quickSummary = await QuickHelpers.summarize(text, 'short');

// ❌ سيء - استخدام المساعدات السريعة للمهام المعقدة
const complexAnalysis = await QuickHelpers.analyze("أنشئ خطة عمل شاملة لمشروع تقني معقد");
// يجب استخدام IntelligentAISystem.runIntelligentFlow بدلاً من ذلك
```

### 3. مراقبة الأداء

```typescript
// ✅ جيد - مراقبة وقت التنفيذ
async function monitoredOperation() {
  const startTime = Date.now();
  const result = await QuickHelpers.analyze(text);
  const executionTime = Date.now() - startTime;

  console.log(`وقت التنفيذ: ${executionTime}ms`);

  if (executionTime > 5000) {
    console.warn('العملية استغرقت وقتاً طويلاً');
  }
}
```

## الخلاصة

المساعدات السريعة توفر:

1. **واجهات مبسطة** للمهام البسيطة
2. **معالجة شاملة للأخطاء** مع رسائل واضحة
3. **مراقبة الأداء** مع قياس وقت التنفيذ
4. **نتائج منظمة** مع بيانات مفصلة
5. **سهولة الاستخدام** في مكونات React و API routes

استخدم المساعدات السريعة للمهام البسيطة التي لا تحتاج تحليل معقد، واستخدم النظام الذكي الكامل للمهام المعقدة التي تحتاج تحليل شامل وتحسين تكراري.
