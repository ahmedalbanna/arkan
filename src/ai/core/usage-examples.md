# Usage Examples - أمثلة الاستخدام

## نظرة عامة

هذا الملف يحتوي على أمثلة شاملة ومفصلة لاستخدام جميع مكونات نظام الذكاء الاصطناعي المحسن. يوفر أمثلة عملية من البسيط إلى المعقد لمساعدة المطورين على فهم واستخدام النظام بشكل فعال.

## أمثلة أساسية

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

// استخدام الدالة
generateSimpleContent()
  .then(result => console.log('تم التوليد بنجاح'))
  .catch(error => console.error('فشل التوليد:', error));
```

### 2. استخدام التحليل السريع

```typescript
import { AIHelpers } from '@/ai/core';

async function quickAnalysis() {
  try {
    // تحليل سريع للنص
    const analysis = await AIHelpers.quickAnalyze("أنشئ نظام إدارة قاعدة بيانات متقدم");

    console.log('نوع المحتوى:', analysis.contentType);
    console.log('مستوى التعقيد:', analysis.complexity);
    console.log('الجمهور المستهدف:', analysis.audience);
    console.log('اللغة:', analysis.language);
    console.log('النموذج المقترح:', analysis.recommendedModel);

    return analysis;
  } catch (error) {
    console.error('خطأ في التحليل:', error.message);
    throw error;
  }
}

// استخدام الدالة
quickAnalysis()
  .then(analysis => console.log('تم التحليل بنجاح'))
  .catch(error => console.error('فشل التحليل:', error));
```

### 3. استخدام التقييم السريع

```typescript
import { AIHelpers } from '@/ai/core';

async function quickValidation() {
  try {
    const output = "هذه خطة عمل بسيطة تتضمن الأهداف والجدول الزمني.";
    const input = "أنشئ خطة عمل مفصلة لمشروع تقني";

    const validation = await AIHelpers.quickValidate(output, input);

    console.log('نقاط الجودة:', validation.score);
    console.log('هل الجودة جيدة:', validation.isGood);
    console.log('يحتاج تحسين:', validation.needsImprovement);
    console.log('المشاكل الرئيسية:', validation.mainIssues);

    return validation;
  } catch (error) {
    console.error('خطأ في التقييم:', error.message);
    throw error;
  }
}

// استخدام الدالة
quickValidation()
  .then(validation => console.log('تم التقييم بنجاح'))
  .catch(error => console.error('فشل التقييم:', error));
```

## أمثلة متقدمة

### 1. استخدام التدفق الذكي مع سياق خارجي

```typescript
import { IntelligentAISystem } from '@/ai/core';

async function generateWithExternalContext() {
  try {
    const result = await IntelligentAISystem.runIntelligentFlow({
      userInput: "أنشئ خطة عمل شاملة لمشروع تقني",
      taskType: "generation",
      domain: "business",
      externalContext: [
        {
          fileName: "requirements.txt",
          content: `متطلبات المشروع:
- نظام إدارة المستخدمين
- واجهة ويب حديثة
- قاعدة بيانات آمنة
- نظام دفع إلكتروني
- تقارير مفصلة`,
          type: "context"
        },
        {
          fileName: "market-analysis.pdf",
          content: `تحليل السوق:
- حجم السوق: 50 مليون ريال
- معدل النمو: 25% سنوياً
- المنافسون الرئيسيون: 3 شركات
- الفرص المتاحة: التوسع في الخليج`,
          type: "textbook"
        },
        {
          fileName: "example-plan.md",
          content: `مثال على خطة عمل:
# خطة عمل لمشروع تقني

## الأهداف
- تطوير نظام متكامل
- تحقيق عائد استثمار 300%

## الجدول الزمني
- المرحلة الأولى: 6 أشهر
- المرحلة الثانية: 4 أشهر`,
          type: "example"
        }
      ],
      guidelines: [
        "يجب أن يكون المحتوى مهنياً",
        "استخدم اللغة العربية الفصحى",
        "ركز على الجوانب المالية",
        "قدم جدول زمني واقعي",
        "تضمن تحليل المخاطر"
      ],
      qualityThreshold: 90,
      maxIterations: 5,
      enableIterativeImprovement: true,
      enablePerformanceMonitoring: true
    });

    console.log('المخرجات النهائية:', result.output);
    console.log('نقاط الجودة:', result.qualityScore);
    console.log('عدد التكرارات:', result.iterations);
    console.log('النموذج المستخدم:', result.modelUsed);
    console.log('وقت التنفيذ:', result.performanceMetrics?.executionTime, 'ms');

    return result;
  } catch (error) {
    console.error('خطأ في التوليد:', error.message);
    throw error;
  }
}

