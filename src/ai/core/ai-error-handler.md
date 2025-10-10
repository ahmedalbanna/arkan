# AI Error Handler - معالج أخطاء الذكاء الاصطناعي

## نظرة عامة

`AIErrorHandler` هو مكون متقدم لمعالجة أخطاء الذكاء الاصطناعي مع استراتيجيات تعافي ذكية. يوفر تحليلاً شاملاً للأخطاء ويقترح حلولاً مناسبة لكل نوع خطأ.

## الوظائف الرئيسية

### 1. معالجة أخطاء الذكاء الاصطناعي
- تحليل شامل للأخطاء
- تحديد نوع الخطأ وشدة
- إنتاج خطأ محسن مع تفاصيل
- تسجيل شامل للأخطاء

### 2. استراتيجيات التعافي
- إعادة المحاولة الذكية
- استخدام النماذج الاحتياطية
- تبسيط المحفزات
- استخدام الاستجابات المحفوظة
- طلب المساعدة من المستخدم

### 3. إدارة النماذج الاحتياطية
- تحديد النماذج الاحتياطية لكل نموذج
- تبديل تلقائي عند الحاجة
- ضمان الاستمرارية

### 4. تحسين المحفزات والسياق
- تبسيط المحفزات المعقدة
- تقليل حجم السياق
- إزالة الأجزاء المشكلة

## API Reference

### AIErrorHandler.handleAIError()

```typescript
/**
 * معالجة خطأ الذكاء الاصطناعي مع استراتيجيات التعافي
 * @param error - الخطأ المراد معالجته
 * @param context - سياق الخطأ
 * @param context.model - النموذج المستخدم
 * @param context.prompt - المحفز المستخدم
 * @param context.input - المدخلات
 * @param context.contextAnalysis - تحليل السياق (اختياري)
 * @param context.attempt - رقم المحاولة
 * @param context.maxAttempts - الحد الأقصى للمحاولات
 * @param context.fallbackModel - النموذج الاحتياطي (اختياري)
 * @returns Promise<{success: boolean; result?: any; error?: EnhancedError; strategies?: AIErrorRecoveryStrategy[]}> - نتيجة المعالجة
 * @throws {Error} عند فشل معالجة الخطأ
 * @example
 * ```typescript
 * import { AIErrorHandler } from '@/ai/core';
 *
 * try {
 *   // تنفيذ مهمة الذكاء الاصطناعي
 *   const result = await ai.generate(prompt);
 * } catch (error) {
 *   const errorResult = await AIErrorHandler.handleAIError(error, {
 *     model: 'googleai/gemini-1.5-pro',
 *     prompt: 'أنشئ خطة عمل',
 *     input: { task: 'business_plan' },
 *     attempt: 1,
 *     maxAttempts: 3,
 *     fallbackModel: 'googleai/gemini-2.0-flash'
 *   });
 *
 *   if (errorResult.strategies && errorResult.strategies.length > 0) {
 *     // تطبيق استراتيجية التعافي
 *     const strategy = errorResult.strategies[0];
 *     console.log(`استراتيجية التعافي: ${strategy.description}`);
 *   }
 * }
 * ```
 */
static async handleAIError(
  error: unknown,
  context: AIErrorContext
): Promise<{ success: boolean; result?: any; error?: EnhancedError; strategies?: AIErrorRecoveryStrategy[] }>
```

### AIErrorHandler.getFallbackModel()

```typescript
/**
 * الحصول على نموذج احتياطي
 * @param currentModel - النموذج الحالي
 * @returns string | null - النموذج الاحتياطي أو null
 * @example
 * ```typescript
 * const fallbackModel = AIErrorHandler.getFallbackModel('googleai/gemini-1.5-pro');
 * console.log(fallbackModel); // "googleai/gemini-2.0-flash"
 *
 * const noFallback = AIErrorHandler.getFallbackModel('unknown-model');
 * console.log(noFallback); // null
 * ```
 */
static getFallbackModel(currentModel: string): string | null
```

### AIErrorHandler.simplifyPrompt()

```typescript
/**
 * تبسيط الـ prompt
 * @param prompt - المحفز المراد تبسيطه
 * @param contextAnalysis - تحليل السياق (اختياري)
 * @returns string - المحفز المبسط
 * @example
 * ```typescript
 * const simplifiedPrompt = AIErrorHandler.simplifyPrompt(
 *   "محفز معقد جداً مع أمثلة كثيرة...",
 *   contextAnalysis
 * );
 *
 * console.log(simplifiedPrompt);
 * // "محفز مبسط مع التعليمات الأساسية فقط"
 * ```
 */
static simplifyPrompt(prompt: string, contextAnalysis?: ContextAnalysisResult): string
```

