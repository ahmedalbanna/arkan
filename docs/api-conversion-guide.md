# دليل التحويل التدريجي لـ API Routes

## نظرة عامة

تم إنشاء نظام موحد جديد لـ API routes في مشروع Arkan. هذا الدليل يوضح كيفية تحويل API routes الموجودة إلى النظام الجديد الموحد.

## المبادئ الأساسية للتحويل

### 1. استخدام المعالجات الأساسية
- `SimpleApiHandler`: للعمليات البسيطة (GET)
- `ComplexApiHandler`: للعمليات المعقدة (POST/PUT/DELETE)
- `CreditBasedApiHandler`: للعمليات التي تتطلب ائتمانات

### 2. استخدام Middleware الموحد
- `withApiMiddleware`: middleware رئيسي مع خيارات قابلة للتخصيص
- `withAdminAccess`: للعمليات الإدارية
- `withCreditDeduction`: للعمليات التي تتطلب ائتمانات

### 3. استخدام Schemas التحقق
- استخدام Zod schemas للتحقق من صحة البيانات
- schemas موحدة في `src/app/api/shared/validators/api-validators.ts`

## أمثلة التحويل

### مثال 1: تحويل API Route بسيط (GET)

**قبل التحويل:**
```typescript
export const GET = withEnhancedAuth(async ({ request, user }) => {
  try {
    const data = await fetchData();
    return createApiResponseEnhanced(data, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
```

**بعد التحويل:**
```typescript
class MyHandler extends SimpleApiHandler<MyDataType> {
  protected async processRequest(context: any) {
    return await fetchData();
  }
}

export const GET = withApiMiddleware(
  new MyHandler().handle.bind(new MyHandler()),
  { logging: true }
);
```

### مثال 2: تحويل API Route معقد (POST)

**قبل التحويل:**
```typescript
export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = mySchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    const result = await processData(validation.data);
    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
```

**بعد التحويل:**
```typescript
class MyHandler extends ComplexApiHandler<InputType, OutputType> {
  protected inputSchema = mySchema;

  protected async processRequest(data: InputType, context: any) {
    return await processData(data);
  }
}

export const POST = withApiMiddleware(
  new MyHandler().handle.bind(new MyHandler()),
  { logging: true }
);
```

### مثال 3: تحويل API Route يتطلب ائتمانات

**قبل التحويل:**
```typescript
export const POST = withEnhancedAuth(async ({ request, user }) => {
  try {
    const body = await request.json();
    const validation = mySchema.safeParse(body);
    if (!validation.success) {
      return handleApiErrorEnhanced(validation.error);
    }

    await deductCredit(user.id, 1);
    const result = await processData(validation.data);

    await logGeneration({
      agentId: 'my-agent',
      userId: user.id,
      input: validation.data,
      output: result,
      creditCost: 1,
    });

    return createApiResponseEnhanced(result, 200);
  } catch (error) {
    return handleApiErrorEnhanced(error);
  }
});
```

**بعد التحويل:**
```typescript
class MyHandler extends CreditBasedApiHandler<InputType, OutputType> {
  protected inputSchema = mySchema;
  protected creditCost = 1;

  protected async processRequest(data: InputType, context: any) {
    const result = await processData(data);

    await logGeneration({
      agentId: 'my-agent',
      userId: context.user.id,
      input: data,
      output: result,
      creditCost: this.creditCost,
    });

    return result;
  }
}

export const POST = withApiMiddleware(
  new MyHandler().handle.bind(new MyHandler()),
  { logging: true }
);
```

## API Routes المحولة

### ✅ المصادقة (Auth)
- `src/app/api/auth/signup-v2/route.ts` - التسجيل
- `src/app/api/auth/logout-v2/route.ts` - تسجيل الخروج
- `src/app/api/auth/session-v2/route.ts` - إدارة الجلسات

### ✅ المستخدمين (Users)
- `src/app/api/users-v2/route.ts` - إدارة المستخدمين
- `src/app/api/projects-v2/route.ts` - إدارة المشاريع
- `src/app/api/teams-v2/route.ts` - إدارة الفرق