// استخدام الدالة
generateWithExternalContext()
  .then(result => console.log('تم التوليد بنجاح'))
  .catch(error => console.error('فشل التوليد:', error));
```

### 2. استخدام التحسين التكراري المتقدم

```typescript
import { IterativeImprovementEngine } from '@/ai/core';

async function advancedImprovement() {
  try {
    const session = await IterativeImprovementEngine.runImprovementSession(
      "أنشئ نظام إدارة قاعدة بيانات متقدم مع واجهة ويب حديثة",
      'generation',
      'software_engineering',
      [
        {
          fileName: "database-schema.sql",
          content: `CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
          type: "textbook"
        },
        {
          fileName: "api-examples.json",
          content: `{
  "endpoints": {
    "GET /api/users": {
      "description": "Get all users",
      "response": {
        "users": [
          {
            "id": 1,
            "name": "أحمد محمد",
            "email": "ahmed@example.com",
            "created_at": "2024-01-01T00:00:00Z"
          }
        ]
      }
    },
    "POST /api/users": {
      "description": "Create new user",
      "body": {
        "name": "string",
        "email": "string",
        "password": "string"
      }
    }
  }
}`,
          type: "example"
        },
        {
          fileName: "security-guidelines.md",
          content: `إرشادات الأمان:
- تشفير كلمات المرور باستخدام bcrypt
- التحقق من الصلاحيات قبل كل عملية
- حماية من SQL Injection
- استخدام HTTPS
- التحقق من صحة المدخلات
- تسجيل جميع العمليات`,
          type: "guidelines"
        }
      ],
      {
        maxIterations: 5,
        qualityThreshold: 95,
        improvementStrategy: 'aggressive',
        focusAreas: ['completeness', 'accuracy', 'structure', 'relevance'],
        allowModelSwitching: true
      }
    );

    console.log('معرف الجلسة:', session.sessionId);
    console.log('الحالة:', session.status);
    console.log('عدد التكرارات:', session.iterations.length);
    console.log('نقاط التحسين الإجمالية:', session.totalImprovementScore);
    console.log('المخرجات النهائية:', session.finalOutput);

    // تحليل اتجاه التحسين
    const trendAnalysis = IterativeImprovementEngine.analyzeImprovementTrend(session);
    console.log('اتجاه التحسين:', trendAnalysis.trend);
    console.log('متوسط التحسين:', trendAnalysis.averageImprovement);
    console.log('أفضل تكرار:', trendAnalysis.bestIteration);
    console.log('التوصيات:', trendAnalysis.recommendations);

    // الحصول على أفضل مخرجات
    const bestOutput = IterativeImprovementEngine.getBestOutput(session);
    console.log('أفضل مخرجات من التكرار:', bestOutput.iterationNumber);
    console.log('نقاط الجودة:', bestOutput.qualityScore);

    // إنتاج تقرير مفصل
    const report = IterativeImprovementEngine.generateSessionReport(session);
    console.log('التقرير المفصل:', report);

    return session;
  } catch (error) {
    console.error('خطأ في التحسين التكراري:', error.message);
    throw error;
  }
}

// استخدام الدالة
advancedImprovement()
  .then(session => console.log('تم التحسين بنجاح'))
  .catch(error => console.error('فشل التحسين:', error));
```

### 3. استخدام مراقبة الأداء المتقدمة

```typescript
import { PerformanceMonitor } from '@/ai/core';

async function advancedPerformanceMonitoring() {
  try {
    // بدء جلسة مراقبة
    const sessionId = PerformanceMonitor.startSession({
      taskType: 'generation',
      domain: 'business',
      userInput: "أنشئ خطة عمل شاملة"
    });

    console.log('معرف الجلسة:', sessionId);

    // تسجيل أوقات المراحل
    PerformanceMonitor.recordPhaseTime(sessionId, 'contextAnalysisTime', 1500);
    PerformanceMonitor.recordPhaseTime(sessionId, 'modelSelectionTime', 200);
    PerformanceMonitor.recordPhaseTime(sessionId, 'promptBuildingTime', 800);
    PerformanceMonitor.recordPhaseTime(sessionId, 'generationTime', 5000);
    PerformanceMonitor.recordPhaseTime(sessionId, 'qualityValidationTime', 1200);
    PerformanceMonitor.recordPhaseTime(sessionId, 'iterativeImprovementTime', 3000);

    // تسجيل مقاييس الجودة
    PerformanceMonitor.recordQualityMetrics(sessionId, {
      qualityScore: 92,
      improvementIterations: 3,
      finalAccuracy: 94
    });

    // تسجيل استخدام الموارد
    PerformanceMonitor.recordResourceUsage(sessionId, {
      tokensUsed: 2500,
      modelSwitches: 2,
      memoryUsage: 512
    });

    // إنهاء الجلسة بنجاح
    const session = PerformanceMonitor.endSession(sessionId, true);

    if (session) {
      console.log('وقت التنفيذ الإجمالي:', session.metrics.executionTime, 'ms');
      console.log('نقاط الجودة:', session.metrics.qualityScore);
      console.log('عدد الرموز المستخدمة:', session.metrics.tokensUsed);
      console.log('استخدام الذاكرة:', session.metrics.memoryUsage, 'MB');
      console.log('الحالة:', session.status);
    }

    // الحصول على تقرير الأداء
    const report = PerformanceMonitor.generatePerformanceReport();
    console.log('إجمالي الجلسات:', report.totalSessions);
    console.log('متوسط وقت التنفيذ:', report.averageExecutionTime, 'ms');
    console.log('متوسط نقاط الجودة:', report.averageQualityScore);
    console.log('معدل النجاح:', report.successRate, '%');

    // الأخطاء الشائعة
    console.log('الأخطاء الشائعة:');
    report.mostCommonErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.error}: ${error.count} مرة`);
    });

    // اتجاهات الأداء
    console.log('اتجاهات الأداء (آخر 7 أيام):');
    report.performanceTrends.forEach(trend => {
      console.log(`${trend.date}: وقت متوسط ${trend.avgTime}ms، جودة ${trend.avgQuality}`);
    });

    // إحصائيات استخدام النماذج
    console.log('إحصائيات استخدام النماذج:');
    report.modelUsageStats.forEach(model => {
      console.log(`${model.model}: ${model.usage} استخدام، جودة ${model.avgQuality}`);
    });

    // التوصيات
    console.log('التوصيات:');
    report.recommendations.forEach((recommendation, index) => {
      console.log(`${index + 1}. ${recommendation}`);
    });

    // إحصائيات سريعة
    const stats = PerformanceMonitor.getQuickStats();
    console.log('الجلسات النشطة:', stats.activeSessions);
    console.log('الجلسات المكتملة:', stats.completedSessions);
    console.log('متوسط الجودة اليوم:', stats.avgQualityToday);
    console.log('متوسط وقت التنفيذ اليوم:', stats.avgExecutionTimeToday, 'ms');

    return session;
  } catch (error) {
    console.error('خطأ في مراقبة الأداء:', error.message);
    throw error;
  }
}

