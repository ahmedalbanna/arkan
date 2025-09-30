# النظام الأساسي الموحد

## نظرة عامة

النظام الأساسي الموحد هو نظام شامل ومتطور يوفر جميع المكونات الأساسية اللازمة لتطوير تطبيقات ويب حديثة وقابلة للصيانة. تم تصميمه ليكون مرناً وقابلاً للتوسع مع دعم كامل للغة العربية.

## الميزات الرئيسية

### 🔧 المكونات الأساسية
- **الثوابت**: قيم ثابتة موحدة لجميع أنحاء التطبيق
- **الأنواع**: تعريفات TypeScript شاملة ومفصلة
- **الأدوات**: وظائف مساعدة موحدة ومحسنة
- **معالجة الأخطاء**: نظام شامل لمعالجة الأخطاء

### 🌐 نظام API موحد
- **عميل API**: عميل HTTP موحد مع إعادة المحاولة ومعالجة الأخطاء
- **Middleware**: نظام middleware شامل للتحقق والمصادقة والحد من المعدل
- **المعالجات**: معالجات API موحدة لجميع العمليات

### 🔐 نظام المصادقة المتقدم
- **خدمة المصادقة**: خدمة شاملة للمصادقة باستخدام Firebase
- **Hooks**: React hooks للمصادقة وإدارة الحالة
- **الأدوات**: أدوات مساعدة للتحقق من الصلاحيات والأدوار

### 🔄 نظام التكامل
- **محولات النظام القديم**: محولات للربط مع النظام القديم
- **دليل الهجرة**: دليل شامل للهجرة من النظام القديم

## البنية

```
src/lib/core/
├── constants/           # الثوابت
│   ├── api-endpoints.ts
│   ├── file-types.ts
│   ├── validation-rules.ts
│   └── index.ts
├── types/              # الأنواع
│   ├── common.ts
│   ├── api.ts
│   ├── export.ts
│   └── index.ts
├── utils/              # الأدوات
│   ├── string-utils.ts
│   ├── file-utils.ts
│   ├── validation-utils.ts
│   ├── crypto-utils.ts
│   └── index.ts
├── error-handling/     # معالجة الأخطاء
│   ├── error-types.ts
│   ├── client-errors.ts
│   ├── server-errors.ts
│   └── index.ts
├── api/                # نظام API
│   ├── client/
│   │   ├── base-client.ts
│   │   ├── api-client.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth-middleware.ts
│   │   ├── validation-middleware.ts
│   │   ├── rate-limit-middleware.ts
│   │   ├── cors-middleware.ts
│   │   ├── logging-middleware.ts
│   │   └── index.ts
│   ├── handlers/
│   │   ├── base-handler.ts
│   │   ├── auth-handlers.ts
│   │   ├── writing-handlers.ts
│   │   ├── export-handlers.ts
│   │   └── index.ts
│   └── index.ts
├── auth/               # نظام المصادقة
│   ├── auth-service.ts
│   ├── auth-hooks.ts
│   ├── auth-utils.ts
│   └── index.ts
├── integration/        # نظام التكامل
│   ├── legacy-adapter.ts
│   ├── migration-guide.ts
│   └── index.ts
├── __tests__/          # الاختبارات
│   ├── integration.test.ts
│   ├── api.test.ts
│   ├── auth.test.ts
│   └── index.ts
├── index.ts
└── README.md
```

## الاستخدام

### استيراد المكونات

```typescript
// استيراد جميع المكونات
import {
  // الثوابت
  API_ENDPOINTS,
  FILE_TYPES,
  VALIDATION_RULES,

  // الأنواع
  ProcessResult,
  LoadingState,
  ErrorState,
  HttpMethod,
  HttpHeaders,
  HttpRequestOptions,
  HttpResponse,
  HttpError,

  // الأدوات
  cn,
  generateRandomPassword,
  arrayBufferToBase64,
  validateEmail,
  validatePassword,
  validateUrl,
  createHash,
  generateUUID,

  // معالجة الأخطاء
  handleClientError,
  handleServerError,
  createError,
  createServerError,

  // نظام API
  apiClient,
  createApiHandler,
  createAuthApiHandler,
  createValidatedApiHandler,
  withAuth,
  withValidation,
  withRateLimit,
  withCors,
  withLogging,

  // نظام المصادقة
  AuthService,
  useAuth,
  useAuthState,
  useAuthPermissions,
  useCurrentUser,
  AuthUtils,
  UserRole,
  UserPermission,

  // نظام التكامل
  LegacyApiUtilsAdapter,
  LegacyErrorUtilsAdapter,
  LegacyCacheAdapter,
  LegacyQueryKeysAdapter,
  LegacyServicesAdapter,
  LegacyContextAdapter,
  LegacyUtilsAdapter,
} from '@/lib/core';
```

### استخدام نظام API

```typescript
// إنشاء معالج API بسيط
import { createApiHandler } from '@/lib/core';

export const GET = createApiHandler(async (request, context) => {
  return { success: true, message: 'Hello World' };
}, {
  requireAuth: false,
  logging: {
    logRequests: true,
    logResponses: true,
    logErrors: true,
    logPerformance: true,
  },
});

// إنشاء معالج API مع مصادقة
export const POST = createApiHandler(async (request, context) => {
  const data = await request.json();
  return { success: true, data };
}, {
  requireAuth: true,
  authOptions: {
    requireAdmin: false,
    requireSelf: true,
  },
  rateLimit: {
    maxRequests: 10,
    windowMs: 60000,
    errorMessage: 'Too many requests',
  },
  logging: {
    logRequests: true,
    logResponses: true,
    logErrors: true,
    logPerformance: true,
  },
});
```

