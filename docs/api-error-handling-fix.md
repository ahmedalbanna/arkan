# إصلاح معالجة الأخطاء في API المشاريع

## المشكلة الأصلية

كانت المشكلة في أن API endpoint `/api/projects/[id]` يرمي خطأ 500 (خطأ خادم) عندما لا يوجد المشروع، بدلاً من رمز 404 (غير موجود). هذا يسبب تجربة مستخدم سيئة ويجعل من الصعب فهم المشكلة.

## الحل المطبق

### 1. إصلاح معالجة الأخطاء

تم تحديث دالة `verifyProjectOwner` في `src/app/api/projects/[id]/route.ts` لإنشاء أخطاء مخصصة:

```typescript
// إنشاء خطأ مخصص للمشروع غير الموجود
const notFoundError = new Error('Project not found');
notFoundError.name = 'ProjectNotFoundError';
throw notFoundError;

// إنشاء خطأ مخصص للصلاحيات
const forbiddenError = new Error('Forbidden: You do not own this project');
forbiddenError.name = 'ProjectAccessDeniedError';
throw forbiddenError;
```

### 2. تحديث معالج الأخطاء

تم تحديث `handleApiErrorEnhanced` في `src/lib/core/api/enhanced-api-utils.ts` للتعامل مع الأخطاء المخصصة:

```typescript
// Handle custom project errors
if (error.name === 'ProjectNotFoundError') {
    const appError = createServerError({
        type: 'CLIENT_ERROR',
        code: 'API_ENDPOINT_NOT_FOUND',
        message: error.message,
        level: 'medium',
        source: 'api',
        // ...
    });
    return handleServerError(appError, 'API');
}
```

### 3. تحديث رموز حالة HTTP

تم تحديث `getStatusCode` في `src/lib/core/error-handling/server-errors.ts` لضمان أن أخطاء `CLIENT_ERROR` مع كود `API_ENDPOINT_NOT_FOUND` تُرجع رمز 404:

```typescript
case 'CLIENT_ERROR':
    // للمشاريع غير الموجودة، نُرجع 404
    if (error.code === 'API_ENDPOINT_NOT_FOUND') {
        return 404;
    }
    return 400;
```

### 4. إدارة المشاريع المؤقتة

تم إنشاء خدمة جديدة `TempProjectManager` في `src/lib/services/temp-project-manager.ts` لإدارة المشاريع المؤقتة:

- **إنشاء مشاريع مؤقتة**: مع انتهاء صلاحية تلقائي
- **تحويل إلى دائم**: تحويل المشاريع المؤقتة إلى دائمة
- **تنظيف تلقائي**: حذف المشاريع المنتهية الصلاحية
- **حدود المستخدم**: تحديد عدد المشاريع المؤقتة لكل مستخدم

### 5. API Endpoints جديدة

تم إنشاء endpoints جديدة لإدارة المشاريع المؤقتة:

- `POST /api/projects/temp` - إنشاء مشروع مؤقت
- `GET /api/projects/temp` - الحصول على إحصائيات المشاريع المؤقتة
- `DELETE /api/projects/temp` - تنظيف المشاريع المنتهية الصلاحية
- `POST /api/projects/temp/[id]/convert` - تحويل مشروع مؤقت إلى دائم

## النتائج

### قبل الإصلاح
```json
{
  "success": false,
  "error": {
    "type": "SERVER_ERROR",
    "code": "API_ENDPOINT_NOT_FOUND",
    "message": "Project not found",
    "level": "high"
  }
}
```
**رمز الحالة: 500**

### بعد الإصلاح
```json
{
  "success": false,
  "error": {
    "type": "CLIENT_ERROR",
    "code": "API_ENDPOINT_NOT_FOUND",
    "message": "Project not found",
    "level": "medium"
  }
}
```
**رمز الحالة: 404**

## الاختبارات

تم إنشاء اختبارات شاملة في `src/__tests__/api/error-handling-logic.test.ts` للتأكد من:

- إنشاء الأخطاء المخصصة بشكل صحيح
- رموز حالة HTTP الصحيحة
- التعرف على معرفات المشاريع المؤقتة
- رسائل الخطأ المناسبة

## الفوائد

1. **تجربة مستخدم أفضل**: رموز خطأ واضحة ومفهومة
2. **معالجة صحيحة للمشاريع المؤقتة**: التحقق من انتهاء الصلاحية
3. **تنظيف تلقائي**: منع تراكم المشاريع المؤقتة
4. **أمان محسن**: التحقق من ملكية المشاريع
5. **قابلية الصيانة**: كود منظم وموثق جيداً

## الاستخدام

### إنشاء مشروع مؤقت
```typescript
const response = await fetch('/api/projects/temp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Temporary Project',
    description: 'A temporary project for testing'
  })
});
```

### تحويل مشروع مؤقت إلى دائم
```typescript
const response = await fetch('/api/projects/temp/temp-1234567890/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    permanentProjectId: 'my-permanent-project' // اختياري
  })
});
```

### الحصول على إحصائيات المشاريع المؤقتة
```typescript
const response = await fetch('/api/projects/temp');
const stats = await response.json();
// { totalTempProjects: 10, expiredTempProjects: 2, activeTempProjects: 8 }
```