// استخدام الدالة
advancedPerformanceMonitoring()
  .then(session => console.log('تم المراقبة بنجاح'))
  .catch(error => console.error('فشل المراقبة:', error));
```

## أمثلة معالجة الأخطاء

### 1. معالجة أخطاء الذكاء الاصطناعي

```typescript
import { AIErrorHandler } from '@/ai/core';

async function handleAIErrors() {
  try {
    // محاولة تنفيذ مهمة الذكاء الاصطناعي
    const result = await ai.generate(prompt);
    return result;
  } catch (error) {
    console.log('تم اكتشاف خطأ، بدء معالجة الأخطاء...');

    const errorResult = await AIErrorHandler.handleAIError(error, {
      model: 'googleai/gemini-1.5-pro',
      prompt: prompt,
      input: { task: 'generation' },
      attempt: 1,
      maxAttempts: 3,
      fallbackModel: 'googleai/gemini-2.0-flash'
    });

    console.log('نوع الخطأ:', errorResult.error?.code);
    console.log('شدة الخطأ:', errorResult.error?.severity);
    console.log('هل يمكن إعادة المحاولة:', errorResult.error?.isRetryable);
    console.log('هل متاح حل احتياطي:', errorResult.error?.fallbackAvailable);

    if (errorResult.strategies && errorResult.strategies.length > 0) {
      console.log('استراتيجيات التعافي المتاحة:');
      errorResult.strategies.forEach((strategy, index) => {
        console.log(`${index + 1}. ${strategy.description} (ثقة: ${strategy.confidence})`);
      });

      // تطبيق أفضل استراتيجية تعافي
      const bestStrategy = errorResult.strategies[0];
      console.log(`تطبيق استراتيجية التعافي: ${bestStrategy.description}`);

      try {
        const result = await bestStrategy.action();
        console.log('تم التعافي بنجاح');
        return result;
      } catch (strategyError) {
        console.error('فشلت استراتيجية التعافي:', strategyError.message);
      }
    }

    // إذا فشلت جميع الاستراتيجيات
    console.error('فشلت جميع استراتيجيات التعافي');
    throw errorResult.error;
  }
}

