# نظام API المبسط

نظام API مبسط وموحد يحتوي على جميع الوظائف الأساسية المطلوبة بدون التعقيدات غير الضرورية.

## الميزات الرئيسية

- ✅ نظام مبسط وسهل الاستخدام
- ✅ التحقق من البيانات باستخدام Zod
- ✅ نظام المصادقة والصلاحيات
- ✅ نظام الاستجابات الموحد
- ✅ معالجة الأخطاء التلقائية
- ✅ دعم العميل الأساسي

## الاستخدام السريع

### 1. API بسيط

```typescript
import { createApiHandler, ApiResponse } from '@/core/api';

export const GET = createApiHandler(async (request, context) => {
    return ApiResponse.success({ message: 'Hello World' });
});
```

### 2. API مع التحقق من البيانات

```typescript
import { z } from 'zod';

const UserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email()
});

export const POST = createApiHandler(async (request, context, validatedData) => {
    // validatedData محقق بالفعل
    return ApiResponse.created(validatedData);
}, { validationSchema: UserSchema });
```

### 3. API مع المصادقة

```typescript
import { withAuth } from '@/core/api';

export const GET = withAuth(async (context) => {
    // context.user متوفر هنا
    return ApiResponse.success({ user: context.user });
});
```

### 4. API إداري

```typescript
import { withAdmin } from '@/core/api';

export const DELETE = withAdmin(async (context) => {
    // فقط المديرين يمكنهم الوصول
    return ApiResponse.success({ message: 'Admin operation' });
});
```

## نظام الاستجابات

```typescript
import { ApiResponse } from '@/core/api';

// نجاح
ApiResponse.success(data, status) // 200
ApiResponse.created(data)        // 201

// أخطاء
ApiResponse.error(message, status, code)
ApiResponse.badRequest(message)     // 400
ApiResponse.unauthorized(message)   // 401
ApiResponse.forbidden(message)      // 403
ApiResponse.notFound(message)       // 404
```

## التحقق من البيانات

```typescript
import { validateBody, validateQuery, validateParams } from '@/core/api';

// التحقق من body
const data = await validateBody(request, schema);

// التحقق من query parameters
const query = await validateQuery(request, schema);

// التحقق من route parameters
const params = await validateParams(context.params, schema);
```

## العميل الأساسي

```typescript
import { apiClient } from '@/core/api';

// استخدام العميل
const user = await apiClient.getUserProfile();
const projects = await apiClient.getProjects();
const agent = await apiClient.createAgent(data);

// استدعاء مخصص
const result = await apiClient.call('/api/custom', {
    method: 'POST',
    data: { key: 'value' }
});
```

## الهيكل المبسط

```
src/core/api/
├── simple-api.ts          # النظام المبسط الرئيسي
├── client/                # العميل الأساسي
│   ├── api-client.ts      # العميل المبسط
│   └── base-client.ts     # العميل الأساسي
├── middleware/            # Middleware المبسط
│   └── api-middleware.ts  # Middleware الرئيسي
├── handlers/              # Handlers المبسطة
│   └── base-handler.ts    # Handler الأساسي
├── enhanced-api-utils.ts   # النظام القديم (للتوافق)
└── index.ts              # التصدير الموحد
```

## الانتقال من النظام القديم

النظام الجديد متوافق مع النظام القديم، يمكنك الانتقال تدريجياً:

1. استخدم النظام الجديد للـ APIs الجديدة
2. احتفظ بالنظام القديم للـ APIs الموجودة
3. انتقل تدريجياً حسب الحاجة

## المزايا

- **بساطة**: كود أقل وتعقيد أقل
- **أداء**: تحميل أسرع وحجم أصغر
- **سهولة الصيانة**: هيكل واضح ومنظم
- **المرونة**: يمكن التوسع حسب الحاجة
- **التوافق**: يعمل مع النظام القديم