### AIErrorHandler.reduceContextSize()

```typescript
/**
 * تقليل حجم السياق
 * @param context - السياق المراد تقليله
 * @param maxSize - الحد الأقصى للحجم (افتراضي: 1000)
 * @returns any - السياق المقلل
 * @example
 * ```typescript
 * const reducedContext = AIErrorHandler.reduceContextSize(
 *   { largeData: "بيانات كبيرة جداً..." },
 *   500
 * );
 *
 * console.log(reducedContext);
 * // { largeData: "بيانات كبيرة..." }
 * ```
 */
static reduceContextSize(context: any, maxSize: number = 1000): any
```

## أنواع البيانات

### AIErrorContext

```typescript
/**
 * سياق خطأ الذكاء الاصطناعي
 */
export interface AIErrorContext {
  /** النموذج المستخدم */
  model: string;

  /** المحفز المستخدم */
  prompt: string;

  /** المدخلات */
  input: any;

  /** تحليل السياق (اختياري) */
  contextAnalysis?: ContextAnalysisResult;

  /** رقم المحاولة */
  attempt: number;

  /** الحد الأقصى للمحاولات */
  maxAttempts: number;

  /** النموذج الاحتياطي (اختياري) */
  fallbackModel?: string;
}
```

### AIErrorRecoveryStrategy

```typescript
/**
 * استراتيجية تعافي خطأ الذكاء الاصطناعي
 */
export interface AIErrorRecoveryStrategy {
  /** نوع الاستراتيجية */
  type: 'retry' | 'fallback_model' | 'simplified_prompt' | 'cached_response' | 'manual';

  /** وصف الاستراتيجية */
  description: string;

  /** الإجراء المطلوب */
  action: () => Promise<any>;

  /** مستوى الثقة (0-1) */
  confidence: number;
}
```

## أنواع الأخطاء المدعومة

### 1. انتهاء المهلة (Timeout)

```typescript
// مثال خطأ انتهاء المهلة
const timeoutError = new Error('Request timed out after 30 seconds');

const errorResult = await AIErrorHandler.handleAIError(timeoutError, {
  model: 'googleai/gemini-1.5-pro',
  prompt: 'محفز طويل جداً...',
  input: { task: 'complex_analysis' },
  attempt: 1,
  maxAttempts: 3
});

// استراتيجيات التعافي المقترحة:
// - إعادة المحاولة
// - استخدام استجابة محفوظة
// - تبسيط المحفز
```

### 2. تجاوز الحد المسموح (Rate Limit)

```typescript
// مثال خطأ تجاوز الحد المسموح
const rateLimitError = new Error('Rate limit exceeded. Try again in 60 seconds.');

const errorResult = await AIErrorHandler.handleAIError(rateLimitError, {
  model: 'googleai/gemini-1.5-pro',
  prompt: 'محفز عادي',
  input: { task: 'simple_task' },
  attempt: 1,
  maxAttempts: 3,
  fallbackModel: 'googleai/gemini-2.0-flash'
});

// استراتيجيات التعافي المقترحة:
// - استخدام النموذج الاحتياطي
// - إعادة المحاولة بعد فترة
// - استخدام استجابة محفوظة
```

### 3. طلب غير صحيح (Invalid Request)

```typescript
// مثال خطأ طلب غير صحيح
const invalidRequestError = new Error('Invalid request: malformed prompt');

const errorResult = await AIErrorHandler.handleAIError(invalidRequestError, {
  model: 'googleai/gemini-1.5-pro',
  prompt: 'محفز غير صحيح...',
  input: { task: 'invalid_task' },
  attempt: 1,
  maxAttempts: 3
});

// استراتيجيات التعافي المقترحة:
// - تبسيط المحفز
// - طلب المساعدة من المستخدم
```

### 4. نموذج غير متاح (Model Unavailable)

```typescript
// مثال خطأ نموذج غير متاح
const modelUnavailableError = new Error('Model googleai/gemini-1.5-pro is currently unavailable');

const errorResult = await AIErrorHandler.handleAIError(modelUnavailableError, {
  model: 'googleai/gemini-1.5-pro',
  prompt: 'محفز عادي',
  input: { task: 'normal_task' },
  attempt: 1,
  maxAttempts: 3,
  fallbackModel: 'googleai/gemini-2.0-flash'
});

// استراتيجيات التعافي المقترحة:
// - استخدام النموذج الاحتياطي
// - إعادة المحاولة
```

