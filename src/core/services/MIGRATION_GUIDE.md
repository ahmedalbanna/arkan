# دليل الهجرة التدريجية للنظام الجديد

## 📋 نظرة عامة

هذا الدليل يوضح كيفية الانتقال التدريجي من النظام القديم للخدمات إلى النظام الجديد المبسط، مع الحفاظ على عمل التطبيق خلال فترة الانتقال.

## 🎯 أهداف الهجرة

1. **التبسيط**: تقليل التعقيد في الكود
2. **التوحيد**: استخدام نظام موحد لجميع الخدمات
3. **تحسين الأداء**: تقليل التكرار وتحسين الأداء
4. **سهولة الصيانة**: كود أكثر قابلية للقراءة والصيانة
5. **المرونة**: إمكانية التوسع والتطوير المستقبلي

## 🚀 خطة الهجرة

### المرحلة 1: إعداد طبقة التوافق ✅

تم إنشاء طبقة التوافق في `src/core/services/compatibility-layer.ts` التي تسمح بالاستخدام التدريجي للنظام الجديد.

### المرحلة 2: هجرة hooks الأساسية

#### 2.1 هجرة hooks المصادقة

**النظام القديم:**
```typescript
import { loginWithEmail, serviceSignupUser } from '@/services';

const loginMutation = useMutation({
  mutationFn: async (credentials) => {
    return loginWithEmail(credentials);
  }
});
```

**النظام الجديد:**
```typescript
import { authService } from '@/core/services';

const loginMutation = useMutation({
  mutationFn: async (credentials) => {
const result = await authService.login(credentials);
    if (result.success) return result.data;
    throw new Error(result.error);
  }
});
```

**طبقة التوافق (للانتقال التدريجي):**
```typescript
import { legacyServices } from '@/core/services';

const loginMutation = useMutation({
  mutationFn: async (credentials) => {
    const result = await legacyServices.auth.loginWithEmail(credentials);
    if (result.success) return result.data;
    throw new Error(result.error);
  }
});
```

#### 2.2 هجرة hooks المستخدمين

**النظام القديم:**
```typescript
import { fetchUsersApi, fetchUserProfileApi } from '@/services';

const usersQuery = useQuery({
  queryFn: async () => {
    const token = await getAuthenticatedToken(firebaseUser);
    return fetchUsersApi(token);
  }
});
```

**النظام الجديد:**
```typescript
import { adminService } from '@/core/services';

const usersQuery = useQuery({
  queryFn: async () => {
    const token = await getAuthenticatedToken(firebaseUser);
    const result = await adminService.getUsers(token);
    if (result.success) return result.data;
    throw new Error(result.error);
  }
});
```

#### 2.3 هجرة hooks الذكاء الاصطناعي

**النظام القديم:**
```typescript
import { writingToolApi } from '@/services';

const improveMutation = useMutation({
  mutationFn: async (data) => {
    const token = await getAuthenticatedToken(firebaseUser);
    return writingToolApi('/api/writing-tools/improve', { data, token });
  }
});
```

**النظام الجديد:**
```typescript
import { aiService } from '@/core/services';

const improveMutation = useMutation({
  mutationFn: async (data) => {
    const token = await getAuthenticatedToken(firebaseUser);
    const result = await aiService.improveText(data, token);
    if (result.success) return result.data;
    throw new Error(result.error);
  }
});
```

### المرحلة 3: هجرة hooks المتقدمة

#### 3.1 هجرة hooks التحليلات
#### 3.2 هجرة hooks المدفوعات
#### 3.3 هجرة hooks الفرق
#### 3.4 هجرة hooks المشاريع
#### 3.5 هجرة hooks الدردشة

## 📝 خطوات الهجرة لكل hook

### الخطوة 1: تحديد الخدمة المطلوبة

```typescript
// تحديد الخدمة المناسبة من النظام الجديد
import {
  authService,      // للمصادقة
  adminService,    // لإدارة المستخدمين والأقسام
  aiService,       // للذكاء الاصطناعي
  analyticsService, // للتحليلات
  paymentService,  // للمدفوعات
  teamService,     // للفرق
  projectService,  // للمشاريع
  chatService      // للدردشة
} from '@/core/services';
```

### الخطوة 2: تحديث استدعاءات API

```typescript
// قبل الهجرة
const result = await oldServiceFunction(data, token);

// بعد الهجرة
const result = await newService.functionName(data, token);
if (result.success) {
  return result.data;
}
throw new Error(result.error);
```

### الخطوة 3: تحديث معالجة الأخطاء

