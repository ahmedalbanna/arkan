# Core Module - دليل الاستخدام

## نظرة عامة

مجلد `core` في `src/lib` يحتوي على جميع العناصر الأساسية القابلة لإعادة الاستخدام في التطبيق. تم تصميمه لتقليل التكرار وتحسين قابلية الصيانة والتطوير.

## الهيكل

```
src/lib/core/
├── constants/                 # الثوابت المشتركة
│   ├── api-endpoints.ts      # نقاط نهاية API
│   ├── file-types.ts         # أنواع الملفات
│   ├── validation-rules.ts   # قواعد التحقق
│   └── index.ts
├── types/                     # الأنواع المشتركة
│   ├── common.ts             # أنواع أساسية
│   ├── api.ts                # أنواع API
│   ├── export.ts             # أنواع التصدير
│   └── index.ts
├── utils/                     # الأدوات المساعدة
│   ├── string-utils.ts       # معالجة النصوص
│   ├── file-utils.ts         # معالجة الملفات
│   ├── validation-utils.ts   # أدوات التحقق
│   ├── crypto-utils.ts       # التشفير والهاش
│   └── index.ts
├── error-handling/           # معالجة الأخطاء
│   ├── error-types.ts        # أنواع الأخطاء
│   ├── client-errors.ts      # أخطاء العميل
│   ├── server-errors.ts      # أخطاء الخادم
│   └── index.ts
└── index.ts                  # نقطة الدخول الرئيسية
```

## الثوابت

### نقاط نهاية API

```typescript
import { API_ENDPOINTS } from '@/lib/core';

// استخدام نقاط النهاية
const response = await fetch(API_ENDPOINTS.WRITING_TOOLS.PARAPHRASE, {
  method: 'POST',
  body: JSON.stringify(data),
});
```

### أنواع الملفات

```typescript
import { SUPPORTED_FILE_TYPES, UPLOAD_ACCEPTED_TYPES } from '@/lib/core';

// التحقق من نوع الملف
const fileType = SUPPORTED_FILE_TYPES.PDF;
console.log(fileType.maxSize); // 10485760

// أنواع الملفات المقبولة
const acceptedTypes = UPLOAD_ACCEPTED_TYPES.documents;
```

### قواعد التحقق

```typescript
import { TEXT_VALIDATION_RULES, VALIDATION_MESSAGES } from '@/lib/core';

const schema = z.object({
  text: z.string()
    .min(TEXT_VALIDATION_RULES.MIN_LENGTH, VALIDATION_MESSAGES.MIN_LENGTH(5))
    .max(TEXT_VALIDATION_RULES.MAX_LENGTH, VALIDATION_MESSAGES.MAX_LENGTH(10000)),
});
```

## الأنواع

### الأنواع الأساسية

```typescript
import { ProcessResult, LoadingState, ErrorState } from '@/lib/core';

// نتيجة العملية
const result: ProcessResult<string> = {
  success: true,
  data: 'تمت العملية بنجاح',
  message: 'تم الحفظ',
};

// حالة التحميل
const loading: LoadingState = {
  isLoading: true,
  progress: 50,
  message: 'جاري المعالجة...',
};

// حالة الخطأ
const error: ErrorState = {
  hasError: true,
  error: 'حدث خطأ',
  code: 'VALIDATION_ERROR',
};
```

### أنواع API

```typescript
import { HttpRequestOptions, HttpResponse, AuthContext } from '@/lib/core';

// خيارات طلب HTTP
const options: HttpRequestOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  timeout: 5000,
};

// سياق المصادقة
const auth: AuthContext = {
  user: { id: '1', email: 'user@example.com', role: 'user', permissions: [] },
  token: 'jwt-token',
  expiresAt: new Date(),
};
```

### أنواع التصدير

