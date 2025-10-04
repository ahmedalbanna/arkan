# دليل نظام معالجة الأخطاء المحسن

## نظرة عامة

نظام معالجة الأخطاء المحسن يوفر تجربة مستخدم ممتازة مع إدارة شاملة للأخطاء وإمكانيات التعافي المتقدمة.

## المكونات الرئيسية

### 1. مكونات العرض

#### ErrorToast
عرض الأخطاء كإشعارات منبثقة في أعلى يمين الشاشة.

```tsx
import { ErrorToast } from '@/components/ui/error-display';

<ErrorToast
  error={error}
  onRetry={() => handleRetry()}
  onDismiss={() => handleDismiss()}
  autoDismiss={true}
  autoDismissDelay={5000}
/>
```

#### ErrorBanner
عرض الأخطاء المهمة في أعلى الصفحة.

```tsx
import { ErrorBanner } from '@/components/ui/error-display';

<ErrorBanner
  error={error}
  onRetry={() => handleRetry()}
  onDismiss={() => handleDismiss()}
/>
```

#### ErrorModal
عرض الأخطاء في نافذة منبثقة مع تفاصيل شاملة.

```tsx
import { ErrorModal } from '@/components/ui/error-display';

<ErrorModal
  error={error}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onRetry={() => handleRetry()}
  showTechnicalDetails={true}
/>
```

### 2. Hooks

#### useErrorManagement
Hook محسن لإدارة الأخطاء مع إمكانيات التعافي المتقدمة.

```tsx
import { useErrorManagement } from '@/hooks/use-error-management';

const errorManagement = useErrorManagement({
  maxRetries: 3,
  retryDelay: 2,
  showToast: true,
  showModal: true,
  onError: (error) => console.log('Error:', error),
  onSuccess: () => console.log('Success'),
  onRetry: (attempt, maxAttempts) => console.log(`Retry ${attempt}/${maxAttempts}`)
});

// تنفيذ عملية مع معالجة الأخطاء
await errorManagement.executeWithErrorHandling(
  async () => {
    // العملية التي قد تفشل
    return await someOperation();
  },
  'network',
  'medium'
);
```

#### useSimpleErrorManagement
Hook مبسط للاستخدام السريع.

```tsx
import { useSimpleErrorManagement } from '@/hooks/use-error-management';

const simpleErrorManagement = useSimpleErrorManagement();

// معالجة خطأ مباشر
simpleErrorManagement.handleError(
  new Error('Something went wrong'),
  'system',
  'medium'
);
```

### 3. سياق الأخطاء

#### ErrorContext
سياق عام لإدارة الأخطاء في جميع أنحاء التطبيق.

```tsx
import { ErrorProvider } from '@/components/ui/error-display';

function App() {
  return (
    <ErrorProvider
      maxErrors={50}
      autoCleanup={true}
      showToast={true}
      showBanner={false}
      showModal={false}
    >
      <YourApp />
    </ErrorProvider>
  );
}
```

## أنواع الأخطاء

### فئات الأخطاء
- `network`: أخطاء الشبكة
- `authentication`: أخطاء المصادقة
- `validation`: أخطاء التحقق من صحة البيانات
- `ai_generation`: أخطاء توليد الذكاء الاصطناعي
- `file_upload`: أخطاء رفع الملفات
- `export`: أخطاء التصدير
- `database`: أخطاء قاعدة البيانات
- `permission`: أخطاء الصلاحيات
- `rate_limit`: أخطاء حد المعدل
- `system`: أخطاء النظام العامة
- `user_input`: أخطاء إدخال المستخدم
- `external_service`: أخطاء الخدمات الخارجية

### مستويات الشدة
- `low`: خطأ منخفض الشدة
- `medium`: خطأ متوسط الشدة
- `high`: خطأ عالي الشدة
- `critical`: خطأ حرج

## أمثلة الاستخدام

### 1. معالجة أخطاء الشبكة

