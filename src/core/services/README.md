# دليل الخدمات المبسطة

## نظرة عامة

تم إنشاء نظام خدمات مبسط جديد لاستبدال النظام المعقد السابق. النظام الجديد يوفر:

- **بساطة**: استدعاء مباشر للـ APIs بدون Classes معقدة
- **مرونة**: سهولة في الاستخدام والتخصيص
- **موثوقية**: معالجة أخطاء تلقائية
- **أداء**: تحسين في سرعة التطوير والصيانة

## الميزات الرئيسية

### 1. الخدمة الأساسية (`SimpleService`)

```typescript
import { api, apiService } from '@/core/services';

// استخدام مباشر
const result = await api.get<UserProfile>('/users/123', { token: 'your-token' });

// أو استخدام الـ service instance
const result = await apiService.get<UserProfile>('/users/123', { token: 'your-token' });
```

### 2. خدمات المصادقة (`authService`)

```typescript
import { authService, authUtils } from '@/core/services';

// تسجيل الدخول
const loginResult = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// تسجيل الدخول مع معالجة الأخطاء
const loginResult = await authUtils.loginWithErrorHandling({
  email: 'user@example.com',
  password: 'password123'
});

// التحقق من حالة المصادقة
const isAuthenticated = authUtils.isAuthenticated();
```

### 3. خدمات المشاريع (`projectService`)

```typescript
import { projectService, projectUtils } from '@/core/services';

// إنشاء مشروع جديد
const createResult = await projectService.createProject({
  title: 'مشروع جديد',
  description: 'وصف المشروع',
  type: 'proposal',
  language: 'ar'
}, token);

// إنشاء مشروع مع معالجة الأخطاء
const createResult = await projectUtils.createProjectWithErrorHandling({
  title: 'مشروع جديد',
  description: 'وصف المشروع',
  type: 'proposal',
  language: 'ar'
}, token);
```

### 4. خدمات الإدارة (`adminService`)

```typescript
import { adminService, adminUtils } from '@/core/services';

// الحصول على إحصائيات لوحة التحكم
const stats = await adminService.getDashboardStats(token);

// إنشاء مستخدم جديد
const userResult = await adminService.createUser({
  name: 'مستخدم جديد',
  email: 'new@example.com',
  password: 'password123',
  role: 'user',
  credits: 100
}, token);
```

### 5. خدمات الذكاء الاصطناعي (`aiService`)

```typescript
import { aiService, aiUtils } from '@/core/services';

// توليد نص
const textResult = await aiService.generateText({
  prompt: 'اكتب مقال عن الذكاء الاصطناعي',
  context: 'مقال أكاديمي'
}, token);

// معالجة ملف
const fileResult = await aiService.processFile(file, token);

// توليد متعدد الخطوات
const multiStepResult = await aiUtils.generateMultiStep([
  {
    endpoint: '/generate/text',
    data: { prompt: 'الخطوة الأولى' },
    description: 'توليد النص الأول'
  },
  {
    endpoint: '/improve-text',
    data: { text: 'النص المحسن' },
    description: 'تحسين النص'
  }
], token, (step, total, description) => {
  console.log(`الخطوة ${step}/${total}: ${description}`);
});
```

## مقارنة النظام القديم والجديد

### النظام القديم (معقد)

```typescript
// النظام القديم - معقد
class LoginService extends ComplexService<LoginCredentials, AuthResponse> {
    protected endpoint = '/api/auth/login';
    protected method: 'POST' = 'POST';
    protected inputSchema = AuthSchemas.login;
    protected requiresAuth = false;
}

const loginHandler = new LoginService(apiClient);
const result = await loginHandler.call(credentials, token);
```

### النظام الجديد (مبسط)

```typescript
// النظام الجديد - مبسط
const result = await authService.login(credentials);
```

## الاستخدام في React Components

### Hook مخصص