### 5. انتهاك سياسة المحتوى (Content Policy)

```typescript
// مثال خطأ انتهاك سياسة المحتوى
const contentPolicyError = new Error('Content policy violation: inappropriate content detected');

const errorResult = await AIErrorHandler.handleAIError(contentPolicyError, {
  model: 'googleai/gemini-1.5-pro',
  prompt: 'محفز يحتوي على محتوى غير مناسب',
  input: { task: 'inappropriate_task' },
  attempt: 1,
  maxAttempts: 3
});

// استراتيجيات التعافي المقترحة:
// - تبسيط المحفز
// - طلب المساعدة من المستخدم
```

### 6. خطأ شبكة (Network Error)

```typescript
// مثال خطأ شبكة
const networkError = new Error('Network connection failed');

const errorResult = await AIErrorHandler.handleAIError(networkError, {
  model: 'googleai/gemini-1.5-pro',
  prompt: 'محفز عادي',
  input: { task: 'normal_task' },
  attempt: 1,
  maxAttempts: 3
});

// استراتيجيات التعافي المقترحة:
// - إعادة المحاولة
// - استخدام استجابة محفوظة
```

## أمثلة الاستخدام

### 1. معالجة خطأ أساسية

```typescript
import { AIErrorHandler } from '@/ai/core';

try {
  const result = await ai.generate(prompt);
  return result;
} catch (error) {
  const errorResult = await AIErrorHandler.handleAIError(error, {
    model: 'googleai/gemini-1.5-pro',
    prompt: prompt,
    input: { task: 'generation' },
    attempt: 1,
    maxAttempts: 3,
    fallbackModel: 'googleai/gemini-2.0-flash'
  });

  if (errorResult.strategies && errorResult.strategies.length > 0) {
    const strategy = errorResult.strategies[0];
    console.log(`استراتيجية التعافي: ${strategy.description}`);
    console.log(`مستوى الثقة: ${strategy.confidence}`);

    // تطبيق الاستراتيجية
    try {
      const result = await strategy.action();
      return result;
    } catch (strategyError) {
      console.error('فشلت استراتيجية التعافي:', strategyError);
      throw errorResult.error;
    }
  }

  throw errorResult.error;
}
```

### 2. معالجة خطأ مع إعادة المحاولة