### استخدام نظام المصادقة

```typescript
// استخدام خدمة المصادقة
import { AuthService } from '@/lib/core';

// تسجيل الدخول
const loginResult = await AuthService.login({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true,
});

if (loginResult.success) {
  console.log('Login successful:', loginResult.user);
} else {
  console.error('Login failed:', loginResult.error);
}

// التسجيل
const registerResult = await AuthService.register({
  email: 'user@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
});

if (registerResult.success) {
  console.log('Registration successful:', registerResult.user);
} else {
  console.error('Registration failed:', registerResult.error);
}
```

### استخدام React Hooks

```typescript
// استخدام hooks المصادقة
import { useAuth, useAuthState, useAuthPermissions } from '@/lib/core';

function MyComponent() {
  const { user, login, logout, loading, error } = useAuth();
  const { isLoggedIn } = useAuthState();
  const { isAdmin, canEdit, canDelete } = useAuthPermissions();

  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123',
    });

    if (result.success) {
      console.log('Login successful');
    } else {
      console.error('Login failed:', result.error);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      console.log('Logout successful');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>Welcome, {user?.email}</p>
          {isAdmin && <p>You are an admin</p>}
          {canEdit && <button>Edit</button>}
          {canDelete && <button>Delete</button>}
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### استخدام الأدوات

```typescript
// استخدام أدوات النصوص
import { cn, sanitizeText, truncateText } from '@/lib/core';

const className = cn('base-class', condition && 'conditional-class');
const sanitized = sanitizeText('<script>alert("xss")</script>');
const truncated = truncateText('This is a long text', 50);

// استخدام أدوات الملفات
import { arrayBufferToBase64, fileToBase64, formatFileSize, validateFile } from '@/lib/core';

const base64 = arrayBufferToBase64(buffer);
const fileBase64 = await fileToBase64(file);
const size = formatFileSize(1024 * 1024); // "1.00 MB"
const isValid = validateFile(file, ['image/jpeg', 'image/png']);

// استخدام أدوات التشفير
import { createHash, generateUUID } from '@/lib/core';

const hash = await createHash('Hello World', 'SHA-256');
const uuid = generateUUID();
```

### استخدام معالجة الأخطاء

```typescript
// معالجة الأخطاء على العميل
import { handleClientError } from '@/lib/core';

try {
  // منطق قد يسبب خطأ
  const result = await someAsyncOperation();
} catch (error) {
  const errorResult = handleClientError(error, 'MyComponent');
  console.error('Error:', errorResult.error);
}

// معالجة الأخطاء على الخادم
import { handleServerError } from '@/lib/core';

try {
  // منطق API
  const result = await processRequest();
  return NextResponse.json(result);
} catch (error) {
  return handleServerError(error, 'API Handler', 500);
}
```

## الاختبار

### تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل اختبارات محددة
npm test -- --grep "Auth Service"

# تشغيل الاختبارات مع التغطية
npm test -- --coverage
```

### أنواع الاختبارات

1. **اختبارات التكامل**: اختبار تفاعل المكونات مع بعضها
2. **اختبارات API**: اختبار معالجات API والـ middleware
3. **اختبارات المصادقة**: اختبار نظام المصادقة والصلاحيات

## الهجرة من النظام القديم

### دليل الهجرة

```typescript
// النظام القديم
import { withAuth, handleApiError, createApiResponse } from '@/lib/api-utils';

// النظام الجديد
import { createApiHandler, handleServerError } from '@/lib/core';

// النظام القديم
export const GET = withAuth(async (request, context) => {
  try {
    // منطق API
    return createApiResponse({ success: true, data }, 200);
  } catch (error) {
    return handleApiError(error, 400);
  }
});

// النظام الجديد
export const GET = createApiHandler(async (request, context) => {
  // منطق API
  return { success: true, data };
}, {
  requireAuth: true,
  logging: {
    logRequests: true,
    logResponses: true,
    logErrors: true,
    logPerformance: true,
  },
});
```

### محولات النظام القديم

```typescript
// استخدام المحولات للتوافق العكسي
import { LegacyApiUtilsAdapter } from '@/lib/core';

// يمكن استخدام المحولات مؤقتاً أثناء الهجرة
const withAuth = LegacyApiUtilsAdapter.withAuth;
const handleApiError = LegacyApiUtilsAdapter.handleApiError;
const createApiResponse = LegacyApiUtilsAdapter.createApiResponse;
```

## المساهمة

### إضافة مكونات جديدة

1. إنشاء الملف في المجلد المناسب
2. إضافة التصدير في `index.ts`
3. كتابة الاختبارات
4. تحديث الوثائق

### إضافة اختبارات جديدة

1. إنشاء ملف اختبار في `__tests__/`
2. كتابة الاختبارات الشاملة
3. التأكد من تغطية جميع الحالات

## الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف LICENSE للتفاصيل.

## الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل، يرجى فتح issue في المستودع أو التواصل مع فريق التطوير.

---

**ملاحظة**: هذا النظام مصمم ليكون مرناً وقابلاً للتوسع. يمكن تخصيصه وتطويره حسب احتياجات المشروع.