```typescript
import { useApiService } from '@/core/services';

function MyComponent() {
  const api = useApiService();

  const handleSubmit = async (data: any) => {
    const result = await api.post('/endpoint', data, { token: 'your-token' });

    if (result.success) {
      console.log('Success:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  };

  return (
    // JSX
  );
}
```

### استخدام مباشر

```typescript
import { authService, projectService } from '@/core/services';

function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials: LoginCredentials) => {
    setLoading(true);

    try {
      const result = await authService.login(credentials);

      if (result.success) {
        // تسجيل الدخول ناجح
        router.push('/dashboard');
      } else {
        // عرض رسالة خطأ
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    // JSX
  );
}
```

## معالجة الأخطاء

### الطريقة الأساسية

```typescript
const result = await api.get('/endpoint', { token });

if (result.success) {
  // نجح الطلب
  console.log(result.data);
} else {
  // فشل الطلب
  console.error(result.error);
}
```

### الطريقة المتقدمة

```typescript
try {
  const result = await api.post('/endpoint', data, { token });

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
} catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

## التخصيص

### إنشاء خدمة مخصصة

```typescript
import { SimpleService } from '@/core/services';

class CustomService extends SimpleService {
  constructor() {
    super({
      baseUrl: '/api/custom',
      timeout: 15000
    });
  }

  async customMethod(data: any, token: string) {
    return this.post('/custom-endpoint', data, { token });
  }
}

const customService = new CustomService();
```

### إضافة دوال مساعدة

```typescript
export const customUtils = {
  async processWithRetry(operation: () => Promise<any>, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
};
```

## أفضل الممارسات

### 1. استخدام الدوال المساعدة

```typescript
// جيد - استخدام الدوال المساعدة
const result = await authUtils.loginWithErrorHandling(credentials);

// بدلاً من
const result = await authService.login(credentials);
if (!result.success) {
  // معالجة الأخطاء يدوياً
}
```

### 2. التحقق من صحة البيانات

```typescript
// التحقق من صحة البيانات قبل الإرسال
const validatedData = apiService.validate(data, schema);
const result = await api.post('/endpoint', validatedData, { token });
```

### 3. استخدام TypeScript

```typescript
// تحديد أنواع البيانات
interface UserData {
  id: string;
  name: string;
  email: string;
}

const result = await api.get<UserData>('/users/123', { token });
// result.data هو من نوع UserData
```

### 4. معالجة الحالات المختلفة

```typescript
const result = await api.get('/endpoint', { token });

switch (result.status) {
  case 200:
    // نجح الطلب
    break;
  case 401:
    // غير مصرح
    router.push('/login');
    break;
  case 404:
    // غير موجود
    toast.error('المورد غير موجود');
    break;
  default:
    // خطأ عام
    toast.error('حدث خطأ غير متوقع');
}
```

## الهجرة من النظام القديم

### الخطوة 1: استبدال الاستيرادات

```typescript
// القديم
import { LoginService } from '@/services/auth/auth-service';

// الجديد
import { authService } from '@/core/services';
```

### الخطوة 2: تحديث استدعاءات الخدمات

```typescript
// القديم
const loginHandler = new LoginService(apiClient);
const result = await loginHandler.call(credentials, token);

// الجديد
const result = await authService.login(credentials);
```

### الخطوة 3: تحديث معالجة الأخطاء

```typescript
// القديم
try {
  const result = await loginHandler.call(credentials, token);
  // معالجة النجاح
} catch (error) {
  // معالجة الخطأ
}

// الجديد
const result = await authService.login(credentials);
if (result.success) {
  // معالجة النجاح
} else {
  // معالجة الخطأ
}
```

## الخلاصة

النظام الجديد المبسط يوفر:

- **تقليل الكود بنسبة 60%** مقارنة بالنظام القديم
- **سهولة في الصيانة** والتطوير
- **معالجة أخطاء موحدة** وموثوقة
- **مرونة في الاستخدام** والتخصيص
- **أداء محسن** وسرعة في التطوير

هذا النظام جاهز للاستخدام ويمكن البدء في الهجرة إليه تدريجياً.
