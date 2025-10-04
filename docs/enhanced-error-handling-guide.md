# دليل نظام معالجة الأخطاء المحسن

## نظرة عامة

نظام معالجة الأخطاء المحسن يوفر تجربة مستخدم ممتازة مع آليات تعافي ذكية وإرشادات واضحة. النظام مصمم ليكون سهل الاستخدام مع توفير مرونة كاملة للمطورين.

## الميزات الرئيسية

### 1. رسائل خطأ واضحة ومفهومة
- رسائل مخصصة للمستخدم باللغة العربية
- إرشادات واضحة لحل المشكلة
- إجراءات مقترحة للمستخدم

### 2. آليات إعادة المحاولة الذكية
- إعادة محاولة تلقائية للأخطاء المؤقتة
- تأخير متدرج بين المحاولات
- حد أقصى للمحاولات قابل للتخصيص

### 3. حلول احتياطية
- استراتيجيات تعافي متعددة
- نماذج احتياطية للذكاء الاصطناعي
- حلول مبسطة عند الفشل

### 4. مراقبة وتتبع متقدم
- إحصائيات مفصلة عن الأخطاء
- تنبيهات للأخطاء الحرجة
- تتبع الاتجاهات والأنماط

## الاستخدام الأساسي

### 1. استخدام Hook المحسن

```typescript
import { useEnhancedErrorHandling } from '@/hooks/use-enhanced-error-handling';

function MyComponent() {
  const {
    hasError,
    error,
    isRetrying,
    executeWithErrorHandling,
    retry,
    clearError
  } = useEnhancedErrorHandling({
    operationId: 'my-operation',
    maxRetries: 3,
    autoRetry: true
  });

  const handleOperation = async () => {
    await executeWithErrorHandling(
      async () => {
        // العملية التي قد تفشل
        const result = await riskyOperation();
        return result;
      },
      'ai_generation', // فئة الخطأ
      'medium' // شدة الخطأ
    );
  };

  return (
    <div>
      {hasError && error && (
        <ErrorRecovery
          error={error}
          onRetry={retry}
          onDismiss={clearError}
          isRetrying={isRetrying}
        />
      )}
      <button onClick={handleOperation}>
        تنفيذ العملية
      </button>
    </div>
  );
}
```

### 2. استخدام النظام المحسن مباشرة

```typescript
import { ErrorHandler } from '@/core/utils/error-handler';

try {
  await riskyOperation();
} catch (error) {
  ErrorHandler.handleEnhanced(
    error,
    'ai_generation', // فئة الخطأ
    'medium', // شدة الخطأ
    {
      operationId: 'my-operation',
      userId: 'user123',
      showToast: true
    }
  );
}
```

### 3. استخدام مكونات التعافي

```typescript
import { ErrorRecovery, SimpleError, ConnectionStatus } from '@/components/ui/error-recovery';

// خطأ معقد مع خيارات تعافي
<ErrorRecovery
  error={error}
  onRetry={handleRetry}
  onFallback={handleFallback}
  onDismiss={handleDismiss}
  isRetrying={isRetrying}
  retryProgress={retryProgress}
/>

// خطأ بسيط
<SimpleError
  message="حدث خطأ في الاتصال"
  onRetry={handleRetry}
  isRetrying={isRetrying}
/>

// حالة الاتصال
<ConnectionStatus
  isOnline={isOnline}
  onRetry={handleRetry}
/>
```

## أنواع الأخطاء المدعومة

### 1. أخطاء الشبكة
- `NETWORK_TIMEOUT`: انتهت مهلة الاتصال
- `NETWORK_ERROR`: فشل في الاتصال

### 2. أخطاء المصادقة
- `AUTH_EXPIRED`: انتهت صلاحية الجلسة
- `AUTH_INVALID`: بيانات دخول غير صحيحة

### 3. أخطاء التحقق من صحة البيانات
- `VALIDATION_REQUIRED`: حقول مطلوبة مفقودة
- `VALIDATION_FORMAT`: تنسيق غير صحيح

### 4. أخطاء الذكاء الاصطناعي
- `AI_GENERATION_FAILED`: فشل في التوليد
- `AI_QUALITY_LOW`: جودة منخفضة

### 5. أخطاء رفع الملفات
- `FILE_TOO_LARGE`: حجم ملف كبير
- `FILE_TYPE_INVALID`: نوع ملف غير مدعوم

## إعدادات التعافي

### 1. إعدادات إعادة المحاولة

```typescript
const errorHandling = useEnhancedErrorHandling({
  maxRetries: 3,           // عدد المحاولات
  retryDelay: 2,           // تأخير بين المحاولات (ثواني)
  backoffMultiplier: 2,    // مضاعف التأخير
  autoRetry: true          // إعادة محاولة تلقائية
});
```

### 2. إعدادات العرض

```typescript
const errorHandling = useEnhancedErrorHandling({
  showToast: true,         // إظهار إشعارات
  showInlineError: true,   // إظهار أخطاء مدمجة
  autoRetry: false         // إعادة محاولة تلقائية
});
```

### 3. إعدادات التتبع

```typescript
const errorHandling = useEnhancedErrorHandling({
  operationId: 'unique-id',
  userId: 'user123',
  sessionId: 'session456',
  requestId: 'req789'
});
```

## معالجة أخطاء الذكاء الاصطناعي

### 1. استخدام معالج أخطاء AI