// استخدام الدالة
handleAIErrors()
  .then(result => console.log('تم التنفيذ بنجاح'))
  .catch(error => console.error('فشل التنفيذ:', error.message));
```

### 2. معالجة أخطاء التدفق الذكي

```typescript
import { IntelligentAISystem, AIHelpers } from '@/ai/core';

async function robustAIGeneration(config: any) {
  try {
    // محاولة استخدام التدفق الذكي الكامل
    const result = await IntelligentAISystem.runIntelligentFlow(config);
    return result;
  } catch (error) {
    console.error('خطأ في التدفق الذكي:', error.message);

    try {
      // محاولة استخدام المساعدات السريعة كبديل
      console.log('محاولة استخدام المساعدات السريعة كبديل...');

      const analysis = await AIHelpers.quickAnalyze(config.userInput);
      const suggestion = await AIHelpers.suggestModel(config.userInput, config.taskType);

      console.log('التحليل البديل:', analysis);
      console.log('اقتراح النموذج:', suggestion);

      // إنتاج محتوى بديل
      const fallbackResult = {
        output: `تم إنتاج محتوى بديل بناءً على التحليل السريع.\n\nالنوع: ${analysis.contentType}\nالتعقيد: ${analysis.complexity}\nالجمهور: ${analysis.audience}\nالنموذج المقترح: ${suggestion.model}`,
        qualityScore: 60,
        iterations: 1,
        modelUsed: suggestion.model,
        fallbackUsed: true,
        analysis: analysis,
        suggestion: suggestion
      };

      console.log('تم إنتاج محتوى بديل بنجاح');
      return fallbackResult;
    } catch (fallbackError) {
      console.error('فشل البديل:', fallbackError.message);

      // إنتاج محتوى افتراضي
      const defaultResult = {
        output: 'عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى لاحقاً.',
        qualityScore: 0,
        iterations: 0,
        modelUsed: 'none',
        fallbackUsed: true,
        error: error.message
      };

      return defaultResult;
    }
  }
}

// استخدام الدالة
const config = {
  userInput: "أنشئ خطة عمل لمشروع تقني",
  taskType: "generation",
  domain: "business",
  qualityThreshold: 85,
  maxIterations: 3,
  enableIterativeImprovement: true,
  enablePerformanceMonitoring: true
};

robustAIGeneration(config)
  .then(result => {
    if (result.fallbackUsed) {
      console.log('تم استخدام البديل');
    } else {
      console.log('تم التنفيذ بنجاح');
    }
  })
  .catch(error => console.error('فشل التنفيذ:', error.message));