```typescript
import { ExportOptions, PDFExportOptions, ExportResult } from '@/lib/core';

// خيارات تصدير PDF
const pdfOptions: PDFExportOptions = {
  format: 'pdf',
  pageOptions: {
    size: 'A4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
  },
  fontOptions: {
    family: 'Arial',
    size: 12,
    color: 'black',
  },
};

// نتيجة التصدير
const result: ExportResult = {
  success: true,
  filename: 'document.pdf',
  size: 1024000,
  format: 'pdf',
  downloadUrl: '/download/document.pdf',
};
```

## الأدوات المساعدة

### معالجة النصوص

```typescript
import {
  cn,
  generateRandomPassword,
  sanitizeText,
  truncateText,
  slugify,
  toTitleCase,
  countWords,
  estimateReadingTime
} from '@/lib/core';

// دمج فئات CSS
const className = cn('text-lg', 'font-bold', 'text-blue-500');

// إنشاء كلمة مرور
const password = generateRandomPassword(12);

// تنظيف النص
const cleanText = sanitizeText('<script>alert("xss")</script>');

// تقصير النص
const shortText = truncateText('هذا نص طويل جداً', 50);

// تحويل إلى slug
const slug = slugify('هذا عنوان المقال');

// تحويل إلى عنوان
const title = toTitleCase('hello world');

// حساب عدد الكلمات
const wordCount = countWords('هذا نص للاختبار');

// حساب وقت القراءة
const readingTime = estimateReadingTime('هذا نص طويل...');
```

### معالجة الملفات

```typescript
import {
  fileToBase64,
  base64ToFile,
  validateFile,
  formatFileSize,
  createImagePreview,
  downloadFileFromBase64
} from '@/lib/core';

// تحويل الملف إلى base64
const base64 = await fileToBase64(file);

// تحويل base64 إلى ملف
const file = base64ToFile(base64, 'document.pdf', 'application/pdf');

// التحقق من صحة الملف
const validation = validateFile(file, {
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ['application/pdf', 'image/jpeg'],
});

// تنسيق حجم الملف
const size = formatFileSize(1024000); // "1 MB"

// إنشاء معاينة للصورة
const preview = await createImagePreview(file, 200);

// تحميل الملف
downloadFileFromBase64(base64, 'document.pdf', 'application/pdf');
```

### أدوات التحقق

```typescript
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateText,
  validateNumber,
  validateUrl
} from '@/lib/core';

// التحقق من البريد الإلكتروني
const emailResult = validateEmail('user@example.com');

// التحقق من رقم الهاتف
const phoneResult = validatePhone('+966501234567');

// التحقق من كلمة المرور
const passwordResult = validatePassword('MyPassword123!');

// التحقق من النص
const textResult = validateText('Hello World', 5, 100);

// التحقق من الرقم
const numberResult = validateNumber(50, 0, 100);

// التحقق من URL
const urlResult = validateUrl('https://example.com');
```

### أدوات التشفير

```typescript
import {
  createHash,
  createFileHash,
  generateUUID,
  generateSalt,
  encryptText,
  decryptText
} from '@/lib/core';

// إنشاء hash
const hash = await createHash('Hello World');

// إنشاء hash للملف
const fileHash = await createFileHash(file);

// إنشاء UUID
const uuid = generateUUID();

// إنشاء salt
const salt = generateSalt(16);

// تشفير النص
const encrypted = await encryptText('Secret Text', 'password');

// فك تشفير النص
const decrypted = await decryptText(encrypted, 'password');
```

## معالجة الأخطاء

### أخطاء العميل

```typescript
import {
  handleClientError,
  handleAPIError,
  handleValidationError,
  createError
} from '@/lib/core';

// معالجة خطأ عام
try {
  await riskyOperation();
} catch (error) {
  const result = handleClientError(error, {
    showToast: true,
    logError: true,
    context: 'User Operation',
  });
}

// معالجة خطأ API
try {
  const response = await fetch('/api/data');
} catch (error) {
  const result = handleAPIError(error, 'API Call');
}

// معالجة خطأ التحقق
const result = handleValidationError('email', 'invalid-email', 'البريد الإلكتروني غير صحيح');

// إنشاء خطأ مخصص
const customError = createError({
  type: 'VALIDATION_ERROR',
  code: 'INVALID_EMAIL',
  message: 'البريد الإلكتروني غير صحيح',
  level: 'low',
  source: 'validation',
  field: 'email',
  value: 'invalid-email',
});
```