```typescript
import { AIErrorHandler } from '@/ai/core/ai-error-handler';

const result = await AIErrorHandler.handleAIError(error, {
  model: 'googleai/gemini-1.5-pro',
  prompt: 'Your prompt here',
  input: inputData,
  attempt: 1,
  maxAttempts: 3,
  fallbackModel: 'googleai/gemini-2.0-flash'
});
```

### 2. استراتيجيات التعافي للذكاء الاصطناعي

- **إعادة المحاولة**: مع نفس النموذج
- **نموذج احتياطي**: استخدام نموذج مختلف
- **prompt مبسط**: تقليل تعقيد الـ prompt
- **استجابة محفوظة**: استخدام نتيجة سابقة
- **حل يدوي**: طلب مساعدة المستخدم

## مراقبة الأخطاء

### 1. استخدام خدمة المراقبة

```typescript
import { ErrorMonitoringService } from '@/core/utils/error-monitoring';

const monitoringService = ErrorMonitoringService.getInstance();

// تسجيل خطأ
monitoringService.recordError(error, 'operation-id');

// الحصول على المقاييس
const metrics = monitoringService.getMetrics();

// الحصول على الاتجاهات
const trends = monitoringService.getTrends('day');

// الحصول على التنبيهات
const alerts = monitoringService.getAlerts();
```

### 2. لوحة تحكم الأخطاء

```typescript
import { ErrorDashboard } from '@/components/admin/ErrorDashboard';

function AdminPanel() {
  return (
    <div>
      <ErrorDashboard />
    </div>
  );
}
```

## أفضل الممارسات

### 1. اختيار فئة الخطأ المناسبة

```typescript
// صحيح
await executeWithErrorHandling(operation, 'ai_generation', 'medium');

// خاطئ
await executeWithErrorHandling(operation, 'system', 'high');
```

### 2. استخدام شدة الخطأ المناسبة

```typescript
// أخطاء حرجة - تتطلب انتباه فوري
'critical': 'auth', 'permission', 'system'

// أخطاء عالية - مهمة ولكن ليست حرجة
'high': 'ai_generation', 'database', 'export'

// أخطاء متوسطة - شائعة ويمكن التعافي منها
'medium': 'network', 'file_upload', 'validation'

// أخطاء منخفضة - طفيفة ولا تؤثر على الوظائف الأساسية
'low': 'user_input', 'external_service'
```

### 3. تخصيص رسائل الخطأ

```typescript
const customError = createEnhancedError(
  'AI_GENERATION_FAILED',
  'ai_generation',
  'medium',
  {
    customMessage: 'فشل في توليد المحتوى المطلوب',
    customGuidance: 'يرجى المحاولة مرة أخرى أو تعديل المتطلبات'
  }
);
```

### 4. استخدام الحلول الاحتياطية

```typescript
const { hasFallback, error } = useEnhancedErrorHandling({
  fallbackStrategy: 'simplified',
  fallbackMessage: 'يمكننا تجربة توليد أبسط'
});

if (hasFallback && error) {
  // عرض خيار الحل الاحتياطي
  <Button onClick={handleFallback}>
    حل احتياطي
  </Button>
}
```

## التكامل مع الأنظمة الموجودة

### 1. التوافق العكسي

النظام الجديد متوافق مع النظام القديم:

```typescript
// النظام القديم - لا يزال يعمل
ErrorHandler.handle(error, 'context');

// النظام الجديد - محسن
ErrorHandler.handleEnhanced(error, 'category', 'severity');
```

### 2. الترحيل التدريجي

يمكن ترحيل المكونات تدريجياً:

```typescript
// المرحلة 1: إضافة النظام الجديد
const { executeWithErrorHandling } = useEnhancedErrorHandling();

// المرحلة 2: استبدال معالجة الأخطاء القديمة
await executeWithErrorHandling(operation, 'category', 'severity');

// المرحلة 3: إزالة النظام القديم
```

## استكشاف الأخطاء

### 1. فحص حالة الخطأ

```typescript
const { hasError, error, isRetrying, canRetry } = useEnhancedErrorHandling();

if (hasError) {
  console.log('Error:', error?.code);
  console.log('Retryable:', error?.isRetryable);
  console.log('Fallback available:', error?.fallbackAvailable);
}
```

### 2. فحص إحصائيات الأخطاء

```typescript
const stats = monitoringService.getDetailedStats();
console.log('Total errors:', stats.metrics.totalErrors);
console.log('Top errors:', stats.topErrors);
console.log('Error distribution:', stats.errorDistribution);
```

### 3. فحص التنبيهات

```typescript
const alerts = monitoringService.getAlerts();
const activeAlerts = alerts.filter(alert => alert.isActive);
console.log('Active alerts:', activeAlerts);
```

## الخلاصة

نظام معالجة الأخطاء المحسن يوفر:

1. **تجربة مستخدم ممتازة** مع رسائل واضحة وإرشادات مفيدة
2. **آليات تعافي ذكية** مع إعادة محاولة تلقائية وحلول احتياطية
3. **مراقبة شاملة** مع إحصائيات مفصلة وتنبيهات
4. **سهولة الاستخدام** مع hooks ومكونات جاهزة
5. **مرونة كاملة** مع إمكانية التخصيص والتوسع

استخدم هذا النظام لتحسين تجربة المستخدم وتقليل الإحباط عند حدوث الأخطاء.