```

## أمثلة التخصيص

### 1. تخصيص معايير الجودة

```typescript
import { IntelligentAISystem } from '@/ai/core';

async function customQualityStandards() {
  try {
    const result = await IntelligentAISystem.runIntelligentFlow({
      userInput: "أنشئ خطة عمل لمشروع تقني",
      taskType: "generation",
      domain: "business",
      qualityThreshold: 95, // حد جودة عالي
      maxIterations: 5, // تكرارات أكثر
      enableIterativeImprovement: true,
      enablePerformanceMonitoring: true
    });

    // تحليل مقاييس الجودة
    if (result.performanceMetrics) {
      const metrics = result.performanceMetrics;
      console.log('مقاييس الجودة:');
      console.log('- الاكتمال:', metrics.qualityScore);
      console.log('- الدقة:', metrics.finalAccuracy);
      console.log('- عدد التكرارات:', metrics.improvementIterations);
      console.log('- وقت التنفيذ:', metrics.executionTime, 'ms');
    }

    return result;
  } catch (error) {
    console.error('خطأ في التوليد:', error.message);
    throw error;
  }
}

// استخدام الدالة
customQualityStandards()
  .then(result => console.log('تم التوليد بمعايير مخصصة'))
  .catch(error => console.error('فشل التوليد:', error));
```

### 2. تخصيص استراتيجيات التحسين

```typescript
import { IterativeImprovementEngine } from '@/ai/core';

async function customImprovementStrategy() {
  try {
    const session = await IterativeImprovementEngine.runImprovementSession(
      "أنشئ نظام إدارة قاعدة بيانات متقدم",
      'generation',
      'software_engineering',
      undefined, // بدون سياق خارجي
      {
        maxIterations: 7, // تكرارات أكثر
        qualityThreshold: 98, // حد جودة عالي جداً
        improvementStrategy: 'aggressive', // استراتيجية عدوانية
        focusAreas: ['completeness', 'accuracy', 'structure'], // مجالات تركيز محددة
        allowModelSwitching: true
      }
    );

    console.log('نتائج التحسين المخصص:');
    console.log('- عدد التكرارات:', session.iterations.length);
    console.log('- نقاط التحسين الإجمالية:', session.totalImprovementScore);
    console.log('- الحالة:', session.status);

    // تحليل كل تكرار
    session.iterations.forEach((iteration, index) => {
      console.log(`التكرار ${index + 1}:`);
      console.log(`- نقاط الجودة: ${iteration.qualityScore}`);
      console.log(`- النموذج المستخدم: ${iteration.modelUsed}`);
      console.log(`- عدد المشاكل: ${iteration.issues.length}`);
      console.log(`- عدد التحسينات: ${iteration.improvements.length}`);
    });

    return session;
  } catch (error) {
    console.error('خطأ في التحسين المخصص:', error.message);
    throw error;
  }
}

// استخدام الدالة
customImprovementStrategy()
  .then(session => console.log('تم التحسين المخصص بنجاح'))
  .catch(error => console.error('فشل التحسين المخصص:', error));
```

## أمثلة التكامل

### 1. تكامل مع نظام إدارة المحتوى

```typescript
import { IntelligentAISystem } from '@/ai/core';

class ContentManagementSystem {
  private contentStore: Map<string, any> = new Map();

  async generateContent(request: {
    title: string;
    type: 'article' | 'report' | 'proposal';
    requirements: string[];
    context?: any;
  }) {
    try {
      const result = await IntelligentAISystem.runIntelligentFlow({
        userInput: `أنشئ ${request.type} بعنوان "${request.title}"`,
        taskType: "generation",
        domain: request.type,
        externalContext: request.context ? [
          {
            fileName: "context.json",
            content: JSON.stringify(request.context),
            type: "context"
          }
        ] : undefined,
        guidelines: request.requirements,
        qualityThreshold: 85,
        maxIterations: 3,
        enableIterativeImprovement: true,
        enablePerformanceMonitoring: true
      });

      // حفظ المحتوى
      const contentId = this.generateContentId();
      this.contentStore.set(contentId, {
        id: contentId,
        title: request.title,
        type: request.type,
        content: result.output,
        qualityScore: result.qualityScore,
        modelUsed: result.modelUsed,
        createdAt: new Date(),
        metadata: result.performanceMetrics
      });

      return {
        id: contentId,
        content: result.output,
        qualityScore: result.qualityScore,
        modelUsed: result.modelUsed
      };
    } catch (error) {
      console.error('خطأ في توليد المحتوى:', error.message);
      throw error;
    }
  }

