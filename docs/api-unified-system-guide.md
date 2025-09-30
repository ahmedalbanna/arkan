# دليل النظام الموحد لـ API والخدمات

## نظرة عامة

تم إنشاء نظام موحد جديد لتنظيم وإدارة API routes والخدمات في مشروع Arkan. هذا النظام يوفر:

- **بنية موحدة**: جميع API endpoints تتبع نفس النمط
- **معالجة موحدة للأخطاء**: نظام شامل لمعالجة الأخطاء
- **تحقق موحد من صحة البيانات**: استخدام Zod schemas
- **Middleware موحد**: نظام middleware قابل للتخصيص
- **خدمات منظمة**: خدمات منظمة حسب الوظيفة

## هيكل النظام الجديد

### 1. مجلد API الموحد (`src/app/api/shared/`)

```
src/app/api/shared/
├── types/
│   └── api-types.ts          # أنواع البيانات الموحدة
├── handlers/
│   └── base-handler.ts      # المعالجات الأساسية
├── middleware/
│   └── api-middleware.ts    # Middleware الموحد
├── utils/
│   └── error-handler.ts     # معالجة الأخطاء
├── validators/
│   └── api-validators.ts    # Schemas التحقق
└── index.ts                 # الصادرات الرئيسية
```

### 2. مجلد الخدمات المنظمة (`src/services/`)

```
src/services/
├── shared/
│   ├── base-service.ts      # الخدمات الأساسية
│   ├── api-client.ts       # عميل API موحد
│   └── index.ts
├── auth/
│   ├── auth-service.ts      # خدمات المصادقة
│   └── index.ts
├── users/
│   ├── user-service.ts      # خدمات المستخدمين
│   └── index.ts
├── projects/
│   ├── project-service.ts   # خدمات المشاريع
│   └── index.ts
├── teams/
│   ├── team-service.ts      # خدمات الفرق
│   └── index.ts
└── index.ts                 # الصادرات الرئيسية
```

## المكونات الرئيسية

### 1. Base API Handler

يوفر بنية موحدة لجميع API endpoints:

```typescript
export abstract class BaseApiHandler<TInput = any, TOutput = any> {
  protected abstract inputSchema: z.ZodSchema<TInput>;
  protected abstract processRequest(
    data: TInput,
    context: ApiHandlerContext
  ): Promise<TOutput>;

  async handle(context: ApiHandlerContext): Promise<Response> {
    // منطق موحد لمعالجة الطلبات
  }
}
```

**الأنواع المتاحة:**
- `SimpleApiHandler`: للعمليات البسيطة (GET)
- `ComplexApiHandler`: للعمليات المعقدة (POST/PUT/DELETE)
- `CreditBasedApiHandler`: للعمليات التي تتطلب ائتمانات

### 2. Middleware الموحد

يوفر middleware قابل للتخصيص:

```typescript
export const withApiMiddleware = (
  handler: ApiHandler,
  options: ApiMiddlewareOptions = {}
) => {
  // منطق middleware موحد
};
```

**الخيارات المتاحة:**
- `requireAuth`: يتطلب مصادقة
- `requireAdmin`: يتطلب صلاحيات إدارية
- `rateLimit`: تحديد حد الطلبات
- `creditCost`: تكلفة الائتمانات
- `logging`: تسجيل العمليات

### 3. معالجة الأخطاء الموحدة

نظام شامل لمعالجة الأخطاء:

```typescript
export class ApiErrorHandler {
  static handle(error: unknown, context: string): ApiError {
    // تصنيف ومعالجة الأخطاء
  }
}
```

**أنواع الأخطاء:**
- `ValidationError`: أخطاء التحقق من صحة البيانات
- `AuthError`: أخطاء المصادقة
- `BusinessError`: أخطاء الأعمال

### 4. التحقق من صحة البيانات

استخدام Zod schemas للتحقق من صحة البيانات:

```typescript
export const AuthSchemas = {
  login: z.object({
    email: BaseSchemas.email,
    password: BaseSchemas.password,
  }),
  // ... باقي schemas
};
```