```typescript
async function generateWithRetry(prompt: string, maxAttempts: number = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await ai.generate(prompt);
      return result;
    } catch (error) {
      const errorResult = await AIErrorHandler.handleAIError(error, {
        model: 'googleai/gemini-1.5-pro',
        prompt: prompt,
        input: { task: 'generation' },
        attempt: attempt,
        maxAttempts: maxAttempts,
        fallbackModel: 'googleai/gemini-2.0-flash'
      });

      if (attempt === maxAttempts) {
        throw errorResult.error;
      }

      // تطبيق استراتيجية التعافي
      if (errorResult.strategies) {
        const retryStrategy = errorResult.strategies.find(s => s.type === 'retry');
        if (retryStrategy) {
          console.log(`إعادة المحاولة ${attempt + 1} من ${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // انتظار متزايد
          continue;
        }
      }

      throw errorResult.error;
    }
  }
}
```

### 3. معالجة خطأ مع تبديل النموذج

```typescript
async function generateWithFallback(prompt: string) {
  let currentModel = 'googleai/gemini-1.5-pro';

  try {
    const result = await ai.generate(prompt, { model: currentModel });
    return result;
  } catch (error) {
    const errorResult = await AIErrorHandler.handleAIError(error, {
      model: currentModel,
      prompt: prompt,
      input: { task: 'generation' },
      attempt: 1,
      maxAttempts: 3,
      fallbackModel: 'googleai/gemini-2.0-flash'
    });

    // البحث عن استراتيجية تبديل النموذج
    const fallbackStrategy = errorResult.strategies?.find(s => s.type === 'fallback_model');
    if (fallbackStrategy) {
      console.log(`تبديل إلى النموذج الاحتياطي: ${fallbackStrategy.description}`);

      // الحصول على النموذج الاحتياطي
      const fallbackModel = AIErrorHandler.getFallbackModel(currentModel);
      if (fallbackModel) {
        try {
          const result = await ai.generate(prompt, { model: fallbackModel });
          return result;
        } catch (fallbackError) {
          console.error('فشل النموذج الاحتياطي:', fallbackError);
        }
      }
    }

    throw errorResult.error;
  }
}
```

### 4. معالجة خطأ مع تبسيط المحفز

```typescript
async function generateWithSimplifiedPrompt(originalPrompt: string) {
  try {
    const result = await ai.generate(originalPrompt);
    return result;
  } catch (error) {
    const errorResult = await AIErrorHandler.handleAIError(error, {
      model: 'googleai/gemini-1.5-pro',
      prompt: originalPrompt,
      input: { task: 'generation' },
      attempt: 1,
      maxAttempts: 3
    });

    // البحث عن استراتيجية تبسيط المحفز
    const simplifyStrategy = errorResult.strategies?.find(s => s.type === 'simplified_prompt');
    if (simplifyStrategy) {
      console.log(`تبسيط المحفز: ${simplifyStrategy.description}`);

      // تبسيط المحفز
      const simplifiedPrompt = AIErrorHandler.simplifyPrompt(originalPrompt);

      try {
        const result = await ai.generate(simplifiedPrompt);
        return result;
      } catch (simplifyError) {
        console.error('فشل المحفز المبسط:', simplifyError);
      }
    }

    throw errorResult.error;
  }
}
```

### 5. معالجة خطأ مع تقليل السياق

```typescript
async function generateWithReducedContext(prompt: string, context: any) {
  try {
    const result = await ai.generate(prompt, { context });
    return result;
  } catch (error) {
    const errorResult = await AIErrorHandler.handleAIError(error, {
      model: 'googleai/gemini-1.5-pro',
      prompt: prompt,
      input: { task: 'generation', context },
      attempt: 1,
      maxAttempts: 3
    });

    // تقليل حجم السياق
    const reducedContext = AIErrorHandler.reduceContextSize(context, 1000);

    try {
      const result = await ai.generate(prompt, { context: reducedContext });
      return result;
    } catch (reduceError) {
      console.error('فشل السياق المقلل:', reduceError);
      throw errorResult.error;
    }
  }
}
```

## أفضل الممارسات

### 1. معالجة شاملة للأخطاء

```typescript
// ✅ جيد - معالجة شاملة
async function robustAIGeneration(prompt: string, context: any) {
  let attempt = 1;
  const maxAttempts = 3;

  while (attempt <= maxAttempts) {
    try {
      const result = await ai.generate(prompt, { context });
      return result;
    } catch (error) {
      const errorResult = await AIErrorHandler.handleAIError(error, {
        model: 'googleai/gemini-1.5-pro',
        prompt: prompt,
        input: { task: 'generation', context },
        attempt: attempt,
        maxAttempts: maxAttempts,
        fallbackModel: 'googleai/gemini-2.0-flash'
      });

      if (attempt === maxAttempts) {
        throw errorResult.error;
      }

      // تطبيق أفضل استراتيجية تعافي
      if (errorResult.strategies && errorResult.strategies.length > 0) {
        const bestStrategy = errorResult.strategies[0]; // أعلى ثقة

        try {
          const result = await bestStrategy.action();
          return result;
        } catch (strategyError) {
          console.warn(`فشلت استراتيجية التعافي: ${bestStrategy.description}`);
        }
      }

      attempt++;
    }
  }
}

// ❌ سيء - معالجة محدودة
async function basicAIGeneration(prompt: string) {
  try {
    const result = await ai.generate(prompt);
    return result;
  } catch (error) {
    throw error; // بدون معالجة
  }
}
```

### 2. استخدام النماذج الاحتياطية

```typescript
// ✅ جيد - نماذج احتياطية محددة
const fallbackModels = {
  'googleai/gemini-1.5-pro': 'googleai/gemini-2.0-flash',
  'googleai/gemini-2.0-flash': 'googleai/gemini-1.5-flash',
  'googleai/gemini-1.5-flash': 'googleai/gemini-2.0-flash'
};

