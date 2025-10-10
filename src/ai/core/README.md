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

### 1. تحليل سريع للسياق
```typescript
import { AIHelpers } from '@/ai/core';

const analysis = await AIHelpers.quickAnalyze("أنشئ تقرير تقني عن الذكاء الاصطناعي");
console.log(analysis);
// {
//   contentType: "technical",
//   complexity: "intermediate",
//   audience: "technical",
//   language: "ar",
//   recommendedModel: "googleai/gemini-1.5-pro"
// }
```

### 2. تقييم سريع للجودة
```typescript
const validation = await AIHelpers.quickValidate(output, input);
console.log(validation);
// {
//   score: 85,
//   isGood: true,
//   needsImprovement: false,
//   mainIssues: []
// }
```

### 3. اقتراح النموذج المناسب
```typescript
const suggestion = await AIHelpers.suggestModel(text, "generation");
console.log(suggestion);
// {
//   model: "googleai/gemini-1.5-pro",
//   reasoning: "Complex technical content requires advanced reasoning capabilities",
//   temperature: 0.3,
//   maxTokens: 8192
// }
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

### 1. استخدام النظام الذكي
- استخدم `IntelligentAISystem.runIntelligentFlow()` للمهام المعقدة
- استخدم `AIHelpers` للعمليات السريعة
- فعّل مراقبة الأداء في الإنتاج

### 2. إدارة السياق
- قدم سياق خارجي مفصل للمهام المعقدة
- استخدم الإرشادات لتوجيه النموذج
- نظم السياقات حسب الأهمية

### 3. تحسين الجودة
- استخدم التحسين التكراري للمهام المهمة
- راقب مقاييس الجودة بانتظام
- اضبط المعايير حسب احتياجاتك

### 4. معالجة الأخطاء
- استخدم معالج الأخطاء المدمج
- راقب الأخطاء الشائعة
- استخدم النماذج الاحتياطية

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