```tsx
const handleNetworkOperation = async () => {
  await errorManagement.executeWithErrorHandling(
    async () => {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Network request failed');
      }
      return response.json();
    },
    'network',
    'medium'
  );
};
```

### 2. معالجة أخطاء الذكاء الاصطناعي

```tsx
const handleAIGeneration = async () => {
  await errorManagement.executeWithErrorHandling(
    async () => {
      const result = await generateContent(input);
      if (!result.success) {
        throw new Error('AI generation failed');
      }
      return result;
    },
    'ai_generation',
    'high'
  );
};
```

### 3. معالجة أخطاء رفع الملفات

```tsx
const handleFileUpload = async (file: File) => {
  await errorManagement.executeWithErrorHandling(
    async () => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      return response.json();
    },
    'file_upload',
    'medium'
  );
};
```

## التخصيص

### تخصيص الرسائل

```tsx
const customError = createEnhancedError(
  'CUSTOM_ERROR',
  'system',
  'medium',
  {
    userMessage: 'رسالة مخصصة للمستخدم',
    userGuidance: 'إرشادات مخصصة',
    suggestedActions: ['إجراء 1', 'إجراء 2']
  }
);
```

### تخصيص إعدادات إعادة المحاولة

```tsx
const errorManagement = useErrorManagement({
  maxRetries: 5,
  retryDelay: 3,
  backoffMultiplier: 2,
  showToast: true,
  showModal: false,
  showBanner: true
});
```

## أفضل الممارسات

### 1. استخدام الفئات المناسبة
- استخدم فئة الخطأ المناسبة لتوفير رسائل وإرشادات دقيقة
- اختر مستوى الشدة المناسب لطبيعة الخطأ

### 2. توفير إرشادات مفيدة
- اكتب رسائل واضحة ومفهومة للمستخدم
- قدم إجراءات مقترحة قابلة للتنفيذ

### 3. إدارة إعادة المحاولة
- استخدم إعادة المحاولة للأخطاء المؤقتة فقط
- تجنب إعادة المحاولة للأخطاء الدائمة مثل أخطاء التحقق

### 4. مراقبة الأخطاء
- استخدم نظام المراقبة لتتبع الأخطاء
- حلل أنماط الأخطاء لتحسين النظام

## استكشاف الأخطاء

### 1. فحص حالة الخطأ
```tsx
if (errorManagement.hasError) {
  console.log('Current error:', errorManagement.error);
  console.log('Can retry:', errorManagement.canRetry);
  console.log('Has fallback:', errorManagement.hasFallback);
}
```

### 2. الحصول على إحصائيات الأخطاء
```tsx
const stats = errorManagement.getErrorStats();
console.log('Total errors:', stats.totalErrors);
console.log('Errors by category:', stats.errorsByCategory);
```

### 3. مراجعة تاريخ الأخطاء
```tsx
const history = errorManagement.getErrorHistory('operation-id');
console.log('Error history:', history);
```

## التكامل مع الأنظمة الأخرى

### 1. تكامل مع Firebase
```tsx
// في حالة خطأ Firebase
const firebaseError = createEnhancedError(
  'FIREBASE_ERROR',
  'database',
  'high',
  { originalError: error }
);
```

### 2. تكامل مع خدمات المراقبة
```tsx
// إرسال الأخطاء إلى خدمة المراقبة
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'exception', {
    description: error.message,
    fatal: error.severity === 'critical'
  });
}
```

## الخلاصة

نظام معالجة الأخطاء المحسن يوفر:
- تجربة مستخدم ممتازة مع رسائل واضحة
- إمكانيات تعافي متقدمة مع إعادة المحاولة الذكية
- مراقبة شاملة للأخطاء وإحصائيات مفصلة
- مكونات UI مرنة وقابلة للتخصيص
- تكامل سهل مع الأنظمة الأخرى

استخدم هذا النظام لتحسين موثوقية التطبيق وتجربة المستخدم بشكل عام.
