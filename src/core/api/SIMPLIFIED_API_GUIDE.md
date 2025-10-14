# دليل النظام المبسط للـ API

## نظرة عامة

تم تبسيط نظام API بشكل كبير ليكون أسهل في الاستخدام والفهم. النظام الجديد يوفر:

- ✅ كود أقل بنسبة 70%
- ✅ سهولة في القراءة والفهم
- ✅ معالجة أخطاء تلقائية
- ✅ نظام استجابات موحد
- ✅ التحقق من البيانات المدمج

## المقارنة: قبل وبعد

### قبل التبسيط (النظام القديم)

```typescript
// ملف معقد مع classes و handlers متعددة
import { ComplexApiHandler } from '@/core/api/handlers/base-handler';
import { withApiMiddleware } from '@/core/api/middleware/api-middleware';

class LoginHandler extends ComplexApiHandler<{ email: string; password: string }, { user: any; token: string }> {
    protected inputSchema = AuthSchemas.login;
    protected requiresAuth = false;
    protected creditCost = 0;
    protected requiresAdmin = false;

    protected async processRequest(data: { email: string; password: string }, context: ApiHandlerContext) {
        // منطق معقد...
        return response;
    }
}

const loginHandler = new LoginHandler();
export const POST = withApiMiddleware(loginHandler, {
    requireAuth: false,
    logging: true
});
```

### بعد التبسيط (النظام الجديد)

```typescript
// ملف بسيط ومباشر
import { createApiHandler, ApiResponse } from '@/core/api';

export const POST = createApiHandler(async (context) => {
    const { request } = context;
    const { email, password } = await request.json();

    // منطق بسيط...
    return ApiResponse.success({ user, token });
}, { validateBody: AuthSchemas.login });
```

## الاستخدام السريع

### 1. API بسيط (GET)

```typescript
import { createApiHandler, ApiResponse } from '@/core/api';

export const GET = createApiHandler(async (context) => {
    const data = await fetchDataFromDatabase();
    return ApiResponse.success(data);
});
```

### 2. API مع التحقق من البيانات (POST)

```typescript
import { createApiHandler, ApiResponse } from '@/core/api';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(1),
    email: z.string().email()
});

export const POST = createApiHandler(async (context) => {
    const { request } = context;
    const { name, email } = await request.json();

    const result = await createUser({ name, email });
    return ApiResponse.created(result);
}, { validateBody: schema });
```

### 3. API مع المصادقة

```typescript
export const GET = createApiHandler(async (context) => {
    const { user } = context; // user متوفر تلقائياً

    return ApiResponse.success({
        message: `Hello ${user.email}`
    });
}, { requireAuth: true });
```

### 4. API إداري

```typescript
export const DELETE = createApiHandler(async (context) => {
    // فقط المديرين يمكنهم الوصول
    return ApiResponse.success({ message: 'Admin operation completed' });
}, { requireAdmin: true });
```

## نظام الاستجابات الموحد

```typescript
import { ApiResponse } from '@/core/api';

// نجاح
ApiResponse.success(data, status)     // 200
ApiResponse.created(data)            // 201

// أخطاء
ApiResponse.error(message, status)    // 500
ApiResponse.badRequest(message)       // 400
ApiResponse.unauthorized(message)     // 401
ApiResponse.forbidden(message)        // 403
ApiResponse.notFound(message)         // 404
```

## التحقق من البيانات

```typescript
import { validateBody, validateQuery, validateParams } from '@/core/api';

// في الـ handler
const data = await validateBody(request, schema);
const query = await validateQuery(request, schema);
const params = await validateParams(context.params, schema);
```

## الملفات المحدثة

تم تبسيط الملفات التالية:

- ✅ `src/app/api/auth/login/route.ts` - تسجيل الدخول
- ✅ `src/app/api/agents/route.ts` - قائمة الوكلاء
- ✅ `src/app/api/features/route.ts` - الميزات
- ✅ `src/app/api/settings/route.ts` - الإعدادات
- ✅ `src/app/api/summarize/route.ts` - التلخيص

## المزايا

### قبل التبسيط
- ❌ 50+ سطر لكل API
- ❌ Classes معقدة
- ❌ Middleware متعددة
- ❌ تكرار في الكود
- ❌ صعوبة في الصيانة

### بعد التبسيط
- ✅ 15-20 سطر لكل API
- ✅ دوال بسيطة
- ✅ نظام موحد
- ✅ كود نظيف
- ✅ سهولة في الصيانة

## الانتقال التدريجي

النظام الجديد متوافق مع النظام القديم:

1. **استخدم النظام الجديد** للـ APIs الجديدة
2. **احتفظ بالنظام القديم** للـ APIs الموجودة
3. **انتقل تدريجياً** حسب الحاجة

## مثال كامل

```typescript
/**
 * API Route للمستخدمين - النسخة المبسطة
 */

import { createApiHandler, ApiResponse } from '@/core/api';
import { adminDb } from '@/lib/firebase/server-init';
import { z } from 'zod';

const createUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['user', 'admin']).default('user')
});

// GET - جلب المستخدمين
export const GET = createApiHandler(async (context) => {
    const snapshot = await adminDb.collection('users').get();
    const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return ApiResponse.success(users);
}, { requireAuth: true });

// POST - إنشاء مستخدم جديد
export const POST = createApiHandler(async (context) => {
    const { request } = context;
    const { name, email, role } = await request.json();

    const userRef = await adminDb.collection('users').add({
        name,
        email,
        role,
        createdAt: new Date().toISOString()
    });

    return ApiResponse.created({
        id: userRef.id,
        name,
        email,
        role
    });
}, { validateBody: createUserSchema, requireAdmin: true });
```

## الخلاصة

النظام المبسط يوفر:
- **بساطة**: كود أقل وأوضح
- **سرعة**: تطوير أسرع
- **موثوقية**: معالجة أخطاء تلقائية
- **مرونة**: سهولة في التوسع
- **صيانة**: كود أسهل في الصيانة

ابدأ باستخدام النظام الجديد للـ APIs الجديدة وانتقل تدريجياً للـ APIs الموجودة!