```typescript
// النظام الجديد يوفر معالجة أخطاء موحدة
const result = await service.functionName(data, token);
if (result.success) {
  return result.data;
}
throw new Error(result.error);
```

### الخطوة 4: استخدام دوال المساعدة

```typescript
// استخدام دوال المساعدة مع معالجة الأخطاء المدمجة
import { adminUtils } from '@/core/services';

const result = await adminUtils.createUserWithErrorHandling(userData, token);
if (result.success) {
  return result.data;
}
throw new Error(result.error);
```

## 🔄 استراتيجية الانتقال التدريجي

### الطريقة 1: الاستبدال المباشر

```typescript
// استبدال النظام القديم بالنظام الجديد مباشرة
- import { oldService } from '@/services';
+ import { newService } from '@/core/services';
```

### الطريقة 2: استخدام طبقة التوافق

```typescript
// استخدام طبقة التوافق للانتقال التدريجي
import { legacyServices } from '@/core/services';

// هذا يستدعي النظام الجديد داخلياً
const result = await legacyServices.auth.loginWithEmail(credentials);
```

### الطريقة 3: الاستخدام المختلط

```typescript
// استخدام النظام الجديد والقديم معاً أثناء الانتقال
import { authService } from '@/core/services';        // جديد
import { legacyServices } from '@/core/services';    // توافق
```

## 🧪 اختبار الهجرة

### اختبار الوحدة

```typescript
// اختبار hook جديد
describe('useUsersNew', () => {
  it('should fetch users successfully', async () => {
    const { result } = renderHook(() => useUsersNew());
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### اختبار التكامل

```typescript
// اختبار التكامل مع النظام الجديد
describe('New System Integration', () => {
  it('should work with new services', async () => {
    const result = await adminService.getUsers(token);
    expect(result.success).toBe(true);
  });
});
```

## 📊 مراقبة التقدم

### مؤشرات النجاح

1. **تقليل الأخطاء**: انخفاض في أخطاء API
2. **تحسين الأداء**: انخفاض في وقت الاستجابة
3. **سهولة الصيانة**: تقليل في تعقيد الكود
4. **رضا المطورين**: تحسن في تجربة التطوير

### أدوات المراقبة

```typescript
// إضافة تتبع للأداء
const startTime = Date.now();
const result = await service.functionName(data, token);
const endTime = Date.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

## 🚨 نصائح مهمة

### 1. اختبار شامل

```typescript
// اختبار جميع الحالات
- الحالة العادية
- حالة الخطأ
- حالة الشبكة البطيئة
- حالة انقطاع الشبكة
```

### 2. النسخ الاحتياطي

```typescript
// الاحتفاظ بنسخة من النظام القديم
// حتى اكتمال الهجرة بالكامل
```

### 3. التوثيق

```typescript
// توثيق جميع التغييرات
// لتسهيل المراجعة والصيانة
```

## 📅 الجدول الزمني المقترح

### الأسبوع 1-2: إعداد طبقة التوافق ✅
- إنشاء طبقة التوافق
- اختبار التوافق مع النظام القديم

### الأسبوع 3-4: هجرة hooks الأساسية
- هجرة hooks المصادقة
- هجرة hooks المستخدمين

### الأسبوع 5-6: هجرة hooks المتقدمة
- هجرة hooks الذكاء الاصطناعي
- هجرة hooks التحليلات

### الأسبوع 7-8: هجرة hooks المتبقية
- هجرة hooks المدفوعات
- هجرة hooks الفرق والمشاريع

### الأسبوع 9-10: الاختبار والتحسين
- اختبار شامل للنظام الجديد
- إزالة النظام القديم

## 🎉 النتائج المتوقعة

بعد اكتمال الهجرة:

1. **كود أكثر نظافة**: تقليل التعقيد وزيادة الوضوح
2. **أداء محسن**: استجابة أسرع وأخطاء أقل
3. **صيانة أسهل**: كود أكثر قابلية للقراءة والتطوير
4. **مرونة أكبر**: إمكانية التوسع والتطوير المستقبلي
5. **تجربة مطور أفضل**: أدوات تطوير محسنة

## 📞 الدعم والمساعدة

في حالة مواجهة مشاكل أثناء الهجرة:

1. **مراجعة الأمثلة**: في `src/hooks/examples/new-system-usage.ts`
2. **استخدام طبقة التوافق**: للانتقال التدريجي
3. **الاختبار المتدرج**: اختبار كل hook على حدة
4. **الرجوع للنظام القديم**: في حالة المشاكل الحرجة

---

**ملاحظة**: هذا الدليل قابل للتحديث حسب تطور النظام والمتطلبات الجديدة.