### ✅ الذكاء الاصطناعي (AI)
- `src/app/api/academic-solver/solve-v2/route.ts` - حل المشاكل الأكاديمية
- `src/app/api/academic-solver/analyze-v2/route.ts` - تحليل المشاكل الأكاديمية
- `src/app/api/generate/proposal-v2/route.ts` - توليد المقترحات
- `src/app/api/writing-tools-v2/[tool]/route.ts` - أدوات الكتابة

### ✅ الإدارة (Admin)
- `src/app/api/admin/dashboard-stats-v2/route.ts` - إحصائيات لوحة التحكم
- `src/app/api/admin/users-v2/route.ts` - إدارة المستخدمين

### ✅ المعاملات (Transactions)
- `src/app/api/transactions/report-v2/route.ts` - تقرير المعاملات

## خطوات التحويل

### 1. تحليل API Route الموجود
- تحديد نوع العملية (GET/POST/PUT/DELETE)
- تحديد متطلبات المصادقة
- تحديد متطلبات الائتمانات
- تحديد schemas التحقق

### 2. اختيار المعالج المناسب
- `SimpleApiHandler` للعمليات البسيطة
- `ComplexApiHandler` للعمليات المعقدة
- `CreditBasedApiHandler` للعمليات التي تتطلب ائتمانات

### 3. تطبيق التحقق من صحة البيانات
- استخدام schemas موجودة من `api-validators.ts`
- إنشاء schemas جديدة إذا لزم الأمر

### 4. تطبيق Middleware المناسب
- `withApiMiddleware` مع الخيارات المناسبة
- تحديد متطلبات المصادقة والإدارة
- تحديد تسجيل العمليات

### 5. اختبار التحويل
- اختبار الوظائف الأساسية
- اختبار معالجة الأخطاء
- اختبار التحقق من صحة البيانات

## أفضل الممارسات

### 1. تسمية الملفات
- استخدام `-v2` للإشارة إلى النسخة الجديدة
- الاحتفاظ بالملفات القديمة للمقارنة

### 2. تنظيم الكود
- فصل منطق المعالجة في methods منفصلة
- استخدام private methods للمساعدة
- تجنب التكرار في الكود

### 3. معالجة الأخطاء
- استخدام أنواع الأخطاء المناسبة
- توفير رسائل خطأ واضحة
- تسجيل الأخطاء بشكل مناسب

### 4. التحقق من صحة البيانات
- استخدام Zod schemas
- التحقق من جميع المدخلات
- توفير رسائل خطأ واضحة

## الفوائد من التحويل

### 1. تنظيم أفضل
- كود منظم وموحد
- فصل الاهتمامات
- إعادة استخدام المكونات

### 2. صيانة أسهل
- معالجة موحدة للأخطاء
- تحقق موحد من صحة البيانات
- نظام middleware قابل للتخصيص

### 3. تطوير أسرع
- إضافة ميزات جديدة بسهولة
- نظام قابل للتوسع
- مرونة في التخصيص

### 4. جودة أعلى
- معايير موحدة
- اختبارات شاملة
- توثيق شامل

## الخطوات التالية

### 1. التحويل التدريجي
- تحويل API routes الأساسية أولاً
- اختبار كل تحويل قبل الانتقال للتالي
- مراقبة الأداء والاستقرار

### 2. الاختبار الشامل
- اختبار جميع الوظائف المحولة
- اختبار معالجة الأخطاء
- اختبار الأداء

### 3. التوثيق
- تحديث التوثيق
- إنشاء أدلة للمطورين
- توثيق الأنماط الجديدة

### 4. التدريب
- تدريب الفريق على النظام الجديد
- مشاركة أفضل الممارسات
- إنشاء أمثلة تطبيقية

## الخلاصة

النظام الجديد الموحد يوفر:
- **بنية موحدة** لجميع API routes
- **معالجة موحدة للأخطاء** مع تصنيف واضح
- **تحقق موحد من صحة البيانات** باستخدام Zod
- **Middleware قابل للتخصيص** لاحتياجات مختلفة
- **سهولة الصيانة والتطوير**

هذا النظام يجعل الكود أكثر قابلية للصيانة والتطوير، ويوفر تجربة تطوير أفضل للمطورين.