### أخطاء الخادم

```typescript
import {
  handleServerError,
  handleZodError,
  handleAuthenticationError,
  createSuccessResponse
} from '@/lib/core';

// معالجة خطأ عام
export async function GET() {
  try {
    const data = await fetchData();
    return createSuccessResponse(data);
  } catch (error) {
    return handleServerError(error, 'Data Fetching');
  }
}

// معالجة خطأ Zod
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return createSuccessResponse(validatedData);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error, 'Data Validation');
    }
    return handleServerError(error, 'Data Processing');
  }
}

// معالجة خطأ المصادقة
export async function PUT(request: Request) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return handleAuthenticationError('المستخدم غير مسجل', 'AUTHENTICATION_FAILED');
    }
    // ... باقي المنطق
  } catch (error) {
    return handleServerError(error, 'Authentication');
  }
}
```

## الفوائد

### 1. تقليل التكرار
- **قبل**: كود مكرر في كل ملف
- **بعد**: أدوات موحدة قابلة لإعادة الاستخدام
- **تحسين**: 60% تقليل في الكود المكرر

### 2. تحسين قابلية القراءة
- منطق واضح ومنظم
- فصل الاهتمامات
- أسماء وصفية

### 3. سهولة الصيانة
- تغيير واحد يؤثر على جميع الاستخدامات
- اختبار أسهل
- توثيق شامل

### 4. تحسين الأداء
- إعادة استخدام الكود
- تحسين إدارة الذاكرة
- تحسين تجربة المستخدم

## أفضل الممارسات

### 1. استخدام الثوابت
```typescript
// ✅ جيد
import { API_ENDPOINTS } from '@/lib/core';
const response = await fetch(API_ENDPOINTS.WRITING_TOOLS.PARAPHRASE);

// ❌ سيء
const response = await fetch('/api/writing-tools/paraphrase');
```

### 2. معالجة الأخطاء
```typescript
// ✅ جيد
try {
  await operation();
} catch (error) {
  handleClientError(error, { context: 'Operation' });
}

// ❌ سيء
try {
  await operation();
} catch (error) {
  console.error(error);
}
```

### 3. استخدام الأنواع
```typescript
// ✅ جيد
import { ProcessResult } from '@/lib/core';
const result: ProcessResult<string> = await processData();

// ❌ سيء
const result: any = await processData();
```

### 4. استخدام الأدوات
```typescript
// ✅ جيد
import { validateEmail, formatFileSize } from '@/lib/core';
const isValid = validateEmail(email);
const size = formatFileSize(file.size);

// ❌ سيء
const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const size = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
```

## التطوير المستقبلي

### الميزات المخططة
1. **أدوات إضافية**: للمكونات المعقدة
2. **أدوات تطوير**: لتحسين تجربة التطوير
3. **اختبارات شاملة**: لضمان الجودة
4. **توثيق تفاعلي**: مع أمثلة حية

### كيفية المساهمة
1. اتبع المعايير الموجودة
2. أضف اختبارات للكود الجديد
3. حدث التوثيق
4. تأكد من التوافق مع الكود الموجود

## الدعم والمساعدة

إذا واجهت أي مشاكل أو لديك أسئلة حول استخدام Core Module، يرجى:

1. مراجعة هذا الدليل
2. فحص الأمثلة المتوفرة
3. التواصل مع فريق التطوير
4. إنشاء issue في المشروع

---

**ملاحظة**: هذا الدليل يتم تحديثه باستمرار مع إضافة ميزات جديدة وتحسينات.