  async improveContent(contentId: string, feedback: string[]) {
    try {
      const content = this.contentStore.get(contentId);
      if (!content) {
        throw new Error('المحتوى غير موجود');
      }

      const result = await IntelligentAISystem.runIntelligentFlow({
        userInput: `حسن المحتوى التالي بناءً على الملاحظات: ${feedback.join(', ')}`,
        taskType: "improvement",
        domain: content.type,
        externalContext: [
          {
            fileName: "original-content.txt",
            content: content.content,
            type: "context"
          }
        ],
        guidelines: feedback,
        qualityThreshold: 90,
        maxIterations: 3,
        enableIterativeImprovement: true,
        enablePerformanceMonitoring: true
      });

      // تحديث المحتوى
      content.content = result.output;
      content.qualityScore = result.qualityScore;
      content.modelUsed = result.modelUsed;
      content.updatedAt = new Date();

      return {
        id: contentId,
        content: result.output,
        qualityScore: result.qualityScore,
        modelUsed: result.modelUsed
      };
    } catch (error) {
      console.error('خطأ في تحسين المحتوى:', error.message);
      throw error;
    }
  }

  private generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// استخدام النظام
const cms = new ContentManagementSystem();

// توليد محتوى جديد
cms.generateContent({
  title: "خطة عمل لمشروع تقني",
  type: "proposal",
  requirements: [
    "يجب أن يكون المحتوى مهنياً",
    "استخدم اللغة العربية الفصحى",
    "ركز على الجوانب المالية"
  ],
  context: {
    budget: 100000,
    timeline: "6 أشهر",
    team: 5
  }
})
.then(result => {
  console.log('تم توليد المحتوى:', result.id);
  console.log('نقاط الجودة:', result.qualityScore);

  // تحسين المحتوى
  return cms.improveContent(result.id, [
    "أضف المزيد من التفاصيل التقنية",
    "حسن الهيكل والتنظيم"
  ]);
})
.then(improved => {
  console.log('تم تحسين المحتوى:', improved.id);
  console.log('نقاط الجودة الجديدة:', improved.qualityScore);
})
.catch(error => console.error('خطأ:', error.message));
```

### 2. تكامل مع نظام إدارة المشاريع

```typescript
import { IntelligentAISystem, PerformanceMonitor } from '@/ai/core';

class ProjectManagementSystem {
  private projects: Map<string, any> = new Map();

  async createProject(projectData: {
    name: string;
    description: string;
    requirements: string[];
    team: string[];
    deadline: Date;
  }) {
    try {
      // بدء مراقبة الأداء
      const sessionId = PerformanceMonitor.startSession({
        taskType: 'generation',
        domain: 'project_management',
        userInput: `أنشئ خطة مشروع لـ ${projectData.name}`
      });

      const result = await IntelligentAISystem.runIntelligentFlow({
        userInput: `أنشئ خطة مشروع شاملة لـ ${projectData.name}`,
        taskType: "generation",
        domain: "project_management",
        externalContext: [
          {
            fileName: "project-requirements.txt",
            content: projectData.requirements.join('\n'),
            type: "context"
          },
          {
            fileName: "team-info.json",
            content: JSON.stringify(projectData.team),
            type: "context"
          }
        ],
        guidelines: [
          "يجب أن تكون الخطة واقعية",
          "راعي الموارد المتاحة",
          "تضمن الجدول الزمني",
          "تضمن إدارة المخاطر"
        ],
        qualityThreshold: 85,
        maxIterations: 3,
        enableIterativeImprovement: true,
        enablePerformanceMonitoring: true
      });

      // إنهاء مراقبة الأداء
      const session = PerformanceMonitor.endSession(sessionId, true);

      // إنشاء المشروع
      const projectId = this.generateProjectId();
      const project = {
        id: projectId,
        name: projectData.name,
        description: projectData.description,
        plan: result.output,
        qualityScore: result.qualityScore,
        modelUsed: result.modelUsed,
        team: projectData.team,
        deadline: projectData.deadline,
        status: 'planning',
        createdAt: new Date(),
        performanceMetrics: session?.metrics
      };

      this.projects.set(projectId, project);

      return project;
    } catch (error) {
      console.error('خطأ في إنشاء المشروع:', error.message);
      throw error;
    }
  }

