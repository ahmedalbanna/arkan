# النظام الموحد لـ API والخدمات

## نظرة عامة

هذا المجلد يحتوي على النظام الموحد الجديد لتنظيم وإدارة API routes والخدمات في مشروع Arkan. تم تصميم هذا النظام لتحسين جودة الكود وسهولة الصيانة والتطوير.

## المكونات الرئيسية

### 1. مجلد `shared/`
يحتوي على المكونات المشتركة المستخدمة في جميع أنحاء النظام:

- **Types**: أنواع البيانات الموحدة
- **Handlers**: المعالجات الأساسية لـ API
- **Middleware**: نظام middleware قابل للتخصيص
- **Utils**: أدوات مساعدة ومعالجة الأخطاء
- **Validators**: schemas التحقق من صحة البيانات

### 2. مجلدات الخدمات المنظمة
الخدمات منظمة حسب الوظيفة:

- **auth/**: خدمات المصادقة والتسجيل
- **users/**: خدمات إدارة المستخدمين
- **projects/**: خدمات إدارة المشاريع
- **teams/**: خدمات إدارة الفرق

## المزايا

### ✅ بنية موحدة
- جميع API endpoints تتبع نفس النمط
- معالجة موحدة للطلبات والاستجابات
- نظام middleware قابل للتخصيص

### ✅ معالجة موحدة للأخطاء
- تصنيف واضح للأخطاء
- رسائل خطأ مفهومة
- تسجيل شامل للأخطاء

### ✅ تحقق موحد من صحة البيانات
- استخدام Zod schemas
- التحقق من جميع المدخلات
- رسائل خطأ واضحة

### ✅ خدمات منظمة
- خدمات منظمة حسب الوظيفة
- إعادة استخدام المكونات
- سهولة الصيانة والتطوير

## كيفية الاستخدام

### إنشاء API Route جديد

```typescript
import { ComplexApiHandler } from '@/app/api/shared/handlers/base-handler';
import { withApiMiddleware } from '@/app/api/shared/middleware/api-middleware';

class MyHandler extends ComplexApiHandler<InputData, OutputData> {
  protected inputSchema = MyInputSchema;

  protected async processRequest(data: InputData, context: ApiHandlerContext) {
    // منطق المعالجة
    return result;
  }
}

export const POST = withApiMiddleware(
  new MyHandler().handle.bind(new MyHandler()),
  { logging: true }
);
```

### إنشاء خدمة جديدة

```typescript
import { ComplexService } from '../shared/base-service';

export class MyService extends ComplexService<InputData, OutputData> {
  protected endpoint = '/api/my-endpoint';
  protected method = 'POST';
  protected inputSchema = MyInputSchema;
  protected requiresAuth = true;
}

export const myService = new MyService();
```

## الأمثلة التطبيقية

تم إنشاء أمثلة تطبيقية في:

- `src/app/api/users-v2/route.ts` - مثال لـ API المستخدمين
- `src/app/api/projects-v2/route.ts` - مثال لـ API المشاريع
- `src/app/api/teams-v2/route.ts` - مثال لـ API الفرق

## التوثيق

للحصول على دليل شامل، راجع:
- [دليل النظام الموحد](docs/api-unified-system-guide.md)

## الهجرة من النظام القديم

### 1. تحويل API Route
- استبدال `withEnhancedAuth` بـ `withApiMiddleware`
- استخدام `BaseApiHandler` بدلاً من المعالجات المباشرة
- تطبيق schemas التحقق من صحة البيانات

### 2. تحويل الخدمات
- استخدام `BaseService` كأساس للخدمات
- تنظيم الخدمات حسب الوظيفة
- استخدام `apiClient` الموحد

## المساهمة

عند إضافة ميزات جديدة:

1. اتبع البنية الموحدة
2. استخدم الأنواع المحددة
3. أضف التحقق من صحة البيانات
4. اكتب التوثيق المناسب
5. أضف الاختبارات

## الدعم

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- راجع التوثيق الشامل
- تحقق من الأمثلة التطبيقية
- استخدم نظام معالجة الأخطاء الموحد
