# دليل الهجرة التدريجية لـ API Routes

## 🎯 **الهدف**
هجرة جميع API routes من النظام القديم إلى النظام الجديد مع الحفاظ على التوافق.

## 📋 **خطة الهجرة**

### **المرحلة 1: إعداد النظام الجديد** ✅
- [x] إنشاء `legacy-api-utils.ts` للتوافق مع النظام القديم
- [x] إنشاء `enhanced-api-utils.ts` للنظام الجديد
- [x] تحديث `api/index.ts` لتصدير الوظائف الجديدة

### **المرحلة 2: هجرة Auth Routes** 🔄
- [ ] `auth/session/route.ts`
- [ ] `auth/logout/route.ts`
- [ ] `auth/signup/route.ts`

### **المرحلة 3: هجرة User Routes** ⏳
- [ ] `users/[id]/route.ts`
- [ ] `users/[id]/reset-password/route.ts`
- [ ] `users/[id]/upload-profile-picture/route.ts`

### **المرحلة 4: هجرة Writing Tools Routes** ⏳
- [ ] `writing-tools/[tool]/route.ts`

### **المرحلة 5: هجرة Admin Routes** ⏳
- [ ] `admin/*/route.ts`

### **المرحلة 6: هجرة باقي Routes** ⏳
- [ ] `projects/*/route.ts`
- [ ] `teams/*/route.ts`
- [ ] `notifications/*/route.ts`
- [ ] `transactions/*/route.ts`
- [ ] `analytics/*/route.ts`
- [ ] `generate/*/route.ts`
- [ ] `templates/*/route.ts`
- [ ] `translate/*/route.ts`
- [ ] `document-processing/*/route.ts`
- [ ] `support-chat/*/route.ts`
- [ ] `webhooks/*/route.ts`

## 🔧 **كيفية الهجرة**

### **1. للاستخدام الفوري (بدون تغيير)**
```typescript
// استخدم النظام القديم كما هو
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';
```

### **2. للهجرة التدريجية**
```typescript
// استخدم النظام الجديد مع التوافق
import { withAuth, handleApiError, createApiResponse } from '@/core/api';
```

### **3. للنظام الجديد المحسن**
```typescript
// استخدم النظام الجديد مع الميزات المحسنة
import {
  withEnhancedAuth,
  handleApiErrorEnhanced,
  createApiResponseEnhanced
} from '@/core/api';
```

## 📝 **مثال على الهجرة**

### **قبل الهجرة:**
```typescript
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

export const POST = withAuth(async ({ request, user, params }) => {
  try {
    const body = await request.json();
    // ... logic
    return createApiResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
});
```

### **بعد الهجرة:**
```typescript
import { withEnhancedAuth, handleApiErrorEnhanced, createApiResponseEnhanced } from '@/core/api';

export const POST = withEnhancedAuth(async ({ request, user, params, startTime }) => {
  try {
    const body = await request.json();
    // ... logic
    return createApiResponseEnhanced(result, 200, {
      processingTime: performance.now() - startTime
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

## 🚀 **الميزات الجديدة**

### **1. مراقبة الأداء**
- تتبع وقت الاستجابة
- مراقبة استخدام الذاكرة
- تحليل الأداء

### **2. Analytics**
- تتبع استخدام API
- إحصائيات مفصلة
- تقارير الأداء

### **3. معالجة أخطاء محسنة**
- تصنيف الأخطاء
- تسجيل مفصل
- استجابة موحدة

### **4. Rate Limiting**
- حماية من التحميل الزائد
- إدارة الطلبات
- تحسين الأداء

## ⚠️ **ملاحظات مهمة**

1. **التوافق**: النظام الجديد متوافق مع النظام القديم
2. **التدريجية**: يمكن الهجرة تدريجياً
3. **الاختبار**: اختبر كل route بعد الهجرة
4. **الأداء**: النظام الجديد أسرع وأكثر كفاءة

## 🔍 **التحقق من الهجرة**

### **1. تحقق من الاستيراد**
```typescript
// تأكد من استخدام المسار الصحيح
import { ... } from '@/core/api';
```

### **2. تحقق من الوظائف**
```typescript
// تأكد من وجود الوظائف المطلوبة
console.log(typeof withAuth); // should be 'function'
console.log(typeof handleApiError); // should be 'function'
```

### **3. تحقق من الأداء**
```typescript
// راقب الأداء في console
// يجب أن ترى logs للأداء والتحليلات
```

## 📞 **الدعم**

إذا واجهت مشاكل:
1. راجع هذا الدليل
2. تحقق من console للأخطاء
3. تأكد من الاستيراد الصحيح
4. اختبر الوظائف بشكل منفصل

---

**ملاحظة**: هذا الدليل يتم تحديثه مع تقدم الهجرة.