  async generateProjectReport(projectId: string) {
    try {
      const project = this.projects.get(projectId);
      if (!project) {
        throw new Error('المشروع غير موجود');
      }

      const result = await IntelligentAISystem.runIntelligentFlow({
        userInput: `أنشئ تقرير حالة للمشروع ${project.name}`,
        taskType: "analysis",
        domain: "project_management",
        externalContext: [
          {
            fileName: "project-plan.txt",
            content: project.plan,
            type: "context"
          },
          {
            fileName: "project-data.json",
            content: JSON.stringify({
              team: project.team,
              deadline: project.deadline,
              status: project.status,
              createdAt: project.createdAt
            }),
            type: "context"
          }
        ],
        guidelines: [
          "حلل التقدم المحرز",
          "حدد التحديات",
          "قدم التوصيات",
          "تضمن المؤشرات الرئيسية"
        ],
        qualityThreshold: 80,
        maxIterations: 2,
        enableIterativeImprovement: true,
        enablePerformanceMonitoring: true
      });

      return {
        projectId: projectId,
        report: result.output,
        qualityScore: result.qualityScore,
        modelUsed: result.modelUsed,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('خطأ في توليد التقرير:', error.message);
      throw error;
    }
  }

  private generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// استخدام النظام
const pms = new ProjectManagementSystem();

// إنشاء مشروع جديد
pms.createProject({
  name: "نظام إدارة قاعدة البيانات",
  description: "تطوير نظام إدارة قاعدة بيانات متقدم",
  requirements: [
    "نظام إدارة المستخدمين",
    "واجهة ويب حديثة",
    "قاعدة بيانات آمنة",
    "نظام تقارير"
  ],
  team: ["أحمد محمد", "فاطمة علي", "محمد حسن"],
  deadline: new Date('2024-06-01')
})
.then(project => {
  console.log('تم إنشاء المشروع:', project.id);
  console.log('نقاط الجودة:', project.qualityScore);

  // توليد تقرير المشروع
  return pms.generateProjectReport(project.id);
})
.then(report => {
  console.log('تم توليد التقرير للمشروع:', report.projectId);
  console.log('نقاط الجودة:', report.qualityScore);
})
.catch(error => console.error('خطأ:', error.message));
```

## أفضل الممارسات

### 1. استخدام التدفق الذكي للمهام المعقدة

```typescript
// ✅ جيد - استخدام التدفق الذكي للمهام المعقدة
const complexResult = await IntelligentAISystem.runIntelligentFlow({
  userInput: "أنشئ خطة عمل شاملة لمشروع تقني معقد",
  taskType: "generation",
  domain: "business",
  externalContext: [/* سياق مفصل */],
  guidelines: [/* إرشادات محددة */],
  qualityThreshold: 85,
  maxIterations: 3,
  enableIterativeImprovement: true,
  enablePerformanceMonitoring: true
});

// ❌ سيء - استخدام التحليل السريع للمهام المعقدة
const simpleAnalysis = await AIHelpers.quickAnalyze("أنشئ خطة عمل شاملة لمشروع تقني معقد");
```

### 2. استخدام المساعدات السريعة للمهام البسيطة

```typescript
// ✅ جيد - استخدام المساعدات السريعة للمهام البسيطة
const quickAnalysis = await AIHelpers.quickAnalyze("ترجم هذه الجملة");
const quickValidation = await AIHelpers.quickValidate(output, input);
const quickSuggestion = await AIHelpers.suggestModel(text, "translation");

// ❌ سيء - استخدام التدفق الذكي للمهام البسيطة
const complexResult = await IntelligentAISystem.runIntelligentFlow({
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

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: Usage Examples