async function generateWithFallback(prompt: string, primaryModel: string) {
  try {
    const result = await ai.generate(prompt, { model: primaryModel });
    return result;
  } catch (error) {
    const fallbackModel = fallbackModels[primaryModel];
    if (fallbackModel) {
      try {
        const result = await ai.generate(prompt, { model: fallbackModel });
        return result;
      } catch (fallbackError) {
        console.error('فشل النموذج الاحتياطي:', fallbackError);
      }
    }

    throw error;
  }
}
```

### 3. تسجيل الأخطاء

```typescript
// ✅ جيد - تسجيل شامل
async function generateWithLogging(prompt: string) {
  try {
    const result = await ai.generate(prompt);
    return result;
  } catch (error) {
    const errorResult = await AIErrorHandler.handleAIError(error, {
      model: 'googleai/gemini-1.5-pro',
      prompt: prompt,
      input: { task: 'generation' },
      attempt: 1,
      maxAttempts: 3
    });

    // تسجيل الخطأ
    console.error('خطأ في الذكاء الاصطناعي:', {
      code: errorResult.error?.code,
      message: errorResult.error?.message,
      severity: errorResult.error?.severity,
      strategies: errorResult.strategies?.map(s => s.description)
    });

    // إرسال إلى خدمة المراقبة
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ai_error', {
        error_code: errorResult.error?.code,
        error_type: errorResult.error?.context?.errorType,
        model: 'googleai/gemini-1.5-pro',
        attempt: 1,
        severity: errorResult.error?.severity
      });
    }

    throw errorResult.error;
  }
}
```

## معالجة الأخطاء

### 1. أخطاء معالجة الخطأ

```typescript
try {
  const errorResult = await AIErrorHandler.handleAIError(error, context);
} catch (handlerError) {
  console.error('خطأ في معالج الأخطاء:', handlerError.message);
  // استخدام معالجة بديلة
}
```

### 2. أخطاء الاستراتيجيات

```typescript
try {
  const result = await strategy.action();
} catch (strategyError) {
  console.error('فشلت استراتيجية التعافي:', strategyError.message);
  // تجربة استراتيجية أخرى
}
```

## الاختبار

### 1. اختبار معالجة الأخطاء

```typescript
import { AIErrorHandler } from '@/ai/core';

describe('AIErrorHandler', () => {
  test('should handle timeout error correctly', async () => {
    const timeoutError = new Error('Request timed out');

    const errorResult = await AIErrorHandler.handleAIError(timeoutError, {
      model: 'googleai/gemini-1.5-pro',
      prompt: 'test prompt',
      input: { task: 'test' },
      attempt: 1,
      maxAttempts: 3
    });

    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBeDefined();
    expect(errorResult.strategies).toBeInstanceOf(Array);
    expect(errorResult.strategies?.length).toBeGreaterThan(0);
  });

  test('should suggest retry strategy for timeout', async () => {
    const timeoutError = new Error('Request timed out');

    const errorResult = await AIErrorHandler.handleAIError(timeoutError, {
      model: 'googleai/gemini-1.5-pro',
      prompt: 'test prompt',
      input: { task: 'test' },
      attempt: 1,
      maxAttempts: 3
    });

    const retryStrategy = errorResult.strategies?.find(s => s.type === 'retry');
    expect(retryStrategy).toBeDefined();
    expect(retryStrategy?.confidence).toBeGreaterThan(0);
  });
});
```

### 2. اختبار النماذج الاحتياطية

```typescript
test('should get fallback model correctly', () => {
  const fallbackModel = AIErrorHandler.getFallbackModel('googleai/gemini-1.5-pro');
  expect(fallbackModel).toBe('googleai/gemini-2.0-flash');

  const noFallback = AIErrorHandler.getFallbackModel('unknown-model');
  expect(noFallback).toBeNull();
});
```

### 3. اختبار تبسيط المحفزات

```typescript
test('should simplify prompt correctly', () => {
  const complexPrompt = `
    ### Instructions:
    Create a comprehensive business plan with detailed analysis...

    ### Examples:
    Example 1: Detailed example with complex structure...
    Example 2: Another complex example...

    ### Constraints:
    Must follow specific guidelines...
    Must include specific sections...
  `;

  const simplifiedPrompt = AIErrorHandler.simplifyPrompt(complexPrompt);

  expect(simplifiedPrompt).not.toContain('### Examples');
  expect(simplifiedPrompt).not.toContain('### Constraints');
  expect(simplifiedPrompt).toContain('Instructions');
});
```

## التطوير المستقبلي

### 1. تحسينات مقترحة
- دعم استراتيجيات تعافي مخصصة
- تحسين خوارزمية التحليل
- دعم التعافي المتوازي
- تحليل الاتجاهات التاريخية

### 2. إضافة مكونات جديدة
- محلل الأخطاء المتقدم
- محسن الاستراتيجيات
- نظام التوصيات الذكي
- محلل الاتجاهات

---

**آخر تحديث**: 2024
**الإصدار**: 1.0
**المكون**: AI Error Handler
