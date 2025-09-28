# دليل استخدام API الجديد

## 🚀 **البدء السريع**

### **1. للاستخدام الفوري (بدون تغيير)**
```typescript
// استخدم النظام القديم كما هو
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
```

### **2. للهجرة التدريجية**
```typescript
// استخدم النظام الجديد مع التوافق
import {
  withAuthLegacy,
  handleApiErrorLegacy,
  createApiResponseLegacy
} from '@/lib/core/api';
```

### **3. للنظام الجديد المحسن**
```typescript
// استخدم النظام الجديد مع الميزات المحسنة
import {
  withEnhancedAuth,
  handleApiErrorEnhanced,
  createApiResponseEnhanced
} from '@/lib/core/api';
```

## 📋 **قائمة الوظائف المتاحة**

### **Legacy Functions (للتوافق)**
- `withAuthLegacy` - مصادقة أساسية
- `handleApiErrorLegacy` - معالجة أخطاء أساسية
- `createApiResponseLegacy` - استجابة أساسية

### **Enhanced Functions (الجديدة)**
- `withEnhancedAuth` - مصادقة محسنة مع مراقبة الأداء
- `handleApiErrorEnhanced` - معالجة أخطاء متقدمة
- `createApiResponseEnhanced` - استجابة محسنة

## 🔧 **أمثلة الاستخدام**

### **مثال 1: Route بسيط**
```typescript
import { withAuthLegacy, handleApiErrorLegacy, createApiResponseLegacy } from '@/lib/core/api';

export const GET = withAuthLegacy(async ({ user, params }) => {
  try {
    // منطق Route
    const data = await fetchData(params.id);
    return createApiResponseLegacy(data, 200);
  } catch (error) {
    return handleApiErrorLegacy(error);
  }
});
```

### **مثال 2: Route محسن**
```typescript
import { withEnhancedAuth, handleApiErrorEnhanced, createApiResponseEnhanced } from '@/lib/core/api';

export const POST = withEnhancedAuth(async ({ request, user, params, startTime }) => {
  try {
    const body = await request.json();

    // منطق Route
    const result = await processData(body);

    return createApiResponseEnhanced(result, 200, {
      processingTime: performance.now() - startTime,
      userId: user.id
    });
  } catch (error) {
    return handleApiErrorEnhanced(error, 'post_handler');
  }
}, {
  performanceTracking: true,
  analytics: true,
  rateLimit: { maxRequests: 100, windowMs: 60000 }
});
```

### **مثال 3: Route بدون مصادقة**
```typescript
import { withEnhancedAuth, handleApiErrorEnhanced, createApiResponseEnhanced } from '@/lib/core/api';

export const GET = withEnhancedAuth(async ({ request, startTime }) => {
  try {
    // منطق Route
    const data = await fetchPublicData();

    return createApiResponseEnhanced(data, 200, {
      processingTime: performance.now() - startTime
    });
  } catch (error) {
    return handleApiErrorEnhanced(error, 'public_handler');
  }
}, {
  requireAuth: false,
  performanceTracking: true,
  analytics: true
});
```

## ⚙️ **خيارات withEnhancedAuth**

```typescript
interface EnhancedApiHandlerOptions {
  requireAdmin?: boolean;        // يتطلب صلاحيات admin
  requireAuth?: boolean;        // يتطلب مصادقة (افتراضي: true)
  rateLimit?: {                 // تحديد معدل الطلبات
    maxRequests: number;
    windowMs: number;
  };
  performanceTracking?: boolean; // تتبع الأداء (افتراضي: true)
  analytics?: boolean;          // تحليلات (افتراضي: true)
}
```

## 📊 **مراقبة الأداء**

### **تتبع تلقائي**
```typescript
// يتم تتبع الأداء تلقائياً
export const POST = withEnhancedAuth(async ({ startTime }) => {
  // منطق Route
}, {
  performanceTracking: true // افتراضي
});
```

### **تتبع مخصص**
```typescript
import { PerformanceMonitor } from '@/lib/core/performance';

export const POST = withEnhancedAuth(async ({ startTime }) => {
  // تتبع مخصص
  PerformanceMonitor.recordEvent({
    type: 'api_call',
    name: 'custom_metric',
    value: 100,
    unit: 'ms'
  });

  // منطق Route
});
```

## 📈 **Analytics**

### **تتبع تلقائي**
```typescript
// يتم تتبع Analytics تلقائياً
export const POST = withEnhancedAuth(async () => {
  // منطق Route
}, {
  analytics: true // افتراضي
});
```

### **تتبع مخصص**
```typescript
import { Analytics } from '@/lib/core/performance';

export const POST = withEnhancedAuth(async () => {
  // تتبع مخصص
  Analytics.trackCustom('custom_event', {
    action: 'data_processed',
    userId: user.id
  });

  // منطق Route
});
```

## 🛡️ **معالجة الأخطاء**

### **أخطاء أساسية**
```typescript
try {
  // منطق Route
} catch (error) {
  return handleApiErrorLegacy(error);
}
```

### **أخطاء محسنة**
```typescript
try {
  // منطق Route
} catch (error) {
  return handleApiErrorEnhanced(error, 'context_name', {
    userId: user.id,
    additionalData: 'value'
  });
}
```

## 🔄 **الهجرة التدريجية**

### **الخطوة 1: استبدال الاستيراد**
```typescript
// من
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

// إلى
import { withAuthLegacy, handleApiErrorLegacy, createApiResponseLegacy } from '@/lib/core/api';
```

### **الخطوة 2: تحديث الوظائف**
```typescript
// من
export const POST = withAuth(async ({ request, user, params }) => {
  // منطق Route
});

// إلى
export const POST = withEnhancedAuth(async ({ request, user, params, startTime }) => {
  // منطق Route
}, {
  performanceTracking: true,
  analytics: true
});
```

### **الخطوة 3: إضافة الميزات الجديدة**
```typescript
export const POST = withEnhancedAuth(async ({ request, user, params, startTime }) => {
  try {
    const body = await request.json();

    // منطق Route
    const result = await processData(body);

    return createApiResponseEnhanced(result, 200, {
      processingTime: performance.now() - startTime,
      userId: user.id
    });
  } catch (error) {
    return handleApiErrorEnhanced(error, 'post_handler');
  }
}, {
  performanceTracking: true,
  analytics: true,
  rateLimit: { maxRequests: 100, windowMs: 60000 }
});
```

## ⚠️ **ملاحظات مهمة**

1. **التوافق**: النظام الجديد متوافق مع النظام القديم
2. **الأداء**: النظام الجديد أسرع وأكثر كفاءة
3. **المراقبة**: يتم تتبع الأداء والتحليلات تلقائياً
4. **الأمان**: معالجة أخطاء محسنة وحماية أفضل

## 📞 **الدعم**

إذا واجهت مشاكل:
1. راجع هذا الدليل
2. تحقق من console للأخطاء
3. تأكد من الاستيراد الصحيح
4. اختبر الوظائف بشكل منفصل

---

**ملاحظة**: هذا الدليل يتم تحديثه مع إضافة ميزات جديدة.