## أمثلة التطبيق

### 1. إنشاء API Route جديد

```typescript
// src/app/api/users-v2/route.ts
import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';
import { UserSchemas } from '@/app/api/shared/validators/api-validators';

class CreateUserHandler extends ComplexApiHandler<CreateUserData, UserProfile> {
  protected inputSchema = UserSchemas.createUser;
  protected requiresAdmin = true;

  protected async processRequest(data: any, context: any) {
    // منطق إنشاء المستخدم
    return newUser;
  }
}

const createUserHandler = new CreateUserHandler();

export const POST = withApiMiddleware(
  createUserHandler.handle.bind(createUserHandler),
  { requireAdmin: true, logging: true }
);
```

### 2. إنشاء خدمة جديدة

```typescript
// src/services/users/user-service.ts
import { ComplexService } from '../shared/base-service';
import { apiClient } from '../shared/api-client';

export class CreateUserService extends ComplexService<CreateUserData, UserProfile> {
  protected endpoint = '/api/admin/users';
  protected method = 'POST';
  protected inputSchema = UserSchemas.createUser;
  protected requiresAuth = true;
}

export const userService = {
  create: new CreateUserService(),
};

export async function createUserApi(data: CreateUserData, token: string): Promise<UserProfile> {
  return userService.create.call(data, token);
}
```

## المزايا

### 1. سهولة الصيانة
- كود منظم وموحد
- إعادة استخدام المكونات
- فصل الاهتمامات

### 2. قابلية التطوير
- إضافة ميزات جديدة بسهولة
- نظام قابل للتوسع
- مرونة في التخصيص

### 3. جودة الكود
- معايير موحدة
- اختبارات شاملة
- توثيق شامل

### 4. الأداء
- تحسين الأداء
- إدارة الذاكرة
- تحسين الشبكة

## دليل الهجرة

### 1. تحويل API Route موجود

**قبل:**
```typescript
export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    // منطق المعالجة
    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
```

**بعد:**
```typescript
class CreateHandler extends ComplexApiHandler<InputData, OutputData> {
  protected inputSchema = InputSchema;

  protected async processRequest(data: InputData, context: ApiHandlerContext) {
    // منطق المعالجة
    return result;
  }
}

export const POST = withApiMiddleware(
  new CreateHandler().handle.bind(new CreateHandler()),
  { logging: true }
);
```

### 2. تحويل خدمة موجودة

**قبل:**
```typescript
export async function fetchData(token: string): Promise<Data> {
  const response = await fetch('/api/data', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

**بعد:**
```typescript
class FetchDataService extends SimpleService<Data> {
  protected endpoint = '/api/data';
  protected requiresAuth = true;
}

export const fetchData = (token: string) =>
  new FetchDataService().call(token);
```

## أفضل الممارسات

### 1. تسمية الملفات
- استخدام أسماء وصفية
- تجميع الملفات حسب الوظيفة
- استخدام index.ts للصادرات

### 2. تنظيم الكود
- فصل الاهتمامات
- استخدام الوراثة
- تجنب التكرار

### 3. معالجة الأخطاء
- استخدام أنواع الأخطاء المناسبة
- توفير رسائل خطأ واضحة
- تسجيل الأخطاء

### 4. التحقق من صحة البيانات
- استخدام Zod schemas
- التحقق من جميع المدخلات
- توفير رسائل خطأ واضحة

## الخلاصة

النظام الجديد الموحد يوفر:

1. **بنية موحدة** لجميع API endpoints والخدمات
2. **معالجة موحدة للأخطاء** مع تصنيف واضح
3. **تحقق موحد من صحة البيانات** باستخدام Zod
4. **Middleware قابل للتخصيص** لاحتياجات مختلفة
5. **خدمات منظمة** حسب الوظيفة
6. **توثيق شامل** وأمثلة تطبيقية

هذا النظام يجعل الكود أكثر قابلية للصيانة والتطوير، ويوفر تجربة تطوير أفضل للمطورين.
